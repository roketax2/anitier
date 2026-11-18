import { findUserById, publicUser, requireUser } from "./accounts";
import { HttpError, json, jsonText, readJson } from "./http";

// Топ на сервере (2026-11-17): весь топ одним JSON — как он лежит в браузере. Сервер его не
// разбирает (кроме открытой ссылки), только хранит и следит за версией: устройство присылает
// версию, от которой меняло; если на сервере уже новее — получает её обратно, сливает у себя
// и присылает снова. Так два устройства не затирают друг друга молча.

/** Топ на несколько тысяч аниме — с запасом; у строки D1 потолок 2 МБ. */
const MAX_TOP = 1_800_000;
const SHARE_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

type TopRow = { data: string; version: number; updated_at: number };

function newShareId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, (b) => SHARE_ALPHABET[b % SHARE_ALPHABET.length]).join("");
}

function topJson(row: TopRow | null): string {
  if (!row) return '{"version":0,"updatedAt":0,"data":null}';
  return `{"version":${row.version},"updatedAt":${row.updated_at},"data":${row.data}}`;
}

async function getTop(env: Env, request: Request): Promise<Response> {
  const { userId } = await requireUser(env, request);
  const row = await env.DB.prepare("SELECT data, version, updated_at FROM tops WHERE user_id = ?").bind(userId).first<TopRow>();
  // Устройство спрашивает, не поменялось ли: та же версия — без данных.
  const since = Number(new URL(request.url).searchParams.get("since"));
  if (row && since === row.version) return json({ version: row.version, updatedAt: row.updated_at, same: true });
  return jsonText(topJson(row));
}

async function putTop(env: Env, request: Request): Promise<Response> {
  const { userId } = await requireUser(env, request);
  const body = await readJson(request, MAX_TOP + 1000);
  const base = Number(body.base);
  if (!Number.isInteger(base) || base < 0) throw new HttpError(400, "Некорректная версия топа");
  const data = body.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new HttpError(400, "Некорректный топ");
  const text = JSON.stringify(data);
  if (text.length > MAX_TOP) throw new HttpError(413, "Топ слишком большой");
  const now = Date.now();

  // Запись проходит, только если на сервере всё ещё та версия, от которой меняли.
  const saved =
    base === 0
      ? await env.DB.prepare("INSERT INTO tops (user_id, data, version, updated_at) VALUES (?, ?, 1, ?) ON CONFLICT(user_id) DO NOTHING RETURNING version")
          .bind(userId, text, now)
          .first<{ version: number }>()
      : await env.DB.prepare("UPDATE tops SET data = ?, version = version + 1, updated_at = ? WHERE user_id = ? AND version = ? RETURNING version")
          .bind(text, now, userId, base)
          .first<{ version: number }>();
  if (saved) return json({ version: saved.version, updatedAt: now });

  const current = await env.DB.prepare("SELECT data, version, updated_at FROM tops WHERE user_id = ?").bind(userId).first<TopRow>();
  return jsonText(`{"conflict":true,${topJson(current).slice(1)}`, 409);
}

/** Открыть или закрыть ссылку на топ. Новая ссылка — новый адрес: старую можно «отозвать». */
async function setShare(env: Env, request: Request): Promise<Response> {
  const session = await requireUser(env, request);
  const body = await readJson(request);
  const on = body.on === true;
  const user = await findUserById(env, session.userId);
  if (!user) throw new HttpError(401, "Нужно войти в аккаунт");
  let shareId: string | null = null;
  if (on) {
    shareId = user.share_id && body.renew !== true ? user.share_id : newShareId();
  }
  await env.DB.prepare("UPDATE users SET share_id = ? WHERE id = ?").bind(shareId, user.id).run();
  return json({ user: publicUser(env, { ...user, share_id: shareId }) });
}

/** Чужой топ по ссылке: только оценки, тиры и места — заметки не отдаём. */
async function getShared(env: Env, id: string): Promise<Response> {
  const row = await env.DB.prepare(
    "SELECT u.login, u.nick, u.avatar, u.frame, t.data, t.updated_at FROM users u LEFT JOIN tops t ON t.user_id = u.id WHERE u.share_id = ?",
  )
    .bind(id)
    .first<{ login: string; nick: string | null; avatar: string | null; frame: string | null; data: string | null; updated_at: number | null }>();
  if (!row) throw new HttpError(404, "Ссылка не работает — топ закрыли или ссылку сменили");
  let data: Record<string, unknown> = {};
  try {
    data = row.data ? JSON.parse(row.data) : {};
  } catch {
    data = {};
  }
  const strip = (store: unknown) => {
    if (!store || typeof store !== "object") return {};
    const out: Record<string, unknown> = {};
    for (const [key, rec] of Object.entries(store as Record<string, Record<string, unknown>>)) {
      if (!rec || typeof rec !== "object") continue;
      const { note: _note, ...rest } = rec;
      out[key] = rest;
    }
    return out;
  };
  const settings = (data.settings && typeof data.settings === "object" ? data.settings : {}) as Record<string, unknown>;
  return json({
    login: row.login,
    nick: row.nick ?? null,
    avatar: row.avatar ?? null,
    frame: row.frame ?? null,
    updatedAt: row.updated_at ?? 0,
    data: { items: strip(data.items), franchises: strip(data.franchises), themes: strip(data.themes), settings: { tierNames: settings.tierNames ?? {} }, ach: data.ach && typeof data.ach === "object" ? data.ach : {} },
  });
}

export async function handleTop(request: Request, env: Env, path: string): Promise<Response | null> {
  const method = request.method;
  if (path === "/api/top") {
    if (method === "GET") return getTop(env, request);
    if (method === "PUT") return putTop(env, request);
  }
  if (path === "/api/top/share" && method === "POST") return setShare(env, request);
  const match = path.match(/^\/api\/shared\/([a-z2-9]{10})$/);
  if (match && method === "GET") return getShared(env, match[1]);
  return null;
}
