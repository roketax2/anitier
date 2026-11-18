import { type EmailPurpose, consumeEmailCode, emailEnabled, emailHash, emailMask, normalizeEmail, sendEmailCode } from "./email";
import { verifyGoogleCredential } from "./google";
import { HttpError, json, readJson } from "./http";
import { isAdmin, parseRewards } from "./promo";

// Аккаунты AniTier (2026-11-17) — тот же код, что у StalZone Calc AI: топ виден на всех
// устройствах. Способов завести аккаунт три (просьба автора): без почты (логин, пароль и код
// восстановления), с почтой (вход и сброс пароля кодом из письма) и через Google (без пароля).
// Почту и Google можно привязать и отвязать в профиле — пока остаётся хоть один способ войти.
//
// Пароль растягивается в браузере (PBKDF2, 200 000 повторов) — сюда приходит только результат,
// а храним SHA-256 от него с личной солью. На бесплатном тарифе у Worker 10 мс процессора на
// запрос, тяжёлое хеширование здесь не уложилось бы; утёкшая база всё равно потребует
// перебирать пароли через те же 200 000 повторов на каждую попытку.

const LOGIN_RE = /^[A-Za-z0-9_.-]{3,24}$/;
const CLIENT_HASH_RE = /^[0-9a-f]{64}$/;
const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;
const DAY_MS = 24 * 3600_000;
/** Вход живёт полгода и продлевается, пока им пользуются. */
const SESSION_MS = 180 * DAY_MS;
/** После стольких неверных паролей подряд вход по логину замораживается. */
const LOCK_AFTER_FAILS = 10;
const LOCK_MS = 15 * 60_000;
const RECOVERY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
/** Вход по почте или Google не старше этого — «свежий»: можно задать пароль без старого и удалить аккаунт без пароля. */
const FRESH_MS = 15 * 60_000;

type UserRow = {
  id: string;
  login: string;
  /** Пусто — у аккаунта нет пароля (создан через Google). */
  pass_salt: string;
  pass_hash: string;
  /** Пусто — кода восстановления нет (аккаунт с почтой или через Google). */
  recovery_hash: string;
  created_at: number;
  failed_logins: number;
  locked_until: number;
  email_hash: string | null;
  email_mask: string | null;
  google_sub: string | null;
  share_id: string | null;
  nick?: string | null;
  avatar?: string | null;
  frame?: string | null;
  rewards?: string | null;
};
type SessionVia = "password" | "recovery" | "email" | "google";
export type SessionUser = { userId: string; login: string; createdAt: number; tokenHash: string; via: SessionVia; sessionCreatedAt: number };

const encoder = new TextEncoder();

function hex(bytes: ArrayBuffer | Uint8Array): string {
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(text: string): Promise<string> {
  return hex(await crypto.subtle.digest("SHA-256", encoder.encode(text)));
}

function randomHex(bytes: number): string {
  return hex(crypto.getRandomValues(new Uint8Array(bytes)));
}

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Код восстановления: 16 знаков без похожих (0/O, 1/I), группами по 4 — переписать легко. */
function newRecoveryCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const chars = Array.from(bytes, (b) => RECOVERY_ALPHABET[b % RECOVERY_ALPHABET.length]).join("");
  return chars.match(/.{4}/g)!.join("-");
}

function recoveryHash(code: string): Promise<string> {
  return sha256Hex("recovery:" + code.toUpperCase().replace(/[^A-Z0-9]/g, ""));
}

function passwordHash(salt: string, clientHash: string): Promise<string> {
  return sha256Hex(`${salt}:${clientHash}`);
}

function sameHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.subtle.timingSafeEqual(encoder.encode(a), encoder.encode(b));
}

function requireLogin(value: unknown): string {
  if (typeof value !== "string" || !LOGIN_RE.test(value)) {
    throw new HttpError(400, "Логин — от 3 до 24 символов: латиница, цифры, точка, дефис, подчёркивание");
  }
  return value;
}

