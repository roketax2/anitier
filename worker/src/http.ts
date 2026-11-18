// Общее для обработчиков: откуда пускаем запросы, ответы JSON и ошибки.

/** Сайт на GitHub Pages и локальная проверка. */
export const SITE_ORIGINS = new Set(["https://anitierapp.pages.dev", "https://roketax2.github.io", "http://127.0.0.1:5190", "http://localhost:5190"]);

export function corsHeaders(origin: string): Record<string, string> {
  if (!SITE_ORIGINS.has(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "7200",
    Vary: "Origin",
  };
}

export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return jsonText(JSON.stringify(data), status, headers);
}

/** Уже готовый JSON-текст — топ лежит в базе строкой и уходит как есть. */
export function jsonText(text: string, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(text, {
    status,
    headers: { ...headers, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

/** Ошибка для пользователя — по-русски, сайт переведёт известные через tr(). */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Тело запроса как JSON-объект; limit — сколько символов принимаем (топ больше форм). */
export async function readJson(request: Request, limit = 65_536): Promise<Record<string, unknown>> {
  const text = await request.text();
  if (text.length > limit) throw new HttpError(413, "Слишком большой запрос");
  try {
    const value: unknown = JSON.parse(text);
    if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  } catch {
    // ниже — общая ошибка
  }
  throw new HttpError(400, "Некорректный JSON в теле запроса");
}
