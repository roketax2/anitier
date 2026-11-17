import { HttpError } from "./http";

// Вход через Google (2026-11-17). Кнопка Google на сайте отдаёт подписанный Google токен (JWT);
// здесь проверяем подпись по открытым ключам Google, что токен выдан нашему сайту (aud = наш
// Client ID) и не истёк. Из токена берём только sub — постоянный номер пользователя Google.

const CERTS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const ISSUERS = new Set(["accounts.google.com", "https://accounts.google.com"]);
/** Расхождение часов сервера и Google, которое прощаем. */
const SKEW_S = 120;

type GoogleJwk = JsonWebKey & { kid?: string };
export type GoogleIdentity = { sub: string; email?: string; name?: string };

let cachedKeys: { keys: GoogleJwk[]; until: number } | null = null;

const encoder = new TextEncoder();

function base64UrlBytes(part: string): Uint8Array {
  const b64 = part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "=");
  const raw = atob(b64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function base64UrlJson(part: string): Record<string, unknown> {
  const value: unknown = JSON.parse(new TextDecoder().decode(base64UrlBytes(part)));
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("not an object");
  return value as Record<string, unknown>;
}

/** Ключи Google — держим в памяти, пока разрешает их Cache-Control (обычно несколько часов). */
async function googleKeys(certsUrl: string, force: boolean): Promise<GoogleJwk[]> {
  const now = Date.now();
  if (!force && cachedKeys && cachedKeys.until > now) return cachedKeys.keys;
  const res = await fetch(certsUrl);
  if (!res.ok) throw new HttpError(502, "Google не ответил — попробуйте ещё раз");
  const body = (await res.json()) as { keys?: GoogleJwk[] };
  const maxAge = Number(/max-age=(\d+)/.exec(res.headers.get("Cache-Control") ?? "")?.[1] ?? 3600);
  cachedKeys = { keys: Array.isArray(body.keys) ? body.keys : [], until: now + Math.min(maxAge, 6 * 3600) * 1000 };
  return cachedKeys.keys;
}

/**
 * Проверенный токен кнопки Google → кто это. Ошибка — HttpError 401 с понятным текстом.
 * certsUrl подменяется только в локальных проверках (свои ключи вместо Google).
 */
export async function verifyGoogleCredential(credential: unknown, clientId: string, certsUrl = CERTS_URL): Promise<GoogleIdentity> {
  const bad = () => new HttpError(401, "Google не подтвердил вход — попробуйте ещё раз");
  if (typeof credential !== "string" || credential.length > 4096) throw bad();
  const parts = credential.split(".");
  if (parts.length !== 3) throw bad();

  let header: Record<string, unknown>;
  let payload: Record<string, unknown>;
  try {
    header = base64UrlJson(parts[0]);
    payload = base64UrlJson(parts[1]);
  } catch {
    throw bad();
  }
  if (header.alg !== "RS256" || typeof header.kid !== "string") throw bad();

  // Google меняет ключи раз в несколько недель: незнакомый kid — перечитываем список один раз.
  let jwk = (await googleKeys(certsUrl, false)).find((k) => k.kid === header.kid);
  if (!jwk) jwk = (await googleKeys(certsUrl, true)).find((k) => k.kid === header.kid);
  if (!jwk) throw bad();

  let valid = false;
  try {
    const key = await crypto.subtle.importKey("jwk", { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true }, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, base64UrlBytes(parts[2]), encoder.encode(`${parts[0]}.${parts[1]}`));
  } catch {
    valid = false;
  }
  if (!valid) throw bad();

  const nowS = Date.now() / 1000;
  if (typeof payload.iss !== "string" || !ISSUERS.has(payload.iss)) throw bad();
  if (payload.aud !== clientId) throw bad();
  if (typeof payload.exp !== "number" || payload.exp + SKEW_S < nowS) throw new HttpError(401, "Вход через Google устарел — нажмите кнопку ещё раз");
  if (typeof payload.iat === "number" && payload.iat - SKEW_S > nowS) throw bad();
  if (typeof payload.sub !== "string" || !/^[0-9A-Za-z_-]{1,255}$/.test(payload.sub)) throw bad();

  return {
    sub: payload.sub,
    email: typeof payload.email === "string" ? payload.email : undefined,
    name: typeof payload.name === "string" ? payload.name : undefined,
  };
}

/** Для проверок: забыть ключи Google в памяти. */
export function resetGoogleKeysCache(): void {
  cachedKeys = null;
}
