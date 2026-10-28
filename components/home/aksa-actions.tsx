"use client";

import Image from "next/image";
import { useEffect, useState, type MouseEvent, type ReactElement } from "react";
import { FaGithub, FaLinkedinIn, FaStar, FaWhatsapp } from "react-icons/fa";
import { FiArrowUpRight, FiBookOpen, FiCheck, FiCopy, FiCrosshair, FiLock, FiMail } from "react-icons/fi";
import { personalData } from "@/utils/data/personal-data";
import { projectsData } from "@/utils/data/projects-data";
import { githubAccounts } from "@/utils/data/github-accounts";
import type { RepoCard } from "@/utils/github";
import { MAX_ASSISTANT_CARDS } from "@/utils/assistant-cards";
import ChatCardSlider from "./chat-card-slider";
import { openWhatsApp } from "./sections";

// Only these tags do anything; whatever else the model writes stays plain text,
// so a prompt-injected reply can't turn into a link to somewhere unknown.
const BUTTONS = ["whatsapp", "fastwork", "email", "resume", "github", "githubold", "linkedin"] as const;
type Button = (typeof BUTTONS)[number];

const SECTIONS: Record<string, string> = {
  about: "About",
  experience: "Experience",
  projects: "Projects",
  repository: "GitHub repos",
  education: "Education",
  contact: "Contact",
  connect: "Quick connect",
};
const PROJECTS = Object.fromEntries(projectsData.map((p) => [p.slug, p.name]));
const REPO_NAME = /^[\w.-]{1,39}\/[\w.-]{1,100}(?::\d{10}:[a-f0-9]{64})?$/;

// Links the model may still write out in full: only Revan's own, mapped to their button.
const KNOWN_LINKS: [RegExp, Button][] = [
  [/https?:\/\/(?:www\.)?fastwork\.(?:com|id)\/[^\s)]*/gi, "fastwork"],
  ...githubAccounts.map((account, index): [RegExp, Button] => [
    new RegExp(`https?://(?:www\\.)?github\\.com/${account}(?=[/\\s)#?]|$)[^\\s)]*`, "gi"),
    index === 0 ? "github" : "githubold",
  ]),
  [/https?:\/\/(?:www\.)?linkedin\.com\/in\/revan-apriyandi[^\s)]*/gi, "linkedin"],
  [new RegExp(personalData.contact.email.replace(/[.+]/g, "\\$&"), "gi"), "email"],
];

export type Reply = {
  text: string;
  buttons: Button[];
  goto: string | null;
  projects: string[];
  repos: string[];
};

