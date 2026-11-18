import { optionalUser } from "./accounts";
import { HttpError, json, jsonText, readJson } from "./http";

// Рейтинг сообщества (2026-11-18). Сайт присылает свои оценки аниме и опенингов (без имён и адресов);
// голос аккаунта — один на все устройства («u:id»), без аккаунта — по случайному номеру браузера («v:…»).
// Средние считаются лениво: при запросе, если прошлому подсчёту больше 30 минут.
const VID_RE = /^[a-z0-9]{16,40}$/;
const KEY_RE = /^[\w.-]{1,90}$/;
const RECOUNT_MS = 30 * 60 * 1000;
const KEEP_MS = 365 * 864e5; // голоса старше года не считаем
const MAX_ANIME = 6000;
const MAX_THEMES = 3000;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
const score = (v: unknown) => (typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= 10 ? v : null);

async function vote(env: Env, request: Request): Promise<Response> {
  const body = await readJson(request, 800_000);
  const user = await optionalUser(env, request);
  const vid = typeof body.vid === "string" ? body.vid : "";
  if (!user && !VID_RE.test(vid)) throw new HttpError(400, "Плохой номер");
  const voter = user ? `u:${user.userId}` : `v:${vid}`;
  const anime: Record<string, number> = {};
  const rawA = body.anime && typeof body.anime === "object" ? (body.anime as Record<string, unknown>) : {};
  for (const [id, s] of Object.entries(rawA).slice(0, MAX_ANIME)) { const v = score(s); if (v && /^\d{1,7}$/.test(id)) anime[id] = v; }
  const themes: Record<string, unknown[]> = {};
  const rawT = body.themes && typeof body.themes === "object" ? (body.themes as Record<string, unknown>) : {};
  for (const [k, t] of Object.entries(rawT).slice(0, MAX_THEMES)) {
    if (!KEY_RE.test(k) || !Array.isArray(t)) continue;
    const v = score(t[0]);
    const m = t[1] && typeof t[1] === "object" ? (t[1] as Record<string, unknown>) : {};
    // данные о песне — только чтобы показать её в топе: название, исполнители, аниме, постер, OP/ED
    if (v) themes[k] = [v, { song: str(m.song, 120), artists: str(m.artists, 160), ru: str(m.ru, 160), en: str(m.en, 160), poster: str(m.poster, 300), type: str(m.type, 2), seq: typeof m.seq === "number" ? m.seq : 1, slug: str(m.slug, 90), tslug: str(m.tslug, 20), mal: str(m.mal, 10) }];
  }
  await env.DB.prepare(
    "INSERT INTO votes (voter, anime, themes, updated) VALUES (?1, ?2, ?3, ?4) ON CONFLICT(voter) DO UPDATE SET anime = ?2, themes = ?3, updated = ?4",
  ).bind(voter, JSON.stringify(anime), JSON.stringify(themes), Date.now()).run();
  // голосовал с аккаунта — старый голос этого браузера без аккаунта больше не нужен
  if (user && VID_RE.test(vid)) await env.DB.prepare("DELETE FROM votes WHERE voter = ?").bind(`v:${vid}`).run();
  return json({ ok: true });
}

type Agg = Record<string, [number, number, unknown?]>; // ключ → [сумма, число голосов, данные]

async function recount(env: Env): Promise<{ anime: string; themes: string }> {
  const now = Date.now();
  const rows = await env.DB.prepare("SELECT anime, themes FROM votes WHERE updated >= ?").bind(now - KEEP_MS).all<{ anime: string; themes: string }>();
  const a: Agg = {}, t: Agg = {};
  for (const r of rows.results) {
    try { for (const [id, s] of Object.entries(JSON.parse(r.anime) as Record<string, number>)) { (a[id] ||= [0, 0])[0] += s; a[id][1]++; } } catch {}
    try {
      for (const [k, v] of Object.entries(JSON.parse(r.themes) as Record<string, [number, unknown]>)) { const x = (t[k] ||= [0, 0]); x[0] += v[0]; x[1]++; x[2] ||= v[1]; }
    } catch {}
  }
  const pack = (agg: Agg, withMeta: boolean) => JSON.stringify({
    updated: now,
    voters: rows.results.length,
    items: Object.entries(agg).map(([k, [sum, n, m]]) => (withMeta ? [k, Math.round((sum / n) * 100) / 100, n, m] : [k, Math.round((sum / n) * 100) / 100, n])),
  });
  const out = { anime: pack(a, false), themes: pack(t, true) };
  await env.DB.batch([
    env.DB.prepare("INSERT INTO community (kind, data, updated) VALUES ('anime', ?1, ?2) ON CONFLICT(kind) DO UPDATE SET data = ?1, updated = ?2").bind(out.anime, now),
    env.DB.prepare("INSERT INTO community (kind, data, updated) VALUES ('themes', ?1, ?2) ON CONFLICT(kind) DO UPDATE SET data = ?1, updated = ?2").bind(out.themes, now),
  ]);
  return out;
}

async function community(env: Env, kind: string): Promise<Response> {
  if (kind !== "anime" && kind !== "themes") throw new HttpError(400, "Плохой вид");
  const row = await env.DB.prepare("SELECT data, updated FROM community WHERE kind = ?").bind(kind).first<{ data: string; updated: number }>();
  if (row && Date.now() - row.updated < RECOUNT_MS) return jsonText(row.data, 200, { "Cache-Control": "public, max-age=300" });
  const fresh = await recount(env);
  return jsonText(fresh[kind], 200, { "Cache-Control": "public, max-age=300" });
}

export async function handleCommunity(request: Request, env: Env, path: string): Promise<Response | null> {
  if (request.method === "POST" && path === "/api/vote") return vote(env, request);
  const m = /^\/api\/community\/(anime|themes)$/.exec(path);
  if (request.method === "GET" && m) return community(env, m[1]);
  return null;
}
