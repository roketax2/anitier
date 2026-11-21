import { optionalUser } from "./accounts";
import { HttpError, json, readJson } from "./http";

// «Лучшие персонажи» (2026-11-22): после теста сайт присылает выбранных персонажей по вопросам (без имён игроков),
// в итогах показывается, кого чаще всего выбирают все игроки в каждом вопросе.
const VID_RE = /^[a-z0-9]{16,40}$/;
const CAT_RE = /^[a-z_]{2,20}$/;
const ITEM_RE = /^[\w.:-]{1,100}$/;
const PER_DAY = 30;
const GAP_MS = 20_000;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
const img = (v: unknown) => { const s = str(v, 400); return /^https:\/\/[^\s"'<>]+$/.test(s) ? s : ""; };

async function result(env: Env, request: Request): Promise<Response> {
  const body = await readJson(request, 40_000);
  const user = await optionalUser(env, request);
  const vid = typeof body.vid === "string" ? body.vid : "";
  if (!user && !VID_RE.test(vid)) throw new HttpError(400, "Плохой номер");
  const voter = user ? `u:${user.userId}` : `v:${vid}`;
  const seen = new Set<string>();
  const answers = (Array.isArray(body.answers) ? body.answers : []).slice(0, 20).flatMap((a) => {
    const r = a && typeof a === "object" ? (a as Record<string, unknown>) : {};
    const cat = str(r.cat, 20), p = r.pick && typeof r.pick === "object" ? (r.pick as Record<string, unknown>) : {};
    const id = str(p.id, 100), t = str(p.t, 120);
    if (!CAT_RE.test(cat) || !ITEM_RE.test(id) || !t || seen.has(cat)) return [];
    seen.add(cat);
    return [{ cat, id, t, img: img(p.img), sub: str(p.sub, 160) }];
  });
  if (!answers.length) throw new HttpError(400, "Нет ответов");

  const now = Date.now(), day = new Date(now).toISOString().slice(0, 10);
  const pl = await env.DB.prepare("SELECT day, n, last FROM best_players WHERE voter = ?").bind(voter).first<{ day: string; n: number; last: number }>();
  if (pl && (now - pl.last < GAP_MS || (pl.day === day && pl.n >= PER_DAY))) return json({ ok: true, counted: false });
  await env.DB.batch([
    ...answers.map((a) => env.DB.prepare(
      "INSERT INTO best_items (cat, item, title, img, sub, picks, updated) VALUES (?1, ?2, ?3, ?4, ?5, 1, ?6) " +
        "ON CONFLICT(cat, item) DO UPDATE SET picks = picks + 1, title = ?3, img = CASE WHEN ?4 = '' THEN img ELSE ?4 END, sub = ?5, updated = ?6",
    ).bind(a.cat, a.id, a.t, a.img, a.sub, now)),
    env.DB.prepare("INSERT INTO best_players (voter, day, n, last) VALUES (?1, ?2, 1, ?3) ON CONFLICT(voter) DO UPDATE SET n = CASE WHEN day = ?2 THEN n + 1 ELSE 1 END, day = ?2, last = ?3").bind(voter, day, now),
  ]);
  return json({ ok: true, counted: true });
}

// топ-3 каждого вопроса одним запросом
async function top(env: Env): Promise<Response> {
  const rows = await env.DB.prepare(
    "SELECT cat, item, title, img, sub, picks FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY cat ORDER BY picks DESC, updated DESC) AS rn FROM best_items) WHERE rn <= 3",
  ).all<{ cat: string; item: string; title: string; img: string; sub: string; picks: number }>();
  const cats: Record<string, unknown[]> = {};
  for (const r of rows.results) (cats[r.cat] ||= []).push([r.item, r.title, r.img, r.sub, r.picks]);
  return json({ cats });
}

export async function handleBest(request: Request, env: Env, path: string): Promise<Response | null> {
  if (path !== "/api/best") return null;
  if (request.method === "POST") return result(env, request);
  if (request.method === "GET") return top(env);
  return null;
}
