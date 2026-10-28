"use client";

import { AnimatePresence, animate, motion, useInView, useScroll, useTransform, type MotionValue } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { FaGithub, FaLinkedinIn, FaStackOverflow, FaInstagram, FaStar, FaWhatsapp } from "react-icons/fa";
import { FiArrowUpRight, FiCheck, FiChevronLeft, FiChevronRight, FiCopy, FiX } from "react-icons/fi";
import { personalData } from "@/utils/data/personal-data";
import { experiences } from "@/utils/data/experience";
import { certifications, educations } from "@/utils/data/educations";
import { projectsData } from "@/utils/data/projects-data";
import { skillsData } from "@/utils/data/skills";
import { skillsImage } from "@/utils/skill-image";
import ContactForm from "./contact-form";

const ease = [0.22, 1, 0.36, 1] as const;

function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

function Head({ n, label, title }: { n: string; label: string; title: ReactNode }) {
  return (
    <Reveal className="mb-10 sm:mb-16">
      <p className="mb-4 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted">
        <span className="text-accent">[{n}]</span> {label}
        <span className="h-px w-16 bg-line" />
      </p>
      <h2 className="max-w-3xl text-4xl font-bold leading-[1.02] tracking-[-0.03em] sm:text-6xl">{title}</h2>
    </Reveal>
  );
}

const Section = ({ id, children }: { id: string; children: ReactNode }) => (
  <section id={id} className="relative mx-auto max-w-7xl px-4 py-20 sm:px-8 sm:py-32">{children}</section>
);

/* ---------- skills ticker ---------- */