function requireClientHash(value: unknown): string {
  if (typeof value !== "string" || !CLIENT_HASH_RE.test(value)) throw new HttpError(400, "Некорректный пароль");
  return value;
}

/** Сколько раз с этого адреса уже пытались; адрес храним только хешем. */
export async function limitByIp(env: Env, request: Request, action: string, limit: number, windowMs: number): Promise<void> {
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const key = `${action}:${(await sha256Hex("ip:" + ip)).slice(0, 32)}`;
  const now = Date.now();
  const row = await env.DB.prepare(
    `INSERT INTO rate_limits (key, count, reset_at) VALUES (?1, 1, ?2)
     ON CONFLICT(key) DO UPDATE SET
       count = CASE WHEN reset_at < ?3 THEN 1 ELSE count + 1 END,
       reset_at = CASE WHEN reset_at < ?3 THEN ?2 ELSE reset_at END
     RETURNING count`,
  )
    .bind(key, now + windowMs, now)
    .first<{ count: number }>();
  if ((row?.count ?? 0) > limit) throw new HttpError(429, "Слишком много попыток. Попробуйте позже.");
}

async function findUser(env: Env, login: string): Promise<UserRow | null> {
  return env.DB.prepare("SELECT * FROM users WHERE login_lower = ?").bind(login.toLowerCase()).first<UserRow>();
}

async function findUserById(env: Env, id: string): Promise<UserRow | null> {
  return env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(id).first<UserRow>();
}

async function findUserByEmail(env: Env, hash: string): Promise<UserRow | null> {
  return env.DB.prepare("SELECT * FROM users WHERE email_hash = ?").bind(hash).first<UserRow>();
}

async function findUserByGoogle(env: Env, sub: string): Promise<UserRow | null> {
  return env.DB.prepare("SELECT * FROM users WHERE google_sub = ?").bind(sub).first<UserRow>();
}

async function loginTaken(env: Env, login: string): Promise<boolean> {
  return Boolean(await env.DB.prepare("SELECT 1 AS x FROM users WHERE login_lower = ?").bind(login.toLowerCase()).first());
}

/** Аккаунт, в который вошли: свежая строка из базы (в сессии только логин и дата). */
async function sessionAccount(env: Env, session: SessionUser): Promise<UserRow> {
  const user = await findUserById(env, session.userId);
  if (!user) throw new HttpError(401, "Нужно войти в аккаунт");
  return user;
}

function hasPassword(user: UserRow): boolean {
  return user.pass_hash !== "";
}

/** Вошли по почте или через Google только что — подтверждение личности не хуже пароля. */
function freshStrongSession(session: SessionUser): boolean {
  return (session.via === "email" || session.via === "google") && Date.now() - session.sessionCreatedAt < FRESH_MS;
}

/** Ограничение по ключу (почта, а не адрес) — та же таблица, что и у лимитов по IP. */
async function limitByKey(env: Env, key: string, limit: number, windowMs: number): Promise<void> {
  const now = Date.now();
  const row = await env.DB.prepare(
    `INSERT INTO rate_limits (key, count, reset_at) VALUES (?1, 1, ?2)
     ON CONFLICT(key) DO UPDATE SET
       count = CASE WHEN reset_at < ?3 THEN 1 ELSE count + 1 END,
       reset_at = CASE WHEN reset_at < ?3 THEN ?2 ELSE reset_at END
     RETURNING count`,
  )
    .bind(key, now + windowMs, now)
    .first<{ count: number }>();
  if ((row?.count ?? 0) > limit) throw new HttpError(429, "Слишком много попыток. Попробуйте позже.");
}

function assertNotLocked(user: UserRow): void {
  const left = user.locked_until - Date.now();
  if (left > 0) throw new HttpError(429, `Слишком много неверных попыток. Попробуйте через ${Math.ceil(left / 60_000)} мин.`);
}

