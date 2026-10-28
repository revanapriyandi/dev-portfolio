import { requireAdmin } from "@/utils/admin";
import { db } from "@/utils/db";

type Log = { id: string; created_at: string; visitor: string; question: string; answer: string };

const when = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(iso));

export default async function Chats() {
  await requireAdmin();
  const { data, error } = (await db()?.from("portfolio_chat_logs").select("*").order("created_at", { ascending: false }).limit(200)) ?? { data: null, error: null };
  const logs = (data ?? []) as Log[];
  const visitors = new Set(logs.map((l) => l.visitor)).size;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted"><span className="text-accent">[02]</span> AI assistant</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Aksa chats</h1>
        <p className="mt-2 text-sm text-muted">Latest {logs.length} questions from {visitors} anonymous visitor{visitors === 1 ? "" : "s"}.</p>
      </header>

      {error && <p className="text-sm text-red-400">Could not load chats: {error.message}</p>}
      {!error && logs.length === 0 && <p className="rounded-2xl border border-line bg-panel p-6 text-muted">No conversations yet.</p>}

      <ul className="space-y-3">
        {logs.map((l) => (
          <li key={l.id} className="rounded-2xl border border-line bg-panel p-5">
            <div className="mb-3 flex justify-between gap-3 font-mono text-[10px] uppercase tracking-wider text-muted">
              <span>visitor {l.visitor.slice(0, 6)}</span>
              <span>{when(l.created_at)}</span>
            </div>
            <p className="ml-auto w-fit max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-accent px-3.5 py-2.5 text-sm text-ink">{l.question}</p>
            <p className="mt-2 max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-md border border-line bg-ink/60 px-3.5 py-2.5 text-sm">{l.answer || "—"}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
