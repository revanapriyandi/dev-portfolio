"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { FiArrowUp, FiX } from "react-icons/fi";
import { openWhatsApp } from "./sections";
import { focusTarget, parseReply, ReplyActions } from "./aksa-actions";
import AssistantText from "./assistant-text";
import { buildHandoffMessage } from "@/utils/chat-handoff";

const ease = [0.22, 1, 0.36, 1] as const;

type Msg = { role: "user" | "assistant"; content: string; error?: boolean };

const GREETING: Msg = {
  role: "assistant",
  content: "Hi, I'm Aksa — Revan's AI assistant. Ask me about his services, projects or how to start working together. English or Bahasa Indonesia, both fine.",
};

const SUGGESTIONS = ["What can Revan build for me?", "Tell me about the Accounting ERP", "Bagaimana cara mulai proyek?"];

// Soft two-note chime made with Web Audio, so there's no sound file to ship.
let audio: AudioContext | null = null;
function chime() {
  try {
    audio ??= new AudioContext();
    const t = audio.currentTime;
    [880, 1320].forEach((freq, i) => {
      const osc = audio!.createOscillator();
      const gain = audio!.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = t + i * 0.09;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.06, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
      osc.connect(gain).connect(audio!.destination);
      osc.start(start);
      osc.stop(start + 0.4);
    });
  } catch {
    // no audio support: stay silent
  }
}

function Mark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="14" fill="#05070d" />
      <path d="M17 20l12 12-12 12" fill="none" stroke="#c6ff3d" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="33" y="40" width="15" height="6.5" rx="2" fill="#e8ecf4" />
    </svg>
  );
}

