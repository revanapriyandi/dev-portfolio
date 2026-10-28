import Link from "next/link";
import type { ReactNode } from "react";

// Shared full-screen layout for 404 / error / offline, matching the site's HUD look.
export function StatusScreen({
  code,
  label,
  title,
  description,
  terminal,
  children,
}: {
  code: string;
  label: string;
  title: string;
  description: string;
  terminal?: string;
  children: ReactNode;
}) {
  return (
    <main className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-ink px-4 py-16 text-fg">
      <div className="grid-bg pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgb(var(--accent)/0.12),transparent_55%)]" />
      {["left-5 top-5 border-l border-t", "right-5 top-5 border-r border-t", "bottom-5 left-5 border-b border-l", "bottom-5 right-5 border-b border-r"].map((c) => (
        <span key={c} aria-hidden className={`absolute h-8 w-8 border-accent/60 ${c}`} />
      ))}
      <Link href="/" className="absolute left-6 top-6 pl-8 font-mono text-xs tracking-tight sm:left-8 sm:top-7">
        <span className="text-accent">&gt;</span> revan<span className="text-muted">.dev</span>
      </Link>

      <div className="relative w-full max-w-xl text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
          <span className="text-accent">[{label}]</span>
        </p>
        <p
          data-text={code}
          aria-hidden
          className="glitch mt-4 bg-gradient-to-b from-fg to-fg/40 bg-clip-text text-[clamp(5rem,22vw,11rem)] font-bold leading-none tracking-[-0.06em] text-transparent"
        >
          {code}
        </p>
        <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-muted">{description}</p>

        {terminal && (
          <p className="mx-auto mt-8 w-fit max-w-full overflow-hidden rounded-xl border border-line bg-panel px-4 py-2.5 text-left font-mono text-xs text-muted">
            <span className="text-accent">$</span> {terminal}
            <span className="blink ml-1 text-accent">▍</span>
          </p>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">{children}</div>
      </div>
    </main>
  );
}

export const primaryAction = "inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5";
export const secondaryAction = "inline-flex items-center justify-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-semibold transition-colors hover:border-fg";
