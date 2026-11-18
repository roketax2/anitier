import { HttpError, json } from "./http";

// Счётчик игроков (2026-11-18). Сайт раз в 5 минут, пока вкладка открыта, шлёт /api/ping со своим
// случайным номером; /api/stats отдаёт: сейчас на сайте (6 мин), за сутки, всего, с аккаунтом.
const ID_RE = /^[a-z0-9]{16,40}$/;
const ONLINE_MS = 6 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const PING_GAP_MS = 60 * 1000; // чаще раза в минуту один номер не пишем — экономим записи базы
// считаем только основной адрес: локальные тесты и старый адрес (он перекидывает сюда) не в счёт
const MAIN_ORIGIN = "https://anitierapp.pages.dev";
const BOT_RE = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|scan|monitor|phantom|puppeteer|playwright|selenium|python|curl|wget|node-fetch|axios|go-http|java\//i;

// тип посетителя по User-Agent — без IP и без точной версии
function kindOf(ua: string) {
  const device = /iPad|Tablet/i.test(ua) ? "tablet" : /Mobi|Android|iPhone|iPod/i.test(ua) ? "phone" : "desktop";
  const browser = /YaBrowser/.test(ua) ? "Yandex" : /Edg\//.test(ua) ? "Edge" : /OPR\/|Opera/.test(ua) ? "Opera" : /SamsungBrowser/.test(ua) ? "Samsung"
    : /Firefox|FxiOS/.test(ua) ? "Firefox" : /Chrome|CriOS/.test(ua) ? "Chrome" : /Safari/.test(ua) ? "Safari" : "other";
  const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad|iPod/.test(ua) ? "iOS" : /Mac OS X/.test(ua) ? "Mac" : /Linux/.test(ua) ? "Linux" : "other";
  return { device, browser, os };
}

async function ping(env: Env, request: Request): Promise<Response> {
  let body: { id?: unknown; wd?: unknown } = {};
  try { body = await request.json(); } catch { throw new HttpError(400, "Плохой запрос"); }
  const id = typeof body.id === "string" ? body.id : "";
  if (!ID_RE.test(id)) throw new HttpError(400, "Плохой номер");
  if (request.headers.get("Origin") !== MAIN_ORIGIN) return json({ ok: true, counted: false });
  const ua = request.headers.get("User-Agent") ?? "";
  const bot = body.wd === true || !ua || BOT_RE.test(ua) ? 1 : 0;
  const k = kindOf(ua);
  const country = String((request as { cf?: { country?: unknown } }).cf?.country ?? "").slice(0, 2) || null;
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO visitors (id, first_at, seen_at, device, browser, os, country, bot) VALUES (?1, ?2, ?2, ?4, ?5, ?6, ?7, ?8)
     ON CONFLICT(id) DO UPDATE SET seen_at = ?2, device = ?4, browser = ?5, os = ?6, country = ?7, bot = MAX(bot, ?8) WHERE seen_at < ?3`,
  ).bind(id, now, now - PING_GAP_MS, k.device, k.browser, k.os, country, bot).run();
  return json({ ok: true });
}

async function stats(env: Env): Promise<Response> {
  const now = Date.now();
  const row = await env.DB.prepare(
    `SELECT
       (SELECT COUNT(*) FROM visitors WHERE bot = 0 AND seen_at >= ?1) AS online,
       (SELECT COUNT(*) FROM visitors WHERE bot = 0 AND seen_at >= ?2) AS today,
       (SELECT COUNT(*) FROM visitors WHERE bot = 0) AS total,
       (SELECT COUNT(*) FROM users) AS accounts`,
  ).bind(now - ONLINE_MS, now - DAY_MS).first<{ online: number; today: number; total: number; accounts: number }>();
  return json({ online: row?.online ?? 0, today: row?.today ?? 0, total: row?.total ?? 0, accounts: row?.accounts ?? 0 });
}

export async function handleStats(request: Request, env: Env, path: string): Promise<Response | null> {
  if (request.method === "POST" && path === "/api/ping") return ping(env, request);
  if (request.method === "GET" && path === "/api/stats") return stats(env);
  return null;
}
