import { HttpError } from "./http";

// Почта у аккаунтов AniTier (2026-11-17, как у StalZone Calc AI): коды из писем для регистрации,
// входа и привязки почты.
//
// Почту в базе не храним — только отпечаток HMAC-SHA256 с секретом EMAIL_PEPPER (найти аккаунт
// по введённой почте можно, восстановить почту из базы — нет) и маску «i•••@gmail.com». Письма
// отправляет Resend (ключ RESEND_API_KEY кладёт владелец сайта); бесплатный тариф — 100 писем в
// день, поэтому свой дневной потолок чуть ниже.

export type EmailPurpose = "register" | "login" | "link";

const EMAIL_RE = /^[^\s@<>()",;:\\[\]]{1,64}@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/;
const CODE_TTL_MS = 10 * 60_000;
/** Новый код на ту же почту — не чаще раза в минуту. */
const RESEND_COOLDOWN_MS = 60_000;
/** Столько неверных вводов — и код сгорает, нужен новый. */
const MAX_CODE_ATTEMPTS = 5;
const DEFAULT_DAILY_LIMIT = 90;
const DEFAULT_FROM = "AniTier <no-reply@stalzoneai.com>";
const SITE = "https://roketax2.github.io/anitier/";

type EmailEnv = Env & {
  RESEND_API_KEY?: string;
  EMAIL_PEPPER?: string;
  EMAIL_FROM?: string;
  EMAIL_DAILY_LIMIT?: string;
  /** Только в локальном .dev.vars: письмо не отправляется, код возвращается в ответе. */
  EMAIL_DEV_ECHO?: string;
};

const encoder = new TextEncoder();

function hex(bytes: ArrayBuffer | Uint8Array): string {
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(text: string): Promise<string> {
  return hex(await crypto.subtle.digest("SHA-256", encoder.encode(text)));
}

function devEcho(env: Env): boolean {
  return (env as EmailEnv).EMAIL_DEV_ECHO === "1";
}

/** Почта на сайте работает, когда есть секрет для отпечатков и чем отправлять письма. */
export function emailEnabled(env: Env): boolean {
  const e = env as EmailEnv;
  return Boolean(e.EMAIL_PEPPER) && (Boolean(e.RESEND_API_KEY) || devEcho(env));
}

function requireEnabled(env: Env): void {
  if (!emailEnabled(env)) throw new HttpError(503, "Вход по почте пока не работает");
}

/** Почта из формы: без пробелов, в нижнем регистре; не похожа на почту — 400. */
export function normalizeEmail(value: unknown): string {
  if (typeof value !== "string") throw new HttpError(400, "Введите почту");
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) throw new HttpError(400, "Похоже, в почте ошибка");
  return email;
}

/** Отпечаток почты: HMAC с секретом сервера — без секрета перебором не восстановить. */
export async function emailHash(env: Env, email: string): Promise<string> {
  requireEnabled(env);
  const key = await crypto.subtle.importKey("raw", encoder.encode((env as EmailEnv).EMAIL_PEPPER!), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, encoder.encode("email:" + email)));
}

/** Маска для профиля: первая буква и домен — «i•••@gmail.com». */
export function emailMask(email: string): string {
  const [local, domain] = email.split("@");
  return `${local.slice(0, 1)}•••@${domain}`;
}

/** 6 цифр без перекоса в пользу малых чисел. */
function newCode(): string {
  const limit = Math.floor(0xffffffff / 1_000_000) * 1_000_000;
  for (;;) {
    const n = crypto.getRandomValues(new Uint32Array(1))[0];
    if (n < limit) return String(n % 1_000_000).padStart(6, "0");
  }
}

function codeHash(hash: string, purpose: EmailPurpose, code: string): Promise<string> {
  return sha256Hex(`code:${purpose}:${hash}:${code}`);
}

/** Дневной потолок писем: считаем до отправки, чтобы не выйти за бесплатный тариф. */
async function countDailySend(env: Env): Promise<void> {
  const day = new Date().toISOString().slice(0, 10);
  const limit = Number((env as EmailEnv).EMAIL_DAILY_LIMIT) || DEFAULT_DAILY_LIMIT;
  const row = await env.DB.prepare(
    "INSERT INTO email_daily (day, count) VALUES (?1, 1) ON CONFLICT(day) DO UPDATE SET count = count + 1 RETURNING count",
  )
    .bind(day)
    .first<{ count: number }>();
  if ((row?.count ?? 0) > limit) {
    throw new HttpError(503, "Сегодня письма закончились — попробуйте завтра или войдите без почты");
  }
}