export function parseReply(raw: string): Reply {
  const buttons = new Set<Button>();
  let goto: string | null = null;
  const projects = new Set<string>();
  const repos = new Set<string>();

  let text = raw.replace(/\[\[\s*([a-z]+)(?::([\w./:-]+))?\s*\]\]/gi, (_, name: string, arg?: string) => {
    const key = name.toLowerCase();
    if ((BUTTONS as readonly string[]).includes(key)) buttons.add(key as Button);
    if (key === "goto" && arg && !goto && targetLabel(arg)) goto = arg.toLowerCase();
    if (key === "project" && arg && PROJECTS[arg.toLowerCase()]) projects.add(arg.toLowerCase());
    // repo names are checked server-side: unknown ones simply return no card
    if (key === "repo" && arg && REPO_NAME.test(arg)) repos.add(arg);
    return "";
  });
  text = text.replace(/\[\[[^\]]*$/, ""); // a tag still streaming in

  for (const [re, button] of KNOWN_LINKS) {
    text = text.replace(re, () => {
      buttons.add(button);
      return "";
    });
  }
  // tidy what removed links leave behind: "( )", ", ." and doubled spaces
  text = text
    .replace(/\(\s*\)/g, "")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  return {
    text,
    buttons: [...buttons].slice(0, 3),
    goto,
    projects: [...projects].slice(0, MAX_ASSISTANT_CARDS),
    repos: [...repos].slice(0, Math.max(0, MAX_ASSISTANT_CARDS - projects.size)),
  };
}

export function targetLabel(target: string) {
  const t = target.toLowerCase();
  if (t.startsWith("project:")) return PROJECTS[t.slice(8)] ?? null;
  return SECTIONS[t] ?? null;
}

// Scroll to a section or project card and give it a short "selected" glow.
export function focusTarget(target: string) {
  const t = target.toLowerCase();
  const isProject = t.startsWith("project:");
  if (isProject) window.dispatchEvent(new Event("aksa:show-all-projects"));
  // let a just-expanded project list render before measuring
  setTimeout(
    () => {
      const el = document.getElementById(isProject ? `project-${t.slice(8)}` : t);
      if (!el) return;
      el.scrollIntoView({
        behavior: "smooth",
        block: isProject ? "center" : "start",
      });
      el.classList.remove("aksa-focus");
      void el.offsetWidth; // restart the animation if it is still running
      el.classList.add("aksa-focus");
      setTimeout(() => el.classList.remove("aksa-focus"), 3200);
    },
    isProject ? 350 : 0,
  );
}

const chip = "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors";

function RepoCards({ names }: { names: string[] }) {
  const [result, setResult] = useState<{ key: string; repos: RepoCard[]; failed: boolean } | null>(null);
  const key = names.join(",");
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/repos?names=${encodeURIComponent(key)}`, { signal: controller.signal, cache: "no-store" })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((repos: RepoCard[]) => setResult({ key, repos, failed: false }))
      .catch(() => { if (!controller.signal.aborted) setResult({ key, repos: [], failed: true }); });
    return () => controller.abort();
  }, [key]);

  if (result?.key !== key) return <p role="status" className="swiper-slide text-xs text-muted">Loading repository cards…</p>;
  if (result.failed) return <p role="status" className="swiper-slide text-xs text-muted">Repository cards are unavailable. Please try again later.</p>;
  if (!result.repos.length) return <p role="status" className="swiper-slide text-xs text-muted">This card is unavailable or has expired. Ask Aksa for a new recommendation.</p>;

  return result.repos.map((r) => {
    const body = (
      <>
        <span className="flex items-center gap-2 font-mono text-sm font-medium">
          <FaGithub className="shrink-0 text-muted" />
          <span className="min-w-0 truncate" title={r.fullName}>{r.fullName}</span>
          {r.private ? (
            <span className="ml-auto flex shrink-0 items-center gap-1 rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted">
              <FiLock /> Private
            </span>
          ) : (
            <FiArrowUpRight className="ml-auto shrink-0 text-muted" />
          )}
        </span>
        {r.description && <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{r.description}</span>}
        <span className="mt-2 flex items-center gap-3 font-mono text-[11px] text-muted">
          {r.language && (
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
              {r.language}
            </span>
          )}
          {!r.private && (
            <span className="flex items-center gap-1">
              <FaStar /> {r.stars}
            </span>
          )}
        </span>
      </>
    );
    const box = "swiper-slide block w-full min-w-0 rounded-2xl border border-line bg-ink/60 px-3.5 py-3 text-left";
    return (
      <div key={r.fullName} data-aksa-card className={box} title={r.private ? "Source code is private" : undefined}>
        {r.url ? <a href={r.url} target="_blank" rel="noreferrer" className="block rounded-md hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">{body}</a> : body}
        {r.lastCommit && (
          <div className="mt-3 border-t border-line pt-2 text-[11px] text-muted">
            <p>Last commit · {new Date(r.lastCommit.date).toLocaleDateString("en-GB", { timeZone: "Asia/Jakarta", day: "numeric", month: "short", year: "numeric" })}</p>
            <p className="mt-1 line-clamp-2 break-words">{r.lastCommit.message}</p>
            {r.lastCommit.url ? <a href={r.lastCommit.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex min-h-8 items-center gap-1 font-mono text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">View commit {r.lastCommit.sha.slice(0, 7)} <FiArrowUpRight /></a> : <span className="mt-1 block font-mono">{r.lastCommit.sha.slice(0, 7)}</span>}
          </div>
        )}
      </div>
    );
  });
}

export function ReplyActions({ reply, onGoto, handoffMessage }: { reply: Reply; onGoto: (target: string) => void; handoffMessage: string }) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  if (!reply.buttons.length && !reply.goto && !reply.projects.length && !reply.repos.length) return null;
  const link = (href: string, label: string, Icon: typeof FiMail) => (
    <a key={label} href={href} target="_blank" rel="noreferrer" className={`${chip} border-line hover:border-accent hover:text-accent`}>
      <Icon /> {label} <FiArrowUpRight className="opacity-60" />
    </a>
  );
  const render: Record<Button, () => ReactElement> = {
    whatsapp: () => (
      <a
        key="wa"
        href="#connect"
        onClick={(e: MouseEvent<HTMLElement>) => openWhatsApp(e, handoffMessage)}
        className={`${chip} border-[#25D366]/50 bg-[#25D366]/15 text-fg hover:bg-[#25D366]/25`}
      >
        <FaWhatsapp className="text-[#25D366]" /> Chat on WhatsApp
      </a>
    ),
    fastwork: () => link(personalData.socialLinks.fastwork, "Fastwork", FiArrowUpRight),
    email: () => link(`mailto:${personalData.contact.email}?subject=${encodeURIComponent("Diskusi proyek dari Aksa")}&body=${encodeURIComponent(handoffMessage)}`, "Email Revan", FiMail),
    github: () => link(personalData.socialLinks.github, "GitHub", FaGithub),
    githubold: () => link(`https://github.com/${githubAccounts[1]}`, "GitHub · older account", FaGithub),
    linkedin: () => link(personalData.socialLinks.linkedIn, "LinkedIn", FaLinkedinIn),
    resume: () => (
      <button key="cv" onClick={() => window.dispatchEvent(new Event("aksa:open-resume"))} className={`${chip} border-line hover:border-accent hover:text-accent`}>
        <FiBookOpen /> Open resume
      </button>
    ),
  };

  return (
    <>
      {(reply.projects.length > 0 || reply.repos.length > 0) && (
        <ChatCardSlider>
          {reply.projects.map((slug) => {
            const p = projectsData.find((x) => x.slug === slug)!;
            return (
              <button
                key={slug}
                data-aksa-card
                onClick={() => onGoto(`project:${slug}`)}
                className="swiper-slide group block w-full min-w-0 overflow-hidden rounded-2xl border border-line bg-ink/60 text-left transition-colors hover:border-accent/50 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
              >
                <span className="relative block aspect-[16/10] w-full overflow-hidden border-b border-line bg-ink">
                  <Image src={p.images[0]} alt={`${p.name} preview`} fill sizes="(max-width: 640px) 80vw, 320px" className="object-contain" />
                </span>
                <span className="block px-3.5 py-3">
                  <span className="flex items-start justify-between gap-3">
                    <span className="block min-w-0 text-sm font-medium leading-snug">{p.name}</span>
                    <FiCrosshair className="mt-0.5 shrink-0 text-muted transition-colors group-hover:text-accent" />
                  </span>
                  <span className="mt-1 block font-mono text-[10px] text-muted">
                    {p.category} · {p.year}
                  </span>
                  <span className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">{p.description}</span>
                </span>
              </button>
            );
          })}
          {reply.repos.length > 0 && <RepoCards names={reply.repos} />}
        </ChatCardSlider>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        {reply.goto && (
          <button onClick={() => onGoto(reply.goto!)} className={`${chip} border-accent/50 bg-accent/10 text-accent hover:bg-accent/20`}>
            <FiCrosshair /> Show {targetLabel(reply.goto)}
          </button>
        )}
        {reply.buttons.map((b) => render[b]())}
        {reply.buttons.some((b) => ["whatsapp", "email", "fastwork"].includes(b)) && (
          <button className={`${chip} border-line hover:border-accent hover:text-accent`} onClick={async () => {
            try { await navigator.clipboard.writeText(handoffMessage); setCopyStatus("copied"); }
            catch { setCopyStatus("failed"); }
          }}>
            {copyStatus === "copied" ? <FiCheck /> : <FiCopy />}
            {copyStatus === "copied" ? "Summary copied" : copyStatus === "failed" ? "Copy failed · try again" : "Copy conversation summary"}
          </button>
        )}
      </div>
    </>
  );
}
