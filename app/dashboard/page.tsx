import { requireAdmin } from "@/utils/admin";
import { db } from "@/utils/db";

type View = { created_at: string; visitor: string; path: string; referrer: string | null; country: string | null; device: string | null };

const DAY = 86_400_000;
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

function top<T extends string>(items: (T | null)[], n = 5) {
  const counts = new Map<string, number>();
  for (const i of items) if (i) counts.set(i, (counts.get(i) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

function Card({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-fg">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function List({ title, rows, empty }: { title: string; rows: [string, number][]; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return (
    <div className="rounded-2xl border border-line bg-panel p-5">
      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{title}</p>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <ul className="space-y-2.5">
          {rows.map(([k, v]) => (
            <li key={k} className="relative overflow-hidden rounded-lg px-3 py-1.5 text-sm">
              <span className="absolute inset-y-0 left-0 rounded-lg bg-accent/10" style={{ width: `${(v / max) * 100}%` }} />
              <span className="relative flex justify-between gap-3">
                <span className="truncate">{k}</span>
                <span className="font-mono text-muted">{v}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const Status = ({ ok, label, detail }: { ok: boolean; label: string; detail: string }) => (
  <li className="flex items-center justify-between gap-4 border-b border-line py-3 last:border-0">
    <span className="flex items-center gap-3 text-sm">
      <span className={`h-2 w-2 rounded-full ${ok ? "bg-accent shadow-[0_0_8px_rgb(var(--accent))]" : "bg-red-400"}`} />
      {label}
    </span>
    <span className="font-mono text-xs text-muted">{detail}</span>
  </li>
);

export default async function Overview() {
  await requireAdmin();
  const supabase = db();
  // server component rendered per request (force-dynamic layout), so reading the clock here is intended
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const since30 = new Date(now - 30 * DAY).toISOString();
  const since7 = now - 7 * DAY;

  // ponytail: aggregates in JS over the last 30 days of rows — fine at portfolio traffic;
  // move to a SQL view/RPC if this ever reaches hundreds of thousands of views a month.
  const [viewsRes, unreadRes, messagesRes, chatsRes] = supabase
    ? await Promise.all([
        supabase.from("portfolio_pageviews").select("created_at,visitor,path,referrer,country,device").gte("created_at", since30).order("created_at", { ascending: false }).limit(50_000),
        supabase.from("portfolio_messages").select("id", { count: "exact", head: true }).is("read_at", null),
        supabase.from("portfolio_messages").select("id", { count: "exact", head: true }),
        supabase.from("portfolio_chat_logs").select("id", { count: "exact", head: true }).gte("created_at", new Date(since7).toISOString()),
      ])
    : [null, null, null, null];

  const dbOk = !!supabase && !viewsRes?.error;
  const views = (viewsRes?.data ?? []) as View[];
  const week = views.filter((v) => new Date(v.created_at).getTime() >= since7);

  const days = Array.from({ length: 14 }, (_, i) => dayKey(new Date(now - (13 - i) * DAY)));
  const perDay = new Map(days.map((d) => [d, 0]));
  for (const v of views) {
    const k = v.created_at.slice(0, 10);
    if (perDay.has(k)) perDay.set(k, perDay.get(k)! + 1);
  }
  const peak = Math.max(1, ...perDay.values());

  const env = (k: string) => !!process.env[k];
  const admins = (process.env.ADMIN_USER_IDS ?? "").split(",").filter((s) => s.trim()).length;
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted"><span className="text-accent">[00]</span> Overview</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Dashboard</h1>
      </header>

      {!dbOk && (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm">
          The admin database is not connected yet. Set <code className="font-mono">SUPABASE_URL</code> and <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code>, and run the SQL in <code className="font-mono">supabase/migrations</code>.
        </div>
      )}

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card label="Views · 7d" value={week.length} hint={`${views.length} in 30 days`} />
        <Card label="Visitors · 7d" value={new Set(week.map((v) => `${v.visitor}${v.created_at.slice(0, 10)}`)).size} hint="unique per day" />
        <Card label="Unread messages" value={unreadRes?.count ?? 0} hint={`${messagesRes?.count ?? 0} total`} />
        <Card label="Aksa chats · 7d" value={chatsRes?.count ?? 0} />
      </section>

      <section className="rounded-2xl border border-line bg-panel p-5">
        <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Page views · last 14 days</p>
        <div className="flex h-40 items-end gap-1.5">
          {days.map((d) => {
            const n = perDay.get(d)!;
            return (
              <div key={d} className="group flex h-full flex-1 flex-col justify-end" title={`${d}: ${n} views`}>
                <div className="rounded-t-md bg-gradient-to-t from-accent/40 to-accent transition-opacity group-hover:opacity-80" style={{ height: `${Math.max(2, (n / peak) * 100)}%` }} />
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between font-mono text-[10px] text-muted">
          <span>{days[0].slice(5)}</span>
          <span>today</span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <List title="Top pages · 30d" rows={top(views.map((v) => v.path))} empty="No views yet" />
        <List title="Referrers · 30d" rows={top(views.map((v) => v.referrer))} empty="Mostly direct visits" />
        <List title="Countries · 30d" rows={top(views.map((v) => v.country))} empty="No data yet" />
        <List title="Devices · 30d" rows={top(views.map((v) => v.device))} empty="No data yet" />
      </section>

      <section className="rounded-2xl border border-line bg-panel p-5">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">System status</p>
        <ul>
          <Status ok={dbOk} label="Admin database (Supabase)" detail={dbOk ? "connected" : supabase ? "error — run the migration" : "not configured"} />
          <Status ok={env("GROQ_API_KEY")} label="Aksa AI assistant (Groq)" detail={env("GROQ_API_KEY") ? "configured" : "GROQ_API_KEY missing"} />
          <Status ok={env("TELEGRAM_BOT_TOKEN") && env("TELEGRAM_CHAT_ID")} label="Contact → Telegram" detail={env("TELEGRAM_BOT_TOKEN") && env("TELEGRAM_CHAT_ID") ? "configured" : "not configured"} />
          <Status ok={env("EMAIL_ADDRESS") && env("GMAIL_PASSKEY")} label="Contact → Email" detail={env("EMAIL_ADDRESS") && env("GMAIL_PASSKEY") ? "configured" : "not configured"} />
          <Status ok={admins > 0} label="Admin allowlist" detail={`${admins} admin${admins === 1 ? "" : "s"}`} />
          <Status ok label="Deployment" detail={`${process.env.VERCEL_ENV ?? "local"}${sha ? ` · ${sha}` : ""}`} />
        </ul>
      </section>
    </div>
  );
}
