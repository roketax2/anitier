// Начало песни для игры «Угадай опенинг» (2026-11-20). a.animethemes.moe не отдаёт CORS, поэтому сайт
// не может сам посмотреть, где в файле начинается звук. Отдаём первые 128 КБ (≈3 с) с CORS и кэшем на месяц —
// сайт декодирует их и пропускает тишину в начале (обычно 0,5 с, бывает до 1,5 с).
import { HttpError } from "./http";

const HEAD_BYTES = 128 * 1024;
const FILE_RE = /^[A-Za-z0-9._-]{1,120}\.ogg$/;

export async function handleAudio(request: Request, ctx: ExecutionContext): Promise<Response | null> {
  if (request.method !== "GET") return null;
  const f = new URL(request.url).searchParams.get("f") ?? "";
  if (!FILE_RE.test(f) || f.includes("..")) throw new HttpError(400, "Неверный файл");
  const key = new Request(`https://anitier-cache.invalid/audiohead/${f}`);
  const cache = caches.default;
  const hit = await cache.match(key);
  if (hit) return new Response(hit.body, hit);
  const up = await fetch(`https://a.animethemes.moe/${f}`, { headers: { Range: `bytes=0-${HEAD_BYTES - 1}`, "User-Agent": "AniTier/1.0 (+https://anitierapp.pages.dev)" } });
  if (up.status !== 200 && up.status !== 206) throw new HttpError(up.status === 404 ? 404 : 502, "Файл недоступен");
  const body = (await up.arrayBuffer()).slice(0, HEAD_BYTES);
  const res = new Response(body, { headers: { "Content-Type": "audio/ogg", "Cache-Control": "public, max-age=2592000" } });
  ctx.waitUntil(cache.put(key, res.clone()));
  return res;
}
