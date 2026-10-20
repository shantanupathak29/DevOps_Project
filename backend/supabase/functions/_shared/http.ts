const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  Deno.env.get('APP_ORIGIN') ?? '',
]);

export function corsHeaders(origin: string | null): HeadersInit {
  return {
    'Access-Control-Allow-Origin': origin && allowedOrigins.has(origin) ? origin : 'null',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

export function isAllowedOrigin(origin: string | null): boolean {
  return !origin || allowedOrigins.has(origin);
}

export function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  headers: HeadersInit,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}