function letter(code: string, purpose: EmailPurpose, locale: string): { subject: string; text: string; html: string } {
  const en = locale === "en";
  const action = en
    ? { register: "create your account", login: "sign in", link: "link this email to your account" }[purpose]
    : { register: "создать аккаунт", login: "войти", link: "привязать почту к аккаунту" }[purpose];
  const subject = en ? `${code} — your AniTier code` : `${code} — код для AniTier`;
  const lines = en
    ? [`Your code to ${action} on AniTier:`, code, "It is valid for 10 minutes.", "If it wasn't you, just ignore this email."]
    : [`Код, чтобы ${action} на AniTier:`, code, "Он действует 10 минут.", "Если это были не вы, просто удалите письмо."];
  const text = `${lines[0]}\n\n${lines[1]}\n\n${lines[2]}\n${lines[3]}\n\n${SITE}`;
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#222;line-height:1.5">
<p>${lines[0]}</p>
<p style="font-size:28px;font-weight:bold;letter-spacing:4px;margin:16px 0">${lines[1]}</p>
<p>${lines[2]}<br>${lines[3]}</p>
<p style="color:#888;font-size:13px"><a href="${SITE}" style="color:#e0336a">roketax2.github.io/anitier</a></p>
</div>`;
  return { subject, text, html };
}

async function sendLetter(env: Env, to: string, code: string, purpose: EmailPurpose, locale: string): Promise<void> {
  const e = env as EmailEnv;
  const { subject, text, html } = letter(code, purpose, locale);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${e.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: e.EMAIL_FROM || DEFAULT_FROM, to: [to], subject, text, html }),
  });
  if (!res.ok) {
    console.error("resend", res.status, (await res.text()).slice(0, 300));
    throw new HttpError(502, "Не удалось отправить письмо — попробуйте позже");
  }
}

/**
 * Новый код на почту. subject — к чему код привязан: id аккаунта для привязки почты, логин для
 * регистрации (код подойдёт только к нему). Возвращает код только в локальной проверке.
 */
export async function sendEmailCode(
  env: Env,
  email: string,
  hash: string,
  purpose: EmailPurpose,
  subject: string,
  locale: string,
): Promise<{ devCode?: string }> {
  requireEnabled(env);
  const now = Date.now();
  const previous = await env.DB.prepare("SELECT sent_at FROM email_codes WHERE email_hash = ? AND purpose = ?")
    .bind(hash, purpose)
    .first<{ sent_at: number }>();
  if (previous && now - previous.sent_at < RESEND_COOLDOWN_MS) {
    throw new HttpError(429, "Код уже отправлен — новый можно запросить через минуту");
  }
  if (!devEcho(env)) await countDailySend(env);

  const code = newCode();
  await env.DB.prepare(
    `INSERT INTO email_codes (email_hash, purpose, code_hash, subject, sent_at, expires_at, attempts) VALUES (?, ?, ?, ?, ?, ?, 0)
     ON CONFLICT(email_hash, purpose) DO UPDATE SET code_hash = excluded.code_hash, subject = excluded.subject,
       sent_at = excluded.sent_at, expires_at = excluded.expires_at, attempts = 0`,
  )
    .bind(hash, purpose, await codeHash(hash, purpose, code), subject, now, now + CODE_TTL_MS)
    .run();

  if (devEcho(env)) return { devCode: code };
  try {
    await sendLetter(env, email, code, purpose, locale);
  } catch (err) {
    // Письмо не ушло — код не должен мешать повторной попытке через минуту.
    await env.DB.prepare("DELETE FROM email_codes WHERE email_hash = ? AND purpose = ?").bind(hash, purpose).run();
    throw err;
  }
  return {};
}

/**
 * Проверить и погасить код. Неверный — +1 попытка (после пятой код сгорает); подходит только к
 * тому же subject, к которому выдан.
 */
export async function consumeEmailCode(env: Env, hash: string, purpose: EmailPurpose, code: unknown, subject: string): Promise<void> {
  if (typeof code !== "string" || !/^\d{6}$/.test(code.trim())) throw new HttpError(400, "Код из письма — 6 цифр");
  const row = await env.DB.prepare("SELECT code_hash, subject, expires_at, attempts FROM email_codes WHERE email_hash = ? AND purpose = ?")
    .bind(hash, purpose)
    .first<{ code_hash: string; subject: string; expires_at: number; attempts: number }>();
  if (!row || row.expires_at < Date.now()) {
    if (row) await env.DB.prepare("DELETE FROM email_codes WHERE email_hash = ? AND purpose = ?").bind(hash, purpose).run();
    throw new HttpError(400, "Код устарел — запросите новый");
  }
  const expected = await codeHash(hash, purpose, code.trim());
  const ok = expected.length === row.code_hash.length && crypto.subtle.timingSafeEqual(encoder.encode(expected), encoder.encode(row.code_hash));
  if (!ok || row.subject !== subject) {
    if (row.attempts + 1 >= MAX_CODE_ATTEMPTS) {
      await env.DB.prepare("DELETE FROM email_codes WHERE email_hash = ? AND purpose = ?").bind(hash, purpose).run();
      throw new HttpError(400, "Слишком много неверных кодов — запросите новый");
    }
    await env.DB.prepare("UPDATE email_codes SET attempts = attempts + 1 WHERE email_hash = ? AND purpose = ?").bind(hash, purpose).run();
    throw new HttpError(400, "Неверный код");
  }
  await env.DB.prepare("DELETE FROM email_codes WHERE email_hash = ? AND purpose = ?").bind(hash, purpose).run();
}
