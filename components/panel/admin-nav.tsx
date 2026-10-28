"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { FiActivity, FiInbox, FiMessageSquare, FiArrowUpRight } from "react-icons/fi";

const links = [
  { href: "/dashboard", label: "Overview", Icon: FiActivity },
  { href: "/dashboard/inbox", label: "Inbox", Icon: FiInbox },
  { href: "/dashboard/chats", label: "Aksa chats", Icon: FiMessageSquare },
];

export function AdminNav({ unread }: { unread: number }) {
  const path = usePathname();
  return (
    <aside className="flex shrink-0 flex-col gap-6 border-b border-line bg-panel px-4 py-4 md:h-screen md:w-60 md:border-b-0 md:border-r md:py-6">
      <Link href="/" className="font-mono text-sm">
        <span className="text-accent">&gt;</span> revan<span className="text-muted">.dev</span>
        <span className="ml-2 rounded border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-muted">admin</span>
      </Link>
      <nav className="flex gap-1 overflow-x-auto md:flex-col">
        {links.map(({ href, label, Icon }) => {
          const on = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-h-10 items-center gap-3 whitespace-nowrap rounded-xl px-3 text-sm transition-colors ${on ? "bg-accent/15 text-fg ring-1 ring-accent/40" : "text-muted hover:bg-ink hover:text-fg"}`}
            >
              <Icon className={on ? "text-accent" : ""} />
              {label}
              {href.endsWith("inbox") && unread > 0 && (
                <span className="ml-auto rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-semibold text-ink">{unread}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto hidden items-center justify-between gap-3 md:flex">
        <UserButton showName />
        <Link href="/" className="text-muted hover:text-accent" aria-label="Open site">
          <FiArrowUpRight />
        </Link>
      </div>
    </aside>
  );
}