/** Неверный пароль или код: считаем подряд идущие, после десятого — пауза на 15 минут. */
async function registerFailure(env: Env, user: UserRow): Promise<void> {
  const fails = user.failed_logins + 1;
  if (fails >= LOCK_AFTER_FAILS) {
    await env.DB.prepare("UPDATE users SET failed_logins = 0, locked_until = ? WHERE id = ?").bind(Date.now() + LOCK_MS, user.id).run();
  } else {
    await env.DB.prepare("UPDATE users SET failed_logins = ? WHERE id = ?").bind(fails, user.id).run();
  }
}

async function checkPassword(env: Env, user: UserRow, clientHash: string): Promise<void> {
  if (!hasPassword(user)) throw new HttpError(401, "У этого аккаунта нет пароля — войдите через Google или по коду на почту");
  assertNotLocked(user);
  if (!sameHex(await passwordHash(user.pass_salt, clientHash), user.pass_hash)) {
    await registerFailure(env, user);
    throw new HttpError(401, "Неверный логин или пароль");
  }
  if (user.failed_logins > 0) await env.DB.prepare("UPDATE users SET failed_logins = 0 WHERE id = ?").bind(user.id).run();
}

async function createSession(env: Env, userId: string, via: SessionVia = "password"): Promise<string> {
  const token = randomToken();
  const now = Date.now();
  await env.DB.batch([
    // Заодно чистим истёкшие входы этого игрока — отдельного планировщика нет.
    env.DB.prepare("DELETE FROM sessions WHERE user_id = ? AND expires_at < ?").bind(userId, now),
    env.DB.prepare("INSERT INTO sessions (token_hash, user_id, created_at, last_used_at, expires_at, via) VALUES (?, ?, ?, ?, ?, ?)").bind(
      await sha256Hex(token),
      userId,
      now,
      now,
      now + SESSION_MS,
      via,
    ),
  ]);
  return token;
}

/** Кто зашёл: по токену из заголовка Authorization. Нет или истёк — 401. */
export async function requireUser(env: Env, request: Request): Promise<SessionUser> {
  const token = (request.headers.get("Authorization") ?? "").replace(/^Bearer /, "");
  if (!TOKEN_RE.test(token)) throw new HttpError(401, "Нужно войти в аккаунт");
  const tokenHash = await sha256Hex(token);
  const row = await env.DB.prepare(
    "SELECT s.user_id, s.last_used_at, s.expires_at, s.via, s.created_at AS session_created_at, u.login, u.created_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?",
  )
    .bind(tokenHash)
    .first<{ user_id: string; last_used_at: number; expires_at: number; via: SessionVia; session_created_at: number; login: string; created_at: number }>();
  const now = Date.now();
  if (!row || row.expires_at < now) {
    if (row) await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
    throw new HttpError(401, "Вход устарел — войдите снова");
  }
  // Продлеваем вход не чаще раза в сутки — каждая запись в базу на счету.
  if (now - row.last_used_at > DAY_MS) {
    await env.DB.prepare("UPDATE sessions SET last_used_at = ?, expires_at = ? WHERE token_hash = ?").bind(now, now + SESSION_MS, tokenHash).run();
  }
  return { userId: row.user_id, login: row.login, createdAt: row.created_at, tokenHash, via: row.via, sessionCreatedAt: row.session_created_at };
}

/** Вошёл, если есть рабочий токен; иначе null — для страниц, которые видны и без аккаунта. */
export async function optionalUser(env: Env, request: Request): Promise<SessionUser | null> {
  if (!request.headers.get("Authorization")) return null;
  try {
    return await requireUser(env, request);
  } catch {
    return null;
  }
}

/** Что сайт знает об аккаунте: логин, дата, маска почты, привязан ли Google, есть ли пароль, ссылка на топ. */
export function publicUser(env: Env, user: UserRow) {
  const rw = parseRewards(user.rewards);
  return {
    login: user.login,
    createdAt: user.created_at,
    email: user.email_mask ?? null,
    google: Boolean(user.google_sub),
    hasPassword: hasPassword(user),
    shareId: user.share_id ?? null,
    nick: user.nick ?? null,
    avatar: user.avatar ?? null,
    frame: user.frame ?? null,
    rewards: rw.n || rw.all || rw.frames.length || rw.badges.length ? rw : null,
    admin: isAdmin(env, user.login) || undefined,
  };
}

