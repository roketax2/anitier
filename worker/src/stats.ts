import { HttpError, json } from "./http";

// Счётчик игроков (2026-11-18). Сайт раз в 2 минуты, пока вкладка открыта, шлёт /api/ping со своим
// случайным номером; /api/stats отдаёт: сейчас на сайте (3 мин), за сутки, всего, с аккаунтом.
const ID_RE = /^[a-z0-9]{16,40}$/;
const ONLINE_MS = 3 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const PING_GAP_MS = 60 * 1000; // чаще раза в минуту один номер не пишем — экономим записи базы

async function ping(env: Env, request: Request): Promise<Response> {
  let body: { id?: unknown } = {};
  try { body = await request.json(); } catch { throw new HttpError(400, "Плохой запрос"); }
  const id = typeof body.id === "string" ? body.id : "";
  if (!ID_RE.test(id)) throw new HttpError(400, "Плохой номер");
  const now = Date.now();
  await env.DB.prepare(
    "INSERT INTO visitors (id, first_at, seen_at) VALUES (?1, ?2, ?2) ON CONFLICT(id) DO UPDATE SET seen_at = ?2 WHERE seen_at < ?3",
  ).bind(id, now, now - PING_GAP_MS).run();
  return json({ ok: true });
}

async function stats(env: Env): Promise<Response> {
  const now = Date.now();
  const row = await env.DB.prepare(
    `SELECT
       (SELECT COUNT(*) FROM visitors WHERE seen_at >= ?1) AS online,
       (SELECT COUNT(*) FROM visitors WHERE seen_at >= ?2) AS today,
       (SELECT COUNT(*) FROM visitors) AS total,
       (SELECT COUNT(*) FROM users) AS accounts`,
  ).bind(now - ONLINE_MS, now - DAY_MS).first<{ online: number; today: number; total: number; accounts: number }>();
  return json({ online: row?.online ?? 0, today: row?.today ?? 0, total: row?.total ?? 0, accounts: row?.accounts ?? 0 });
}

export async function handleStats(request: Request, env: Env, path: string): Promise<Response | null> {
  if (request.method === "POST" && path === "/api/ping") return ping(env, request);
  if (request.method === "GET" && path === "/api/stats") return stats(env);
  return null;
}
