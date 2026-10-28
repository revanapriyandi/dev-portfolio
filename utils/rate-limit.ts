// ponytail: in-memory, per-instance limiter — serverless instances don't share it, so it only slows
// down a single abuser hitting one instance. Move to a shared store (e.g. Upstash/Vercel KV) if abuse shows up.
export function rateLimiter(max: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return (key: string) => {
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    recent.push(now);
    hits.set(key, recent);
    return recent.length > max; // true = over the limit
  };
}

export const clientIp = (request: Request) =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
