import { handleAccounts } from "./accounts";
import { HttpError, SITE_ORIGINS, corsHeaders, json } from "./http";
import { handleCommunity } from "./community";
import { handlePromo } from "./promo";
import { handleStats } from "./stats";
import { handleTop } from "./top";

// API AniTier на anitier.stalzoneai.com (2026-11-17): аккаунты, топ на всех устройствах и
// ссылка на свой топ. Сайт — anitierapp.pages.dev (до 18.11.2026 — roketax2.github.io/anitier).

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const path = new URL(request.url).pathname;
    const origin = request.headers.get("Origin") ?? "";
    const cors = corsHeaders(origin);
    const withCors = (response: Response) => {
      for (const [key, value] of Object.entries(cors)) response.headers.set(key, value);
      return response;
    };

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (path === "/" || path === "/api") return json({ ok: true, site: "https://anitierapp.pages.dev/" });

    try {
      // Пользуются только со своего сайта: чужая страница не должна дёргать API от имени человека.
      if (!SITE_ORIGINS.has(origin)) return json({ error: "Запрос не с сайта" }, 403);
      if (path.startsWith("/api/auth/")) {
        const response = await handleAccounts(request, env, path);
        if (response) return withCors(response);
      }
      if (path === "/api/vote" || path.startsWith("/api/community/")) {
        const response = await handleCommunity(request, env, path);
        if (response) return withCors(response);
      }
      if (path === "/api/promo/redeem" || path.startsWith("/api/admin/promo")) {
        const response = await handlePromo(request, env, path);
        if (response) return withCors(response);
      }
      if (path === "/api/ping" || path === "/api/stats") {
        const response = await handleStats(request, env, path);
        if (response) return withCors(response);
      }
      if (path.startsWith("/api/top") || path.startsWith("/api/shared/")) {
        const response = await handleTop(request, env, path);
        if (response) return withCors(response);
      }
    } catch (e) {
      if (e instanceof HttpError) return withCors(json({ error: e.message }, e.status));
      console.error(e);
      return withCors(json({ error: "Ошибка сервера" }, 500));
    }
    return withCors(json({ error: "Не найдено" }, 404));
  },
} satisfies ExportedHandler<Env>;
