import { findUserById, limitByIp, publicUser, requireUser } from "./accounts";
import { HttpError, json, readJson } from "./http";

// Секретные коды (2026-11-18): личные (один ввод на всех) и общие (каждый вводит один раз, можно лимит людей и срок).
// Награда — рамки, значки у ника, «все рамки» (код разработчика); любой код даёт ещё секретное достижение «Секретный код».
// Создавать и смотреть коды может только админ — логины из переменной ADMIN_LOGINS (wrangler.jsonc).

export type Rewards = { frames: string[]; badges: string[]; all: boolean; n: number };
export const BADGES = ["dev", "tester", "early", "friend", "vip"];
const FRAME_RE = /^[a-z][a-z0-9_]{0,31}$/;
const CODE_RE = /^[A-Z0-9][A-Z0-9-]{3,23}$/;
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // без 0/O, 1/I/L — не перепутать на слух и на глаз

export function parseRewards(text: string | null | undefined): Rewards {
  let r: Partial<Rewards> = {};
  try { r = text ? JSON.parse(text) : {}; } catch { r = {}; }
  return {
    frames: Array.isArray(r.frames) ? r.frames.filter((f) => typeof f === "string" && FRAME_RE.test(f)) : [],
    badges: Array.isArray(r.badges) ? r.badges.filter((b) => typeof b === "string" && BADGES.includes(b)) : [],
    all: r.all === true,
    n: typeof r.n === "number" ? r.n : 0,
  };
}

/** Награда кода из запроса админа: только известные значки и правильные имена рамок. */
function cleanReward(value: unknown): Omit<Rewards, "n"> {
  const v = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const list = (x: unknown) => (Array.isArray(x) ? x.filter((s): s is string => typeof s === "string") : []);
  const frames = [...new Set(list(v.frames).filter((f) => FRAME_RE.test(f)))].slice(0, 20);
  const badges = [...new Set(list(v.badges).filter((b) => BADGES.includes(b)))];
  const all = v.all === true;
  if (!frames.length && !badges.length && !all) throw new HttpError(400, "Выбери, что даёт промокод");
  return { frames, badges, all };
}

export const normCode = (value: unknown) => (typeof value === "string" ? value.toUpperCase().replace(/[\s_]+/g, "").replace(/[–—]/g, "-") : "");

export function isAdmin(env: Env, login: string): boolean {
  const list = String((env as unknown as { ADMIN_LOGINS?: string }).ADMIN_LOGINS ?? "").toLowerCase().split(/[\s,]+/).filter(Boolean);
  return list.includes(login.toLowerCase());
}

async function requireAdmin(env: Env, request: Request) {
  const session = await requireUser(env, request);
  if (!isAdmin(env, session.login)) throw new HttpError(403, "Только для разработчика");
  return session;
}

function randomCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  const s = [...bytes].map((b) => ALPHABET[b % ALPHABET.length]).join("");
  return `${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8, 12)}`;
}

/** Ввести код. */
async function redeem(env: Env, request: Request): Promise<Response> {
  const session = await requireUser(env, request);
  await limitByIp(env, request, "promo", 12, 10 * 60 * 1000); // подбор кодов перебором — не больше 12 попыток за 10 минут
  const body = await readJson(request);
  // дефисы и пробелы не важны: «anitier 2026» = «ANITIER-2026»
  const typed = normCode(body.code).replace(/-/g, "");
  if (!/^[A-Z0-9]{4,24}$/.test(typed)) throw new HttpError(400, "Такого промокода нет");
  const row = await env.DB.prepare("SELECT * FROM promo_codes WHERE REPLACE(code, '-', '') = ?").bind(typed)
    .first<{ code: string; kind: string; reward: string; max_uses: number | null; uses: number; expires_at: number | null }>();
  if (!row) throw new HttpError(404, "Такого промокода нет");
  const code = row.code;
  const now = Date.now();
  if (row.expires_at && row.expires_at < now) throw new HttpError(410, "Срок действия промокода закончился");
  if (await env.DB.prepare("SELECT 1 AS x FROM promo_uses WHERE code = ? AND user_id = ?").bind(code, session.userId).first()) {
    throw new HttpError(409, "Ты уже вводил этот промокод");
  }
  // занять место и пересчитать использования одной пачкой (в D1 пачка — одна транзакция)
  const [ins] = await env.DB.batch([
    env.DB.prepare(
      "INSERT OR IGNORE INTO promo_uses (code, user_id, at) SELECT ?1, ?2, ?3 WHERE EXISTS (SELECT 1 FROM promo_codes WHERE code = ?1 AND (max_uses IS NULL OR uses < max_uses))",
    ).bind(code, session.userId, now),
    env.DB.prepare("UPDATE promo_codes SET uses = (SELECT COUNT(*) FROM promo_uses WHERE code = ?1) WHERE code = ?1").bind(code),
  ]);
  if (!ins.meta.changes) throw new HttpError(410, row.kind === "personal" ? "Этот промокод уже использован" : "Промокод закончился — его уже ввели все, кому хватило");
  const user = await findUserById(env, session.userId);
  if (!user) throw new HttpError(401, "Нужно войти в аккаунт");
  const have = parseRewards((user as { rewards?: string | null }).rewards);
  const got = parseRewards(row.reward);
  const next: Rewards = {
    frames: [...new Set([...have.frames, ...got.frames])],
    badges: [...new Set([...have.badges, ...got.badges])],
    all: have.all || got.all,
    n: have.n + 1,
  };
  const text = JSON.stringify(next);
  await env.DB.prepare("UPDATE users SET rewards = ? WHERE id = ?").bind(text, user.id).run();
  return json({ reward: { frames: got.frames, badges: got.badges, all: got.all }, user: publicUser(env, { ...user, rewards: text } as typeof user) });
}