/** Ник: любые буквы и эмодзи, 2–24 знака, без управляющих символов; пусто — показывать логин. */
// управляющие и невидимые знаки (переводы строк, смена направления текста)
const INVISIBLE_RE = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/gu;
export function cleanNick(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") throw new HttpError(400, "Некорректный ник");
  const nick = value.replace(INVISIBLE_RE, "").replace(/\s+/g, " ").trim();
  if (!nick) return null;
  const len = [...nick].length;
  if (len < 2 || len > 24) throw new HttpError(400, "Ник — от 2 до 24 знаков");
  return nick;
}

const AVATAR_DATA_RE = /^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/]+=*$/;
const AVATAR_URL_RE = /^https:\/\/(?:[a-z0-9-]+\.)?shikimori\.(?:io|one)\/[A-Za-z0-9/_.\-]+\.(?:webp|jpe?g|png)(?:\?\d+)?$/;
/** Аватарка: своя маленькая картинка или постер с Shikimori; пусто — буква ника. */
export function cleanAvatar(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") throw new HttpError(400, "Некорректная аватарка");
  if (AVATAR_DATA_RE.test(value)) {
    if (value.length > 48_000) throw new HttpError(413, "Аватарка слишком большая");
    return value;
  }
  if (value.length <= 300 && AVATAR_URL_RE.test(value)) return value;
  throw new HttpError(400, "Некорректная аватарка");
}

/** Сменить ник и аватарку. Поле не прислали — не трогаем; null — убрать. */
async function updateProfile(env: Env, request: Request): Promise<Response> {
  const session = await requireUser(env, request);
  const body = await readJson(request);
  const user = await sessionAccount(env, session);
  const nick = "nick" in body ? cleanNick(body.nick) : (user.nick ?? null);
  const avatar = "avatar" in body ? cleanAvatar(body.avatar) : (user.avatar ?? null);
  // рамку открывают достижения на сайте; сервер проверяет только вид id — это украшение
  let frame = user.frame ?? null;
  if ("frame" in body) {
    if (body.frame !== null && body.frame !== "" && (typeof body.frame !== "string" || !/^[a-z][a-z0-9_]{0,31}$/.test(body.frame))) throw new HttpError(400, "Некорректная рамка");
    frame = (body.frame as string) || null;
  }
  await env.DB.prepare("UPDATE users SET nick = ?, avatar = ?, frame = ? WHERE id = ?").bind(nick, avatar, frame, user.id).run();
  return json({ user: publicUser(env, { ...user, nick, avatar, frame }) });
}

export { findUserById, sessionAccount, randomToken };