export default function Assistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  // a reply that finished while the panel was closed
  const [unread, setUnread] = useState(false);
  const openRef = useRef(open);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const hideForResume = () => { setOpen(false); setUnread(false); };
    window.addEventListener("aksa:open-resume", hideForResume);
    window.addEventListener("aksa:resume-visible", hideForResume);
    return () => {
      window.removeEventListener("aksa:open-resume", hideForResume);
      window.removeEventListener("aksa:resume-visible", hideForResume);
    };
  }, []);

  useEffect(() => {
    openRef.current = open;
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    // a press anywhere outside the panel closes it
    const onDown = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, busy]);

  // phones: the panel covers the page, so get it out of the way first
  const show = (target: string) => {
    if (window.innerWidth < 640) setOpen(false);
    focusTarget(target);
  };

  const openPanel = () => {
    setOpen(true);
    setUnread(false);
  };

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    const history: Msg[] = [...messages, { role: "user", content: q }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);

    const update = (content: string, error = false) =>
      setMessages((m) => [...m.slice(0, -1), { role: "assistant", content, error }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // the greeting is UI-only; failed replies are not sent back as context
        body: JSON.stringify({ messages: history.filter((m) => m !== GREETING && !m.error).map(({ role, content }) => ({ role, content })) }),
      });
      if (!res.ok || !res.body) {
        update((await res.text()) || "Something went wrong. Please try again.", true);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let out = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        out += decoder.decode(value, { stream: true });
        update(out);
      }
      if (out.trim()) chime();
      if (!openRef.current) setUnread(true);
      const { goto } = parseReply(out);
      if (goto) show(goto);
      if (!out.trim()) update("I couldn't come up with an answer. Please try rephrasing.", true);
    } catch {
      update("Connection problem. Please check your internet and try again.", true);
    } finally {
      setBusy(false);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const last = messages[messages.length - 1];
  const handoffMessage = buildHandoffMessage(messages);
  const preview = last.role === "assistant" && !last.error ? parseReply(last.content).text : last.content;

  return (
    <>
      {/* launcher: sits above the mobile bottom tab bar */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease }}
            onClick={openPanel}
            aria-label="Open Aksa, the AI assistant"
            className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-4 z-[55] flex items-center gap-2.5 rounded-full border border-accent/40 bg-panel/90 p-2 shadow-[0_15px_40px_-10px_rgb(var(--accent)/0.45)] backdrop-blur-xl transition-colors hover:border-accent sm:pr-4 lg:bottom-6 lg:right-6"
          >
            <span className="relative">
              <Mark className="h-8 w-8" />
              <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                <span className="absolute h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-accent" />
              </span>
            </span>
            <span className="hidden font-mono text-xs uppercase tracking-widest sm:inline">Ask Aksa</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* closed mid-reply: keep the answer visible next to the launcher */}
      <AnimatePresence>
        {!open && (busy || unread) && (
          <motion.button
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.25, ease }}
            onClick={openPanel}
            aria-label="Open Aksa to read the reply"
            className="fixed bottom-[calc(10rem+env(safe-area-inset-bottom))] right-4 z-[55] w-[min(280px,calc(100vw-2rem))] rounded-2xl rounded-br-md border border-line bg-panel/95 px-3.5 py-2.5 text-left text-sm leading-relaxed shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] backdrop-blur-xl hover:border-accent lg:bottom-24 lg:right-6"
          >
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-accent">Aksa{busy ? " · typing" : ""}</span>
            {preview && last.role === "assistant" ? (
              <span className="line-clamp-3 text-fg">{preview.replace(/\*\*|__/g, "")}</span>
            ) : (
              <span className="flex gap-1 py-1" aria-label="Typing">
                {[0, 1, 2].map((d) => (
                  <motion.span key={d} className="h-1.5 w-1.5 rounded-full bg-muted" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }} />
                ))}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.section
            ref={panelRef}
            role="dialog"
            aria-label="Aksa, AI assistant"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.35, ease }}
            className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-[65] flex h-[min(78svh,600px)] origin-bottom-right flex-col overflow-hidden rounded-3xl border border-line bg-panel/95 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] backdrop-blur-2xl sm:left-auto sm:right-6 sm:w-[400px] lg:bottom-6"
          >
            <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
            <header className="flex items-center gap-3 border-b border-line px-4 py-3">
              <Mark className="h-9 w-9" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-tight">Aksa <span className="font-normal text-muted">· Revan&apos;s assistant</span></p>
                <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" /> AI · replies in seconds
                </p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close assistant" className="flex h-10 w-10 items-center justify-center rounded-full border border-line hover:border-accent hover:text-accent">
                <FiX />
              </button>
            </header>

            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
              {messages.map((m, i) => {
                const reply = m.role === "assistant" && !m.error ? parseReply(m.content) : null;
                const streaming = busy && i === messages.length - 1;
                const text = reply ? reply.text : m.content;
                return (
                  <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                    {(text || streaming) && (
                      <div
                        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                          m.role === "user"
                            ? "rounded-br-md bg-accent text-ink"
                            : m.error
                              ? "rounded-bl-md border border-red-500/30 bg-red-500/10 text-fg"
                              : "rounded-bl-md border border-line bg-ink/60 text-fg"
                        }`}
                      >
                        {text ? (m.role === "assistant" ? <AssistantText text={text} /> : text) : (
                          <span className="flex gap-1 py-1" aria-label="Typing">
                            {[0, 1, 2].map((d) => (
                              <motion.span key={d} className="h-1.5 w-1.5 rounded-full bg-muted" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }} />
                            ))}
                          </span>
                        )}
                      </div>
                    )}
                    {/* buttons wait for the full reply so they don't jump around while it streams */}
                    {reply && !streaming && <ReplyActions reply={reply} onGoto={show} handoffMessage={handoffMessage} />}
                  </div>
                );
              })}
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => send(s)} className="rounded-full border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent">
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={submit} className="border-t border-line p-3">
              <div className="flex items-end gap-2 rounded-2xl border border-line bg-ink/60 p-1.5 pl-3 focus-within:border-accent">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  rows={1}
                  maxLength={800}
                  placeholder="Ask about services, projects…"
                  aria-label="Message"
                  /* the wrapper's focus-within border is the focus indicator, so drop the global outline here */
                  className="max-h-28 min-h-9 flex-1 resize-none bg-transparent py-2 text-sm outline-none placeholder:text-muted/70 focus-visible:outline-none"
                />
                <button type="submit" disabled={busy || !input.trim()} aria-label="Send" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-ink transition-opacity disabled:opacity-40">
                  <FiArrowUp />
                </button>
              </div>
              <p className="mt-2 flex items-center justify-between px-1 font-mono text-[10px] uppercase tracking-wider text-muted">
                <span>AI can be wrong · chats are saved</span>
                <a href="#connect" onClick={(e) => openWhatsApp(e, handoffMessage)} className="text-fg hover:text-accent">Talk to Revan ↗</a>
              </p>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
