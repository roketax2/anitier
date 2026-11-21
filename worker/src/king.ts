import { optionalUser } from "./accounts";
import { HttpError, json, readJson } from "./http";

// «Царь горы» (2026-11-22): сайт после игры присылает царя и победы участников (без имён игроков),
// после игры показывается «Выбор игроков» — кого чаще всего выбирают царём.
const VID_RE = /^[a-z0-9]{16,40}$/;
const KIND_RE = /^(anime|chars|chars-m|chars-f|op|ost)$/;
const ITEM_RE = /^[\w.:-]{1,100}$/;
const MAX_ITEMS = 64;
const PER_DAY = 60;
const GAP_MS = 15_000;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
const img = (v: unknown) => { const s = str(v, 400); return /^https:\/\/[^\s"'<>]+$/.test(s) ? s : ""; };

type Item = { id: string; t: string; img: string; sub: string; n: number };
function item(raw: unknown): Item | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = str(r.id, 100);
  if (!ITEM_RE.test(id)) return null;
  const n = typeof r.n === "number" && Number.isInteger(r.n) && r.n >= 0 && r.n <= 300 ? r.n : 0;
  return { id, t: str(r.t, 120), img: img(r.img), sub: str(r.sub, 160), n };
}

async function result(env: Env, request: Request): Promise<Response> {
  const body = await readJson(request, 120_000);
  const kind = str(body.kind, 10);
  if (!KIND_RE.test(kind)) throw new HttpError(400, "Плохой вид");
  const user = await optionalUser(env, request);
  const vid = typeof body.vid === "string" ? body.vid : "";
  if (!user && !VID_RE.test(vid)) throw new HttpError(400, "Плохой номер");
  const voter = user ? `u:${user.userId}` : `v:${vid}`;
  const king = item(body.king);
  const total = typeof body.total === "number" ? body.total : 0;
  if (!king || !king.t || total < 3) throw new HttpError(400, "Плохой результат");
  const wins = (Array.isArray(body.wins) ? body.wins : []).slice(0, MAX_ITEMS).map(item).filter((x): x is Item => !!x && !!x.t && x.n > 0 && x.id !== king.id);

  const now = Date.now(), day = new Date(now).toISOString().slice(0, 10);
  const p = await env.DB.prepare("SELECT day, n, last FROM king_players WHERE voter = ?").bind(voter).first<{ day: string; n: number; last: number }>();
  if (p && (now - p.last < GAP_MS || (p.day === day && p.n >= PER_DAY))) return json({ ok: true, counted: false });

  const up = (x: Item, kings: number) => env.DB.prepare(
    "INSERT INTO king_items (kind, item, title, img, sub, kings, wins, updated) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8) " +
      "ON CONFLICT(kind, item) DO UPDATE SET kings = kings + ?6, wins = wins + ?7, title = ?3, img = CASE WHEN ?4 = '' THEN img ELSE ?4 END, sub = ?5, updated = ?8",
  ).bind(kind, x.id, x.t, x.img, x.sub, kings, x.n, now);
  await env.DB.batch([
    up(king, 1),
    ...wins.map((x) => up(x, 0)),
    env.DB.prepare("INSERT INTO king_players (voter, day, n, last) VALUES (?1, ?2, 1, ?3) ON CONFLICT(voter) DO UPDATE SET n = CASE WHEN day = ?2 THEN n + 1 ELSE 1 END, day = ?2, last = ?3").bind(voter, day, now),
  ]);
  return json({ ok: true, counted: true });
}

async function top(env: Env, kind: string, url: URL): Promise<Response> {
  const rows = await env.DB.prepare("SELECT item, title, img, sub, kings, wins FROM king_items WHERE kind = ? AND kings > 0 ORDER BY kings DESC, wins DESC LIMIT 10")
    .bind(kind).all<{ item: string; title: string; img: string; sub: string; kings: number; wins: number }>();
  const sum = await env.DB.prepare("SELECT COALESCE(SUM(kings), 0) AS games FROM king_items WHERE kind = ?").bind(kind).first<{ games: number }>();
  const id = url.searchParams.get("id") ?? "";
  const me = ITEM_RE.test(id) ? await env.DB.prepare("SELECT kings, wins FROM king_items WHERE kind = ? AND item = ?").bind(kind, id).first<{ kings: number; wins: number }>() : null;
  return json({
    games: sum?.games ?? 0,
    top: rows.results.map((r) => [r.item, r.title, r.img, r.sub, r.kings, r.wins]),
    me: me ? [me.kings, me.wins] : [0, 0],
  });
}

export async function handleKing(request: Request, env: Env, path: string): Promise<Response | null> {
  if (request.method === "POST" && path === "/api/king") return result(env, request);
  const m = /^\/api\/king\/([a-z-]{2,8})$/.exec(path);
  if (request.method === "GET" && m) {
    if (!KIND_RE.test(m[1])) throw new HttpError(400, "Плохой вид");
    return top(env, m[1], new URL(request.url));
  }
  return null;
}