export function Ticker() {
  const half = Math.ceil(skillsData.length / 2);
  const rows = [skillsData.slice(0, half), skillsData.slice(half)];
  return (
    <div className="relative overflow-hidden border-y border-line bg-panel/60 py-6 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
      {rows.map((row, r) => (
        <div key={r} className={`marquee ${r ? "reverse mt-4" : ""}`}>
          {[...row, ...row].map((s, i) => (
            <span key={i} className="mx-3 flex shrink-0 items-center gap-3 rounded-full border border-line px-4 py-2 font-mono text-sm text-muted">
              {skillsImage(s) && <Image src={skillsImage(s)?.src} alt="" width={18} height={18} className="h-[18px] w-[18px]" />}
              {s}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ---------- about ---------- */

function Word({ word, range, progress }: { word: string; range: [number, number]; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return <motion.span style={{ opacity }}>{word} </motion.span>;
}

function Counter({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.6, ease, onUpdate: (v) => ref.current && (ref.current.textContent = v.toFixed(decimals) + suffix) });
    return () => c.stop();
  }, [inView, to, suffix, decimals]);
  return <span ref={ref}>{(0).toFixed(decimals)}{suffix}</span>;
}

const statement =
  "Since 2022 I have delivered 62 freelance orders for companies, small businesses and foundations across Indonesia: accounting ERPs, production trackers, cashier systems and Android apps. We talk before I write any code, I explain the trade-offs in plain language, and you get the full source code when we are done.";

const terminal: [string, string][] = [
  ["$", "whoami"],
  ["", "revan — full-stack web & android dev, jakarta"],
  ["$", "cat stack.json"],
  ["", '{ "back": ["Laravel", "Next.js", "CodeIgniter"],'],
  ["", '  "front": ["React", "Inertia", "Tailwind"],'],
  ["", '  "mobile": ["Android", "Java"],'],
  ["", '  "data": ["PostgreSQL", "MySQL", "Redis"] }'],
  ["$", "freelance --stats"],
  ["", "62 orders · ★ 5.0 · 22 repeat clients"],
  ["$", "status --now"],
];

// HUD-framed photo: corner brackets, ID label, one scan sweep when it enters view
function Portrait() {
  return (
    <figure className="force-dark group relative aspect-[5/6] w-full overflow-hidden rounded-2xl border border-line bg-ink shadow-[0_0_80px_-20px_rgb(var(--accent)/0.25)]">
      <Image
        src="/profile-hud.webp"
        alt={personalData.name}
        fill
        sizes="(min-width: 1024px) 40vw, 100vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />
      <motion.span
        aria-hidden
        className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-accent/25 to-transparent"
        initial={{ top: "-25%" }}
        whileInView={{ top: "110%" }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1.6, ease: "easeInOut", delay: 0.3 }}
      />
      {["left-3 top-3 border-l border-t", "right-3 top-3 border-r border-t", "bottom-3 left-3 border-b border-l", "bottom-3 right-3 border-b border-r"].map((c) => (
        <span key={c} aria-hidden className={`absolute h-5 w-5 border-accent ${c}`} />
      ))}
      <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-ink via-ink/70 to-transparent px-6 pb-6 pt-16 font-mono text-[11px] uppercase tracking-widest">
        <span>
          <span className="block text-muted">ID // dev-01</span>
          <span className="mt-1 block text-fg">{personalData.name}</span>
        </span>
        <span className="flex items-center gap-2 text-accent">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> online
        </span>
      </figcaption>
    </figure>
  );
}

export function About() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });
  const words = statement.split(" ");

  return (
    <Section id="about">
      <Head n="01" label="About" title={<>I build the software<br /><span className="text-muted">your business runs on.</span></>} />
      {/* phone: text, photo, terminal stacked · tablet: text, then photo | terminal · desktop: text + terminal | sticky photo */}
      <div className="grid items-start gap-x-6 gap-y-10 sm:grid-cols-[0.8fr_1.2fr] lg:grid-cols-[1.25fr_1fr] lg:gap-x-16 lg:gap-y-12">
        <div className="sm:col-span-2 lg:col-span-1 lg:col-start-1 lg:row-start-1">
          <p ref={ref} className="text-2xl font-medium leading-snug tracking-tight sm:text-3xl">
            {words.map((w, i) => (
              <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
            ))}
          </p>
          <div className="mt-12 grid grid-cols-3 gap-4 border-t border-line pt-8">
            {([
              [62, 0, "orders delivered"],
              [5, 1, "client rating"],
              [22, 0, "repeat clients"],
            ] as const).map(([v, d, l]) => (
              <div key={l}>
                <p className="text-4xl font-bold tracking-tight text-accent sm:text-5xl"><Counter to={v} decimals={d} /></p>
                <p className="mt-1 font-mono text-[10px] uppercase leading-snug tracking-wider text-muted sm:text-xs sm:tracking-widest">{l}</p>
              </div>
            ))}
          </div>
          <a href={personalData.socialLinks.fastwork} target="_blank" rel="noreferrer" className="mt-2 inline-flex min-h-11 items-center gap-1 font-mono text-xs uppercase tracking-widest text-muted hover:text-accent">
            See client reviews <FiArrowUpRight />
          </a>
        </div>

        <Reveal delay={0.15} className="sm:row-start-2 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <Portrait />
        </Reveal>

        <Reveal delay={0.2} className="sm:col-start-2 sm:row-start-2 lg:col-start-1">
          <div className="w-full overflow-hidden force-dark rounded-2xl border border-line bg-panel shadow-[0_0_80px_-20px_rgb(var(--accent)/0.25)]">
            <div className="flex items-center gap-2 border-b border-line px-4 py-3">
              {["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} className="h-3 w-3 rounded-full" style={{ background: c }} />)}
              <span className="ml-3 font-mono text-xs text-muted">revan@jakarta: ~</span>
            </div>
            <div className="space-y-1.5 p-5 font-mono text-[12px] leading-relaxed lg:text-[13px]">
              {terminal.map(([p, t], i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.18, duration: 0.4 }}
                  className={`whitespace-pre-wrap ${p ? "text-fg" : "text-muted"}`}
                >
                  {p && <span className="mr-2 text-accent">{p}</span>}
                  {t}
                </motion.p>
              ))}
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1.7 }} className="text-accent">
                ● open to work <span className="blink">▍</span>
              </motion.p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ---------- experience ---------- */

export function Experience() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "end 0.6"] });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <Section id="experience">
      <Head n="02" label="Experience" title={<>Where I&apos;ve<br /><span className="text-muted">shipped code.</span></>} />
      <ol ref={ref} className="relative ml-2 border-l border-line sm:ml-4">
        <motion.span style={{ scaleY }} className="absolute -left-px top-0 h-full w-px origin-top bg-gradient-to-b from-accent to-cyan" aria-hidden />
        {experiences.map((e, i) => (
          <li key={e.id} className="relative pb-16 pl-8 last:pb-0 sm:pl-14">
            <span className="absolute -left-[5px] top-2 h-[9px] w-[9px] rotate-45 border border-accent bg-ink" aria-hidden />
            <Reveal delay={i * 0.05} className="grid gap-4 lg:grid-cols-[220px_1fr] lg:gap-12">
              <p className="font-mono text-xs uppercase tracking-widest text-muted lg:pt-2">{e.duration.replace(/[()]/g, "")}</p>
              <div>
                <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">{e.title}</h3>
                <p className="mt-1 font-mono text-sm text-accent">@ {e.company}</p>
                <ul className="mt-5 space-y-2.5 text-muted">
                  {e.description.map((d) => (
                    <li key={d} className="flex gap-3 leading-relaxed">
                      <span className="mt-2.5 h-px w-3 shrink-0 bg-muted/60" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* ---------- projects ---------- */

const spot = (e: MouseEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
};

type Project = (typeof projectsData)[number];

// Full-screen viewer for a project's display images (arrow keys / swipe / Esc).
function Lightbox({ project, start, onClose }: { project: Project; start: number; onClose: () => void }) {
  const [i, setI] = useState(start);
  const n = project.images.length;
  const go = (d: number) => setI((v) => (v + d + n) % n);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((v) => (v + 1) % n);
      if (e.key === "ArrowLeft") setI((v) => (v - 1 + n) % n);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [n, onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={project.name}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[70] flex flex-col bg-ink/95 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between px-4 py-3 sm:px-8" onClick={(e) => e.stopPropagation()}>
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          <span className="text-accent">{project.name}</span> · {i + 1} / {n}
        </p>
        <button onClick={onClose} aria-label="Close gallery" className="flex h-11 w-11 items-center justify-center rounded-full border border-line hover:border-accent hover:text-accent">
          <FiX />
        </button>
      </div>
      <div className="relative flex flex-1 items-center justify-center px-4 pb-6 sm:px-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3, ease }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => Math.abs(info.offset.x) > 60 && go(info.offset.x < 0 ? 1 : -1)}
            onClick={(e) => e.stopPropagation()}
            className="relative aspect-[16/10] w-full max-w-6xl overflow-hidden rounded-xl border border-line"
          >
            <Image src={project.images[i]} alt={`${project.name} — screen ${i + 1}`} fill sizes="90vw" className="object-cover" priority />
          </motion.div>
        </AnimatePresence>
        {n > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous image" className="absolute left-2 hidden h-12 w-12 items-center justify-center rounded-full border border-line bg-ink/60 hover:border-accent hover:text-accent sm:left-4 sm:flex">
              <FiChevronLeft size={20} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next image" className="absolute right-2 hidden h-12 w-12 items-center justify-center rounded-full border border-line bg-ink/60 hover:border-accent hover:text-accent sm:right-4 sm:flex">
              <FiChevronRight size={20} />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

// Card gallery: shows image 1, crossfades to image 2 on hover, dots to pick, click to open the lightbox.
function Gallery({ project, onOpen }: { project: Project; onOpen: (i: number) => void }) {
  const [i, setI] = useState(0);
  return (
    <div
      className="relative -mx-6 -mt-6 mb-8 aspect-[16/10] overflow-hidden border-b border-line sm:-mx-10 sm:-mt-10"
      onMouseEnter={() => project.images.length > 1 && setI(1)}
      onMouseLeave={() => setI(0)}
    >
      {project.images.map((src, k) => (
        <Image
          key={src}
          src={src}
          alt={`${project.name} — screen ${k + 1}`}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className={`object-cover transition-all duration-700 ease-out group-hover:scale-[1.02] ${k === i ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <button onClick={() => onOpen(i)} aria-label={`Open ${project.name} gallery`} className="absolute inset-0 z-10" />
      <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 rounded-full bg-ink/70 px-2.5 py-1.5 backdrop-blur">
        {project.images.map((src, k) => (
          <button
            key={src}
            onClick={() => setI(k)}
            aria-label={`Show screen ${k + 1}`}
            className={`h-1.5 rounded-full transition-all ${k === i ? "w-5 bg-accent" : "w-1.5 bg-fg/40"}`}
          />
        ))}
      </div>
    </div>
  );
}

const INITIAL_PROJECTS = 4;

export function Projects() {
  const [open, setOpen] = useState<{ p: Project; i: number } | null>(null);
  const [all, setAll] = useState(false);
  const shown = all ? projectsData : projectsData.slice(0, INITIAL_PROJECTS);
  const more = projectsData.length - INITIAL_PROJECTS;
  const toggle = () => {
    if (all) document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
    setAll(!all);
  };
  return (
    <Section id="projects">
      <Head n="03" label="Selected work" title={<>Things I&apos;ve<br /><span className="text-muted">designed &amp; built.</span></>} />
      <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-card md:grid-cols-2">
        {shown.map((p, i) => {
          const href = p.demo || p.code;
          return (
            <motion.article
              key={p.id}
              onMouseMove={spot}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, delay: (i % 2) * 0.1 }}
              className="spotlight group flex flex-col bg-ink p-6 sm:p-10"
            >
              {p.images.length > 0 && <Gallery project={p} onOpen={(k) => setOpen({ p, i: k })} />}
              <div className="flex items-start justify-between gap-4">
                <span className="font-mono text-xs text-muted">P/{String(i + 1).padStart(2, "0")}{p.year && ` · ${p.year}`}</span>
                <span className="font-mono text-[11px] uppercase tracking-widest text-cyan">{p.category}</span>
              </div>
              <h3 className="mt-5 text-2xl font-semibold leading-tight tracking-tight transition-colors group-hover:text-accent sm:text-[1.75rem]">
                {p.name}
              </h3>
              <p className="mt-4 flex-1 leading-relaxed text-muted">{p.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {p.tools.map((t) => (
                  <span key={t} className="rounded-md border border-line px-2 py-1 font-mono text-[11px] text-muted">{t}</span>
                ))}
              </div>
              {href && (
                <a href={href} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-1 self-start font-mono text-xs uppercase tracking-widest hover:text-accent">
                  {p.demo ? "Live demo" : "Source on GitHub"} <FiArrowUpRight />
                </a>
              )}
            </motion.article>
          );
        })}
      </div>
      {more > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={toggle}
            aria-expanded={all}
            className="group inline-flex min-h-11 items-center gap-3 rounded-full border border-line bg-panel px-6 py-3 font-mono text-xs uppercase tracking-widest transition-colors hover:border-accent hover:text-accent"
          >
            {all ? "Show less" : `Show ${more} more projects`}
            <FiChevronRight className={`transition-transform ${all ? "-rotate-90" : "rotate-90 group-hover:translate-y-0.5"}`} />
          </button>
        </div>
      )}
      <AnimatePresence>{open && <Lightbox project={open.p} start={open.i} onClose={() => setOpen(null)} />}</AnimatePresence>
    </Section>
  );
}

/* ---------- live github ---------- */

interface Repo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  fork: boolean;
}

export function Repos() {
  const [repos, setRepos] = useState<Repo[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // ponytail: unauthenticated GitHub API (60 req/h per visitor IP) — plenty for a portfolio
    fetch(`https://api.github.com/users/${personalData.username}/repos?per_page=100&sort=pushed`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((all: Repo[]) => setRepos(all.filter((r) => !r.fork && r.description && r.name !== personalData.username).slice(0, 6)))
      .catch(() => setFailed(true));
  }, []);

  return (
    <Section id="repository">
      <Head n="04" label="Open source · live feed" title={<>Fresh from<br /><span className="text-muted">my GitHub.</span></>} />
      {failed ? (
        <a href={personalData.socialLinks.github} className="font-mono text-accent">github.com/{personalData.username} ↗</a>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(repos ?? Array.from({ length: 6 }, () => null)).map((r, i) => (
            <Reveal key={r?.id ?? i} delay={(i % 3) * 0.08}>
              {r ? (
                <a
                  href={r.html_url}
                  target="_blank"
                  rel="noreferrer"
                  onMouseMove={spot}
                  className="spotlight group flex h-full min-h-[200px] flex-col rounded-2xl border border-line bg-panel shadow-card p-6 transition-colors hover:border-accent/40"
                >
                  <div className="flex items-center justify-between">
                    <FaGithub className="text-muted" />
                    <FiArrowUpRight className="text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                  </div>
                  <h3 className="mt-5 font-mono text-lg font-medium">{r.name}</h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">{r.description}</p>
                  <div className="mt-5 flex items-center gap-4 font-mono text-xs text-muted">
                    {r.language && <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan" />{r.language}</span>}
                    <span className="flex items-center gap-1"><FaStar /> {r.stargazers_count}</span>
                    <span className="ml-auto">{new Date(r.pushed_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span>
                  </div>
                </a>
              ) : (
                <div className="h-[200px] animate-pulse rounded-2xl border border-line bg-panel" />
              )}
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  );
}

/* ---------- education ---------- */

export function Education() {
  return (
    <Section id="education">
      <Head n="05" label="Education" title={<>Foundations &amp;<br /><span className="text-muted">credentials.</span></>} />
      <div className="border-t border-line">
        {educations.map((e, i) => (
          <Reveal key={e.id} delay={i * 0.08}>
            <div className="grid gap-2 border-b border-line py-8 sm:grid-cols-[160px_1fr_auto] sm:items-baseline sm:gap-8">
              <p className="font-mono text-xs uppercase tracking-widest text-accent">{e.duration}</p>
              <div>
                <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">{e.subtitle}</h3>
                <p className="mt-1 text-muted">{e.institution}</p>
              </div>
              <p className="font-mono text-xs uppercase tracking-widest text-muted">{e.title}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-16">
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-muted">Certifications</p>
        <div className="grid gap-4 md:grid-cols-3">
          {certifications.map((c) => (
            <div key={c.name} onMouseMove={spot} className="spotlight rounded-2xl border border-line bg-panel shadow-card p-6">
              <p className="font-mono text-xs text-accent">{c.date}</p>
              <h3 className="mt-3 font-semibold leading-snug">{c.name}</h3>
              <p className="mt-1 text-sm text-muted">{c.issuer}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

/* ---------- contact ---------- */

// The number is assembled on click instead of being written into the HTML, to keep it away from scrapers.
export const openWhatsApp = (e: MouseEvent<HTMLElement>) => {
  e.preventDefault();
  const text = encodeURIComponent("Halo Revan, saya lihat portofolio Anda dan ingin diskusi proyek.");
  window.open(`https://wa.me/${personalData.contact.whatsapp}?text=${text}`, "_blank", "noopener");
};

const socials = [
  ["GitHub", personalData.socialLinks.github, FaGithub],
  ["LinkedIn", personalData.socialLinks.linkedIn, FaLinkedinIn],
  ["Stack Overflow", personalData.socialLinks.stackOverflow, FaStackOverflow],
  ["Instagram", personalData.socialLinks.instagram, FaInstagram],
] as const;

export function Contact() {
  const [copied, setCopied] = useState(false);
  const email = personalData.contact.email;
  const copy = () => {
    navigator.clipboard?.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <Section id="contact">
      <div className="grid-bg pointer-events-none absolute inset-0 -z-10" />
      <Reveal>
        <p className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted">
          <span className="text-accent">[06]</span> Contact <span className="h-px w-16 bg-line" />
        </p>
        <h2 className="text-[clamp(2.8rem,9vw,7.5rem)] font-bold leading-[0.9] tracking-[-0.04em]">
          Let&apos;s build<br />
          <span className="bg-gradient-to-r from-accent via-cyan to-accent bg-[length:200%_auto] bg-clip-text text-transparent">something sharp.</span>
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_1.1fr]">
        <Reveal delay={0.1}>
          <button onClick={copy} className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-line bg-panel shadow-card px-6 py-5 text-left transition-colors hover:border-accent/50">
            <span>
              <span className="block font-mono text-xs uppercase tracking-widest text-muted">Email</span>
              <span className="mt-1 block break-all text-lg font-medium sm:text-xl">{email}</span>
            </span>
            <span className="flex shrink-0 items-center gap-2 font-mono text-xs text-muted group-hover:text-accent">
              {copied ? <><FiCheck /> copied</> : <><FiCopy /> copy</>}
            </span>
          </button>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {socials.map(([label, href, Icon]) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noreferrer" className="group flex items-center gap-4 py-4 transition-colors hover:text-accent">
                  <Icon className="text-muted group-hover:text-accent" />
                  <span className="font-medium">{label}</span>
                  <FiArrowUpRight className="ml-auto text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-6 font-mono text-xs uppercase tracking-widest text-muted">{personalData.contact.address}</p>
        </Reveal>
        <Reveal delay={0.2}>
          <ContactForm />
        </Reveal>
      </div>
    </Section>
  );
}

/* ---------- quick connect ---------- */

// Two equal-weight ways to reach me from a phone: scan or tap.
export function QuickConnect() {
  const cards = [
    {
      label: "Direct",
      title: "Chat on WhatsApp",
      desc: "Fastest way to ask a question or describe your project.",
      href: "#connect",
      onClick: openWhatsApp,
      qr: "/whatsapp-qr.svg",
      cta: "Open WhatsApp",
      Icon: FaWhatsapp,
    },
    {
      label: "Platform",
      title: "Order via Fastwork",
      desc: "Prefer a marketplace with reviews and managed payment.",
      href: personalData.socialLinks.fastwork,
      onClick: undefined,
      qr: "/fastwork-qr.svg",
      cta: "Open profile",
      Icon: FiArrowUpRight,
    },
  ];

  return (
    <section id="connect" className="relative mx-auto max-w-7xl px-4 pb-24 sm:px-8 sm:pb-32">
      <Reveal className="mb-8">
        <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted">
          <span className="text-accent">[07]</span> Quick connect <span className="h-px w-16 bg-line" />
        </p>
      </Reveal>
      <div className="grid gap-4 lg:grid-cols-2">
        {cards.map(({ label, title, desc, href, onClick, qr, cta, Icon }, i) => (
          <Reveal key={title} delay={i * 0.08}>
            <div onMouseMove={spot} className="spotlight group flex h-full items-center gap-5 rounded-2xl border border-line bg-panel p-5 shadow-card transition-colors hover:border-accent/40 sm:gap-7 sm:p-7">
              <a href={href} onClick={onClick} target="_blank" rel="noreferrer" aria-label={`${title} QR code`} className="relative shrink-0">
                <span className="relative block overflow-hidden rounded-xl bg-white p-1.5">
                  <Image src={qr} alt="" width={120} height={120} unoptimized className="h-24 w-24 sm:h-28 sm:w-28" />
                  <span aria-hidden className="qr-scan pointer-events-none absolute inset-x-1.5 h-8 bg-gradient-to-b from-transparent via-accent/40 to-transparent" />
                </span>
              </a>
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{label} · scan or tap</p>
                <h3 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{desc}</p>
                <a href={href} onClick={onClick} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-2 font-mono text-xs uppercase tracking-widest text-fg transition-colors hover:text-accent">
                  <Icon /> {cta}
                </a>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line pb-24 lg:pb-0">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 font-mono text-xs text-muted sm:flex-row sm:justify-between sm:px-8">
        <span>© {new Date().getFullYear()} {personalData.name}</span>
        <span>Designed &amp; built in Jakarta · Next.js + Framer Motion</span>
      </div>
    </footer>
  );
}
