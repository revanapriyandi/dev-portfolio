import { requireAdmin } from "@/utils/admin";
import { db } from "@/utils/db";
import { deleteMessage, setMessageRead } from "../actions";

type Message = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  message: string;
  delivered_telegram: boolean;
  delivered_email: boolean;
  read_at: string | null;
};

const when = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(iso));

export default async function Inbox() {
  await requireAdmin();
  const { data, error } = (await db()?.from("portfolio_messages").select("*").order("created_at", { ascending: false }).limit(200)) ?? { data: null, error: null };
  const messages = (data ?? []) as Message[];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted"><span className="text-accent">[01]</span> Contact form</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Inbox</h1>
      </header>

      {error && <p className="text-sm text-red-400">Could not load messages: {error.message}</p>}
      {!error && messages.length === 0 && <p className="rounded-2xl border border-line bg-panel p-6 text-muted">No messages yet.</p>}

      <ul className="space-y-3">
        {messages.map((m) => {
          const unread = !m.read_at;
          return (
            <li key={m.id} className={`rounded-2xl border bg-panel p-5 ${unread ? "border-accent/40" : "border-line"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-semibold">
                    {unread && <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-label="Unread" />}
                    {m.name}
                  </p>
                  <a href={`mailto:${m.email}`} className="break-all text-sm text-muted hover:text-accent">{m.email}</a>
                </div>
                <p className="font-mono text-xs text-muted">{when(m.created_at)}</p>
              </div>
              {/* rendered as text by React, so visitor input can't inject markup */}
              <p className="mt-4 whitespace-pre-wrap leading-relaxed">{m.message}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4 font-mono text-[11px] uppercase tracking-wider">
                <span className={m.delivered_telegram ? "text-accent" : "text-muted"}>Telegram {m.delivered_telegram ? "✓" : "✕"}</span>
                <span className="text-line">·</span>
                <span className={m.delivered_email ? "text-accent" : "text-muted"}>Email {m.delivered_email ? "✓" : "✕"}</span>
                <span className="ml-auto flex gap-2">
                  <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message")}`} className="rounded-lg border border-line px-3 py-1.5 hover:border-accent hover:text-accent">Reply</a>
                  <form action={setMessageRead.bind(null, m.id, unread)}>
                    <button className="rounded-lg border border-line px-3 py-1.5 hover:border-accent hover:text-accent">{unread ? "Mark read" : "Mark unread"}</button>
                  </form>
                  <form action={deleteMessage.bind(null, m.id)}>
                    <button className="rounded-lg border border-line px-3 py-1.5 text-red-400 hover:border-red-400">Delete</button>
                  </form>
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