async function insertUser(
  env: Env,
  fields: { login: string; salt: string; passHash: string; recoveryHash: string; emailHash?: string; emailMask?: string; googleSub?: string },
): Promise<UserRow> {
  const user: UserRow = {
    id: randomHex(16),
    login: fields.login,
    pass_salt: fields.salt,
    pass_hash: fields.passHash,
    recovery_hash: fields.recoveryHash,
    created_at: Date.now(),
    failed_logins: 0,
    locked_until: 0,
    email_hash: fields.emailHash ?? null,
    email_mask: fields.emailMask ?? null,
    google_sub: fields.googleSub ?? null,
    share_id: null,
  };
  try {
    await env.DB.prepare(
      "INSERT INTO users (id, login, login_lower, pass_salt, pass_hash, recovery_hash, created_at, email_hash, email_mask, google_sub) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
      .bind(user.id, user.login, user.login.toLowerCase(), user.pass_salt, user.pass_hash, user.recovery_hash, user.created_at, user.email_hash, user.email_mask, user.google_sub)
      .run();
  } catch (e) {
    const text = String(e);
    if (text.includes("UNIQUE") && text.includes("email")) throw new HttpError(409, "Эта почта уже привязана к другому аккаунту");
    if (text.includes("UNIQUE") && text.includes("google")) throw new HttpError(409, "Этот Google уже привязан к другому аккаунту");
    if (text.includes("UNIQUE")) throw new HttpError(409, "Этот логин уже занят");
    throw e;
  }
  return user;
}

/**
 * Регистрация. Без почты — код восстановления в ответе (показать один раз). С почтой — сначала
 * код на почту (/api/auth/email/code, цель register, тот же логин), здесь его проверяем; кода
 * восстановления нет, пароль сбрасывается через почту.
 */
async function register(env: Env, request: Request): Promise<Response> {
  const body = await readJson(request);
  const login = requireLogin(body.login);
  const clientHash = requireClientHash(body.passwordHash);
  // У мобильных операторов один адрес на многих людей — лимиты с запасом.
  await limitByIp(env, request, "register", 20, 3600_000);

  const salt = randomHex(16);
  const passHash = await passwordHash(salt, clientHash);
  if (body.email !== undefined && body.email !== null && body.email !== "") {
    const email = normalizeEmail(body.email);
    const hash = await emailHash(env, email);
    if (await loginTaken(env, login)) throw new HttpError(409, "Этот логин уже занят");
    await consumeEmailCode(env, hash, "register", body.emailCode, login.toLowerCase());
    const user = await insertUser(env, { login, salt, passHash, recoveryHash: "", emailHash: hash, emailMask: emailMask(email) });
    return json({ token: await createSession(env, user.id, "email"), user: publicUser(env, user) });
  }

  const recoveryCode = newRecoveryCode();
  const user = await insertUser(env, { login, salt, passHash, recoveryHash: await recoveryHash(recoveryCode) });
  return json({ token: await createSession(env, user.id), user: publicUser(env, user), recoveryCode });
}

async function login(env: Env, request: Request): Promise<Response> {
  const body = await readJson(request);
  const loginName = requireLogin(body.login);
  const clientHash = requireClientHash(body.passwordHash);
  await limitByIp(env, request, "login", 60, 15 * 60_000);
  const user = await findUser(env, loginName);
  if (!user) throw new HttpError(401, "Неверный логин или пароль");
  await checkPassword(env, user, clientHash);
  return json({ token: await createSession(env, user.id), user: publicUser(env, user) });
}

// ── Почта ──────────────────────────────────────────────────────────────────────────────────

/**
 * Код на почту. Цели: register (новый аккаунт с этим логином — почта и логин должны быть
 * свободны), login (вход и сброс пароля — аккаунт с этой почтой должен быть), link (привязать
 * почту к своему аккаунту — нужен вход).
 */
async function emailCode(env: Env, request: Request): Promise<Response> {
  const body = await readJson(request);
  const purpose = body.purpose;
  if (purpose !== "register" && purpose !== "login" && purpose !== "link") throw new HttpError(400, "Неизвестная цель кода");
  const email = normalizeEmail(body.email);
  const locale = body.locale === "en" ? "en" : "ru";
  await limitByIp(env, request, "email-code", 15, 3600_000);
  const hash = await emailHash(env, email);
  await limitByKey(env, `email-code:${hash.slice(0, 32)}`, 6, 3600_000);

  let subject = "";
  const owner = await findUserByEmail(env, hash);
  if (purpose === "register") {
    const login = requireLogin(body.login);
    if (owner) throw new HttpError(409, "Эта почта уже привязана к другому аккаунту — войдите по коду на почту");
    if (await loginTaken(env, login)) throw new HttpError(409, "Этот логин уже занят");
    subject = login.toLowerCase();
  } else if (purpose === "login") {
    if (!owner) throw new HttpError(404, "Аккаунта с этой почтой нет — проверьте почту или создайте аккаунт");
    subject = owner.id;
  } else {
    const session = await requireUser(env, request);
    if (owner && owner.id !== session.userId) throw new HttpError(409, "Эта почта уже привязана к другому аккаунту");
    if (owner) throw new HttpError(409, "Эта почта уже привязана к вашему аккаунту");
    subject = session.userId;
  }

  const sent = await sendEmailCode(env, email, hash, purpose as EmailPurpose, subject, locale);
  return json({ ok: true, sentTo: emailMask(email), ...sent });
}

/** Вход по коду из письма — он же первый шаг сброса забытого пароля. */
async function emailLogin(env: Env, request: Request): Promise<Response> {
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  await limitByIp(env, request, "email-login", 30, 15 * 60_000);
  const hash = await emailHash(env, email);
  const user = await findUserByEmail(env, hash);
  if (!user) throw new HttpError(404, "Аккаунта с этой почтой нет — проверьте почту или создайте аккаунт");
  await consumeEmailCode(env, hash, "login", body.code, user.id);
  if (user.failed_logins > 0 || user.locked_until > 0) {
    await env.DB.prepare("UPDATE users SET failed_logins = 0, locked_until = 0 WHERE id = ?").bind(user.id).run();
  }
  return json({ token: await createSession(env, user.id, "email"), user: publicUser(env, user) });
}

async function emailLink(env: Env, request: Request): Promise<Response> {
  const session = await requireUser(env, request);
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  const hash = await emailHash(env, email);
  await consumeEmailCode(env, hash, "link", body.code, session.userId);
  try {
    await env.DB.prepare("UPDATE users SET email_hash = ?, email_mask = ? WHERE id = ?").bind(hash, emailMask(email), session.userId).run();
  } catch (e) {
    if (String(e).includes("UNIQUE")) throw new HttpError(409, "Эта почта уже привязана к другому аккаунту");
    throw e;
  }
  return json({ user: publicUser(env, await sessionAccount(env, session)) });
}

async function emailUnlink(env: Env, request: Request): Promise<Response> {
  const session = await requireUser(env, request);
  const user = await sessionAccount(env, session);
  if (!hasPassword(user) && !user.google_sub) throw new HttpError(400, "Почта — единственный способ войти. Сначала задайте пароль или привяжите Google.");
  await env.DB.prepare("UPDATE users SET email_hash = NULL, email_mask = NULL WHERE id = ?").bind(user.id).run();
  return json({ user: publicUser(env, { ...user, email_hash: null, email_mask: null }) });
}

// ── Google ─────────────────────────────────────────────────────────────────────────────────

function googleClientId(env: Env): string | null {
  const id = (env as { GOOGLE_CLIENT_ID?: string }).GOOGLE_CLIENT_ID;
  return id && id.endsWith(".apps.googleusercontent.com") ? id : null;
}

async function verifyGoogle(env: Env, credential: unknown) {
  const clientId = googleClientId(env);
  if (!clientId) throw new HttpError(503, "Вход через Google пока не работает");
  return verifyGoogleCredential(credential, clientId, (env as { GOOGLE_CERTS_URL?: string }).GOOGLE_CERTS_URL || undefined);
}

/** Логин-подсказка для нового аккаунта через Google: из почты или имени, свободный. */
async function suggestLogin(env: Env, identity: { email?: string; name?: string }): Promise<string> {
  const raw = (identity.email?.split("@")[0] ?? identity.name ?? "").replace(/[^A-Za-z0-9_.-]/g, "").slice(0, 20);
  const base = raw.length >= 3 ? raw : "otaku";
  if (!(await loginTaken(env, base))) return base;
  for (let i = 0; i < 5; i++) {
    const candidate = `${base.slice(0, 19)}${Math.floor(100 + Math.random() * 9900)}`;
    if (!(await loginTaken(env, candidate))) return candidate;
  }
  return "";
}

/** Кнопка Google: аккаунт уже есть — входим; нет — сайт попросит выбрать логин (google/register). */
async function googleLogin(env: Env, request: Request): Promise<Response> {
  const body = await readJson(request);
  await limitByIp(env, request, "google", 60, 15 * 60_000);
  const identity = await verifyGoogle(env, body.credential);
  const user = await findUserByGoogle(env, identity.sub);
  if (!user) return json({ needsLogin: true, suggestedLogin: await suggestLogin(env, identity) });
  return json({ token: await createSession(env, user.id, "google"), user: publicUser(env, user) });
}

async function googleRegister(env: Env, request: Request): Promise<Response> {
  const body = await readJson(request);
  const login = requireLogin(body.login);
  await limitByIp(env, request, "register", 20, 3600_000);
  const identity = await verifyGoogle(env, body.credential);
  if (await findUserByGoogle(env, identity.sub)) throw new HttpError(409, "Этот Google уже привязан к другому аккаунту");
  const user = await insertUser(env, { login, salt: "", passHash: "", recoveryHash: "", googleSub: identity.sub });
  return json({ token: await createSession(env, user.id, "google"), user: publicUser(env, user) });
}

async function googleLink(env: Env, request: Request): Promise<Response> {
  const session = await requireUser(env, request);
  const body = await readJson(request);
  const identity = await verifyGoogle(env, body.credential);
  const owner = await findUserByGoogle(env, identity.sub);
  if (owner && owner.id !== session.userId) throw new HttpError(409, "Этот Google уже привязан к другому аккаунту");
  try {
    await env.DB.prepare("UPDATE users SET google_sub = ? WHERE id = ?").bind(identity.sub, session.userId).run();
  } catch (e) {
    if (String(e).includes("UNIQUE")) throw new HttpError(409, "Этот Google уже привязан к другому аккаунту");
    throw e;
  }
  return json({ user: publicUser(env, await sessionAccount(env, session)) });
}

async function googleUnlink(env: Env, request: Request): Promise<Response> {
  const session = await requireUser(env, request);
  const user = await sessionAccount(env, session);
  if (!hasPassword(user) && !user.email_hash) throw new HttpError(400, "Google — единственный способ войти. Сначала задайте пароль или привяжите почту.");
  await env.DB.prepare("UPDATE users SET google_sub = NULL WHERE id = ?").bind(user.id).run();
  return json({ user: publicUser(env, { ...user, google_sub: null }) });
}

async function recover(env: Env, request: Request): Promise<Response> {
  const body = await readJson(request);
  const loginName = requireLogin(body.login);
  const clientHash = requireClientHash(body.newPasswordHash);
  if (typeof body.recoveryCode !== "string") throw new HttpError(400, "Введите код восстановления");
  await limitByIp(env, request, "recover", 10, 3600_000);
  const user = await findUser(env, loginName);
  if (!user) throw new HttpError(401, "Неверный логин или код восстановления");
  assertNotLocked(user);
  if (!user.recovery_hash) {
    throw new HttpError(401, user.email_hash ? "У этого аккаунта нет кода восстановления — сбросьте пароль через почту" : "У этого аккаунта нет кода восстановления — войдите через Google");
  }
  if (!sameHex(await recoveryHash(body.recoveryCode), user.recovery_hash)) {
    await registerFailure(env, user);
    throw new HttpError(401, "Неверный логин или код восстановления");
  }
  // Код одноразовый: выдаём новый, старые входы на других устройствах закрываем.
  const salt = randomHex(16);
  const recoveryCode = newRecoveryCode();
  await env.DB.batch([
    env.DB.prepare("UPDATE users SET pass_salt = ?, pass_hash = ?, recovery_hash = ?, failed_logins = 0, locked_until = 0 WHERE id = ?").bind(
      salt,
      await passwordHash(salt, clientHash),
      await recoveryHash(recoveryCode),
      user.id,
    ),
    env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(user.id),
  ]);
  return json({ token: await createSession(env, user.id, "recovery"), user: publicUser(env, { ...user, failed_logins: 0, locked_until: 0 }), recoveryCode });
}

/**
 * Смена пароля. Старый пароль нужен, если он есть — кроме свежего входа по почте или через
 * Google (так сбрасывают забытый пароль). У аккаунта без пароля (через Google) — задать впервые.
 */
async function changePassword(env: Env, request: Request): Promise<Response> {
  const session = await requireUser(env, request);
  const body = await readJson(request);
  const newHash = requireClientHash(body.newPasswordHash);
  const user = await sessionAccount(env, session);
  if (body.oldPasswordHash !== undefined && body.oldPasswordHash !== null && body.oldPasswordHash !== "") {
    await checkPassword(env, user, requireClientHash(body.oldPasswordHash));
  } else if (hasPassword(user) && !freshStrongSession(session)) {
    throw new HttpError(400, "Введите текущий пароль");
  }
  const salt = randomHex(16);
  // Пароль сменили — остальные устройства выходят, это устройство остаётся.
  await env.DB.batch([
    env.DB.prepare("UPDATE users SET pass_salt = ?, pass_hash = ?, failed_logins = 0, locked_until = 0 WHERE id = ?").bind(salt, await passwordHash(salt, newHash), user.id),
    env.DB.prepare("DELETE FROM sessions WHERE user_id = ? AND token_hash != ?").bind(user.id, session.tokenHash),
  ]);
  return json({ ok: true, user: publicUser(env, { ...user, pass_salt: salt, pass_hash: "set" }) });
}

/**
 * Удаление: паролем, а у аккаунта без пароля — подтверждением Google того же аккаунта
 * (googleCredential) или свежим входом через Google / по почте.
 */
async function deleteAccount(env: Env, request: Request): Promise<Response> {
  const session = await requireUser(env, request);
  const body = await readJson(request);
  const user = await sessionAccount(env, session);
  if (hasPassword(user)) {
    await checkPassword(env, user, requireClientHash(body.passwordHash));
  } else if (body.googleCredential !== undefined) {
    const identity = await verifyGoogle(env, body.googleCredential);
    if (!user.google_sub || identity.sub !== user.google_sub) throw new HttpError(403, "Это другой аккаунт Google — подтвердите тем, что привязан к этому аккаунту");
  } else if (!freshStrongSession(session)) {
    throw new HttpError(403, "Для удаления войдите заново через Google или по коду на почту и сразу повторите");
  }
  await env.DB.batch([
    // Топ на сервере уходит вместе с аккаунтом; в браузере оценки остаются.
    env.DB.prepare("DELETE FROM tops WHERE user_id = ?").bind(user.id),
    env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(user.id),
    env.DB.prepare("DELETE FROM users WHERE id = ?").bind(user.id),
  ]);
  return json({ ok: true });
}

/** Маршруты аккаунтов; null — путь не наш. */
export async function handleAccounts(request: Request, env: Env, path: string): Promise<Response | null> {
  const method = request.method;
  if (method === "POST" && path === "/api/auth/register") return register(env, request);
  if (method === "POST" && path === "/api/auth/login") return login(env, request);
  if (method === "POST" && path === "/api/auth/recover") return recover(env, request);
  if (method === "POST" && path === "/api/auth/password") return changePassword(env, request);
  if (method === "POST" && path === "/api/auth/delete") return deleteAccount(env, request);
  // Какие способы входа включены — сайт показывает только работающие (2026-11-17).
  if (method === "GET" && path === "/api/auth/config") return json({ email: emailEnabled(env), googleClientId: googleClientId(env) });
  if (method === "POST" && path === "/api/auth/email/code") return emailCode(env, request);
  if (method === "POST" && path === "/api/auth/email/login") return emailLogin(env, request);
  if (method === "POST" && path === "/api/auth/email/link") return emailLink(env, request);
  if (method === "POST" && path === "/api/auth/email/unlink") return emailUnlink(env, request);
  if (method === "POST" && path === "/api/auth/google") return googleLogin(env, request);
  if (method === "POST" && path === "/api/auth/google/register") return googleRegister(env, request);
  if (method === "POST" && path === "/api/auth/google/link") return googleLink(env, request);
  if (method === "POST" && path === "/api/auth/google/unlink") return googleUnlink(env, request);
  if (method === "POST" && path === "/api/auth/profile") return updateProfile(env, request);
  if (method === "POST" && path === "/api/auth/logout") {
    const { tokenHash } = await requireUser(env, request);
    await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
    return json({ ok: true });
  }
  if (method === "GET" && path === "/api/auth/me") {
    const session = await requireUser(env, request);
    return json({ user: publicUser(env, await sessionAccount(env, session)) });
  }

  return null;
}
