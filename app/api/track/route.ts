import { db, visitorHash } from "@/utils/db";
import { clientIp, rateLimiter } from "@/utils/rate-limit";

const limited = rateLimiter(60, 10 * 60 * 1000);
const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|whatsapp/i;

// Cookie-less page view: path, referrer host, country and device class. No IPs are stored.
export async function POST(request: Request) {
  const ua = request.headers.get("user-agent") || "";
  const supabase = db();
  if (!supabase || BOT.test(ua) || limited(clientIp(request))) return new Response(null, { status: 204 });

  const body = (await request.json().catch(() => null)) as { path?: unknown; referrer?: unknown } | null;
  const path = typeof body?.path === "string" && body.path.startsWith("/") ? body.path.slice(0, 300) : null;
  if (!path) return new Response(null, { status: 204 });

  let referrer: string | null = null;
  if (typeof body?.referrer === "string" && body.referrer) {
    try {
      const host = new URL(body.referrer).hostname;
      if (host && host !== new URL(request.url).hostname) referrer = host.slice(0, 300);
    } catch {}
  }

  const country = request.headers.get("x-vercel-ip-country")?.slice(0, 2) || null;
  const device = /ipad|tablet/i.test(ua) ? "tablet" : /mobi|android|iphone/i.test(ua) ? "mobile" : "desktop";

  const { error } = await supabase.from("portfolio_pageviews").insert({ visitor: visitorHash(request), path, referrer, country, device });
  if (error) console.error("Error storing page view:", error.message);
  return new Response(null, { status: 204 });
}