/** Админ: создать коды. */
async function create(env: Env, request: Request): Promise<Response> {
  await requireAdmin(env, request);
  const body = await readJson(request);
  const kind = body.kind === "shared" ? "shared" : "personal";
  const reward = JSON.stringify(cleanReward(body.reward));
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 80) : "";
  const days = Number(body.days);
  const expires = Number.isFinite(days) && days > 0 ? Date.now() + Math.min(days, 3650) * 86_400_000 : null;
  const now = Date.now();
  let codes: string[] = [];
  let maxUses: number | null = 1;
  if (kind === "personal") {
    const count = Math.max(1, Math.min(100, Math.floor(Number(body.count) || 1)));
    codes = Array.from({ length: count }, randomCode);
  } else {
    const custom = normCode(body.code);
    if (custom && !CODE_RE.test(custom)) throw new HttpError(400, "Промокод — 4–24 латинские буквы, цифры и дефисы");
    codes = [custom || randomCode()];
    const m = Math.floor(Number(body.maxUses));
    maxUses = Number.isFinite(m) && m > 0 ? Math.min(m, 1_000_000) : null;
  }
  for (const c of codes) {
    if (await env.DB.prepare("SELECT 1 AS x FROM promo_codes WHERE code = ?").bind(c).first()) throw new HttpError(409, `Промокод ${c} уже есть`);
  }
  await env.DB.batch(codes.map((c) => env.DB.prepare(
    "INSERT INTO promo_codes (code, kind, reward, max_uses, uses, expires_at, note, created_at) VALUES (?, ?, ?, ?, 0, ?, ?, ?)",
  ).bind(c, kind, reward, maxUses, expires, note, now)));
  return json({ codes });
}

/** Админ: все коды и кто ввёл. */
async function list(env: Env, request: Request): Promise<Response> {
  await requireAdmin(env, request);
  const { results } = await env.DB.prepare(
    `SELECT p.code, p.kind, p.reward, p.max_uses, p.uses, p.expires_at, p.note, p.created_at,
       (SELECT group_concat(COALESCE(u.nick, u.login), ', ') FROM promo_uses x JOIN users u ON u.id = x.user_id WHERE x.code = p.code) AS who
     FROM promo_codes p ORDER BY p.created_at DESC, p.code LIMIT 300`,
  ).all<Record<string, unknown>>();
  return json({ codes: results.map((r) => ({ ...r, reward: parseRewards(r.reward as string) })) });
}

/** Админ: удалить код (полученные награды остаются у людей). */
async function remove(env: Env, request: Request): Promise<Response> {
  await requireAdmin(env, request);
  const code = normCode((await readJson(request)).code);
  await env.DB.batch([
    env.DB.prepare("DELETE FROM promo_uses WHERE code = ?").bind(code),
    env.DB.prepare("DELETE FROM promo_codes WHERE code = ?").bind(code),
  ]);
  return json({ ok: true });
}

export async function handlePromo(request: Request, env: Env, path: string): Promise<Response | null> {
  if (request.method !== "POST" && !(request.method === "GET" && path === "/api/admin/promo")) return null;
  if (path === "/api/promo/redeem") return redeem(env, request);
  if (path === "/api/admin/promo") return request.method === "GET" ? list(env, request) : create(env, request);
  if (path === "/api/admin/promo/delete") return remove(env, request);
  return null;
}
