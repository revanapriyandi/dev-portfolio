"use client";

import type { MouseEvent, ReactElement } from "react";
import { FaGithub, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import { FiArrowUpRight, FiBookOpen, FiCrosshair, FiMail } from "react-icons/fi";
import { personalData } from "@/utils/data/personal-data";
import { projectsData } from "@/utils/data/projects-data";
import { openWhatsApp } from "./sections";

// Only these tags do anything; whatever else the model writes stays plain text,
// so a prompt-injected reply can't turn into a link to somewhere unknown.
const BUTTONS = ["whatsapp", "fastwork", "email", "resume", "github", "linkedin"] as const;
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

// Links the model may still write out in full: only Revan's own, mapped to their button.
const KNOWN_LINKS: [RegExp, Button][] = [
  [/https?:\/\/(?:www\.)?fastwork\.(?:com|id)\/[^\s)]*/gi, "fastwork"],
  [/https?:\/\/(?:www\.)?github\.com\/revanapriyandi[^\s)]*/gi, "github"],
  [/https?:\/\/(?:www\.)?linkedin\.com\/in\/revan-apriyandi[^\s)]*/gi, "linkedin"],
  [new RegExp(personalData.contact.email.replace(/[.+]/g, "\\$&"), "gi"), "email"],
];

export type Reply = { text: string; buttons: Button[]; goto: string | null };

export function parseReply(raw: string): Reply {
  const buttons = new Set<Button>();
  let goto: string | null = null;

  let text = raw.replace(/\[\[\s*([a-z]+)(?::([a-z0-9:-]+))?\s*\]\]/gi, (_, name: string, arg?: string) => {
    const key = name.toLowerCase();
    if ((BUTTONS as readonly string[]).includes(key)) buttons.add(key as Button);
    if (key === "goto" && arg && !goto && targetLabel(arg)) goto = arg.toLowerCase();
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
  text = text.replace(/\(\s*\)/g, "").replace(/\s+([,.;:!?])/g, "$1").replace(/[ \t]{2,}/g, " ").trim();

  return { text, buttons: [...buttons].slice(0, 3), goto };
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
  setTimeout(() => {
    const el = document.getElementById(isProject ? `project-${t.slice(8)}` : t);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: isProject ? "center" : "start" });
    el.classList.remove("aksa-focus");
    void el.offsetWidth; // restart the animation if it is still running
    el.classList.add("aksa-focus");
    setTimeout(() => el.classList.remove("aksa-focus"), 3200);
  }, isProject ? 350 : 0);
}

const chip =
  "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors";

export function ReplyActions({ reply, onGoto }: { reply: Reply; onGoto: (target: string) => void }) {
  if (!reply.buttons.length && !reply.goto) return null;
  const link = (href: string, label: string, Icon: typeof FiMail) => (
    <a key={label} href={href} target="_blank" rel="noreferrer" className={`${chip} border-line hover:border-accent hover:text-accent`}>
      <Icon /> {label} <FiArrowUpRight className="opacity-60" />
    </a>
  );
  const render: Record<Button, () => ReactElement> = {
    whatsapp: () => (
      <a key="wa" href="#connect" onClick={(e: MouseEvent<HTMLElement>) => openWhatsApp(e)} className={`${chip} border-[#25D366]/50 bg-[#25D366]/15 text-fg hover:bg-[#25D366]/25`}>
        <FaWhatsapp className="text-[#25D366]" /> Chat on WhatsApp
      </a>
    ),
    fastwork: () => link(personalData.socialLinks.fastwork, "Fastwork", FiArrowUpRight),
    email: () => link(`mailto:${personalData.contact.email}`, "Email Revan", FiMail),
    github: () => link(personalData.socialLinks.github, "GitHub", FaGithub),
    linkedin: () => link(personalData.socialLinks.linkedIn, "LinkedIn", FaLinkedinIn),
    resume: () => (
      <button key="cv" onClick={() => window.dispatchEvent(new Event("aksa:open-resume"))} className={`${chip} border-line hover:border-accent hover:text-accent`}>
        <FiBookOpen /> Open resume
      </button>
    ),
  };

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {reply.goto && (
        <button onClick={() => onGoto(reply.goto!)} className={`${chip} border-accent/50 bg-accent/10 text-accent hover:bg-accent/20`}>
          <FiCrosshair /> Show {targetLabel(reply.goto)}
        </button>
      )}
      {reply.buttons.map((b) => render[b]())}
    </div>
  );
}
