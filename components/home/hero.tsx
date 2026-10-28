"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll } from "framer-motion";
import { FiBookOpen, FiBriefcase, FiGrid, FiHome, FiMoon, FiSend, FiSun, FiUser } from "react-icons/fi";
import ResumeBook from "./resume-book";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { personalData } from "@/utils/data/personal-data";

const ease = [0.22, 1, 0.36, 1] as const;
const roles = ["Full-Stack Web Developer", "Android Developer", "Laravel · React · Next.js"];
const links = [
  ["about", "01"],
  ["experience", "02"],
  ["projects", "03"],
  ["contact", "04"],
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [book, setBook] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease, delay: 0.2 }}
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled ? "border-b border-line bg-ink/70 backdrop-blur-xl" : ""}`}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
          <a href="#top" className="flex min-h-11 items-center font-mono text-sm tracking-tight">
            <span className="text-accent">&gt;</span>&nbsp;revan<span className="text-muted">.dev</span>
          </a>
          <ul className="hidden items-center gap-8 md:flex">
            {links.map(([id, n]) => (
              <li key={id}>
                <a href={`#${id}`} className="group font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-fg">
                  <span className="text-accent/70 group-hover:text-accent">{n}</span> {id}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setBook(true)}
            className="flex min-h-11 items-center gap-2 rounded-full border border-line px-4 font-mono text-xs uppercase tracking-widest transition-colors hover:border-accent hover:text-accent md:min-h-0 md:py-1.5"
          >
            <FiBookOpen /> Resume
          </button>
          </div>
        </nav>
      </motion.header>
      <BottomNav />
      <ResumeBook open={book} onClose={() => setBook(false)} />
    </>
  );
}

// Dark by default; the choice is remembered per visitor (see the inline script in app/layout.tsx).
const subscribeTheme = (cb: () => void) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
};

function ThemeToggle() {
  const light = useSyncExternalStore(subscribeTheme, () => document.documentElement.dataset.theme === "light", () => false);
  const flip = () => {
    const next = !light;
    if (next) document.documentElement.dataset.theme = "light";
    else delete document.documentElement.dataset.theme;
    try {
      localStorage.setItem("theme", next ? "light" : "dark");
    } catch {}
  };
  return (
    <button
      onClick={flip}
      aria-label={light ? "Switch to dark theme" : "Switch to light theme"}
      className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-line transition-colors hover:border-accent hover:text-accent md:h-8 md:w-8"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={light ? "sun" : "moon"} initial={{ y: 14, rotate: -90, opacity: 0 }} animate={{ y: 0, rotate: 0, opacity: 1 }} exit={{ y: -14, rotate: 90, opacity: 0 }} transition={{ duration: 0.3 }}>
          {light ? <FiSun size={15} /> : <FiMoon size={15} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

const tabs = [
  { id: "top", label: "Home", Icon: FiHome },
  { id: "about", label: "About", Icon: FiUser },
  { id: "experience", label: "Work", Icon: FiBriefcase },
  { id: "projects", label: "Projects", Icon: FiGrid },
  { id: "contact", label: "Contact", Icon: FiSend },
];

// Mobile-only floating tab bar: tracks the section in view, slides an accent pill to it,
// draws scroll progress along its top edge, and tucks away while scrolling down.
function BottomNav() {
  const [active, setActive] = useState("top");
  const [hidden, setHidden] = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    tabs.forEach((t) => {
      const el = document.getElementById(t.id);
      if (el) io.observe(el);
    });
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > last + 4 && y > 400);
      if (y < last - 4) setHidden(false);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <motion.nav
      aria-label="Section navigation"
      initial={{ y: 120 }}
      animate={{ y: hidden ? 120 : 0 }}
      transition={{ duration: 0.5, ease }}
      className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 md:hidden"
    >
      <div className="relative overflow-hidden rounded-[1.6rem] border border-line bg-panel/80 p-1.5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        <motion.span aria-hidden style={{ scaleX: scrollYProgress }} className="absolute inset-x-0 top-0 h-px origin-left bg-gradient-to-r from-accent to-cyan" />
        <ul className="relative grid grid-cols-5">
          {tabs.map(({ id, label, Icon }) => {
            const on = active === id;
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={on ? "true" : undefined}
                  onClick={() => navigator.vibrate?.(8)}
                  className="relative flex h-14 flex-col items-center justify-center gap-1"
                >
                  {on && (
                    <motion.span
                      layoutId="tab-pill"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      className="absolute inset-0 rounded-[1.2rem] bg-accent/15 ring-1 ring-accent/40"
                    />
                  )}
                  <motion.span animate={{ y: on ? -1 : 0, scale: on ? 1.12 : 1 }} className={`relative ${on ? "text-accent" : "text-muted"}`}>
                    <Icon size={19} />
                  </motion.span>
                  <span className={`relative font-mono text-[9px] uppercase tracking-wider ${on ? "text-fg" : "text-muted"}`}>{label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </motion.nav>
  );
}

// Animated dot field: a radial wave rolls out from the centre, dots light up near the cursor.
function SignalField() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const gap = 26;
    const mouse = { x: -9999, y: -9999 };
    let w = 0, h = 0, raf = 0, visible = true;
    // dot colours come from the CSS tokens so light/dark both work
    const col = { accent: "", dot: "", scan: "", dotA: 1 };
    const themeWatch = new MutationObserver(() => readColors());
    const readColors = () => {
      const s = getComputedStyle(document.documentElement);
      col.accent = s.getPropertyValue("--accent").trim().split(" ").join(",");
      col.dot = s.getPropertyValue("--dot").trim().split(" ").join(",");
      col.scan = s.getPropertyValue("--scan").trim().split(" ").join(",");
      col.dotA = parseFloat(s.getPropertyValue("--dot-a")) || 1;
      if (reduce) draw(0);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t: number) => {
      const time = t * 0.001;
      const cx = w * 0.5, cy = h * 0.6;
      ctx.clearRect(0, 0, w, h);
      for (let y = gap / 2; y < h; y += gap) {
        for (let x = gap / 2; x < w; x += gap) {
          const wave = (Math.sin(Math.hypot(x - cx, y - cy) * 0.018 - time * 2) + 1) / 2;
          const near = Math.max(0, 1 - Math.hypot(x - mouse.x, y - mouse.y) / 170);
          const s = 1 + wave * 1.2 + near * 2.4;
          ctx.fillStyle = near > 0.04
            ? `rgba(${col.accent},${0.15 + near * 0.8})`
            : `rgba(${col.dot},${(0.06 + wave * 0.22) * col.dotA})`;
          ctx.fillRect(x - s / 2, y - s / 2 + wave * 5, s, s);
        }
      }
      // slow horizontal scan line
      const sy = ((time * 90) % (h + 160)) - 80;
      const g = ctx.createLinearGradient(0, sy - 80, 0, sy);
      g.addColorStop(0, `rgba(${col.scan},0)`);
      g.addColorStop(0.85, `rgba(${col.scan},0.08)`);
      g.addColorStop(1, `rgba(${col.scan},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, sy - 80, w, 80);
    };

    const loop = (t: number) => {
      if (visible) draw(t);
      raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));

    resize();
    readColors();
    io.observe(canvas);
    window.addEventListener("resize", resize);
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    if (!reduce) {
      window.addEventListener("pointermove", onMove);
      raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      themeWatch.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduce]);

  return <canvas ref={ref} aria-hidden className="absolute inset-0 h-full w-full" />;
}

const GLYPHS = "!<>-_/[]{}=+*^?#01ABCDEFX";

// One letter of the name: rises in, decodes from random glyphs, re-scrambles on hover,
// and joins the periodic lime wave (.name-wave in globals.scss, staggered by --i).
function Letter({ c, i, delay }: { c: string; i: number; delay: number }) {
  const [ch, setCh] = useState(c);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);
  const reduce = useReducedMotion();

  const scramble = (ms: number) => {
    if (reduce || c === " ") return;
    clearInterval(timer.current);
    let t = 0;
    timer.current = setInterval(() => {
      t += 45;
      if (t >= ms) {
        clearInterval(timer.current);
        setCh(c);
      } else setCh(GLYPHS[Math.floor(Math.random() * GLYPHS.length)]);
    }, 45);
  };

  useEffect(() => {
    const start = setTimeout(() => scramble(380 + i * 30), delay * 1000);
    return () => {
      clearTimeout(start);
      clearInterval(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (c === " ") return <span className="inline-block">{" "}</span>;
  return (
    <motion.span
      className="name-wave inline-block cursor-default hover:[--glow:1] hover:[animation:none]"
      style={{ "--i": i } as React.CSSProperties}
      initial={{ y: "110%" }}
      animate={{ y: 0 }}
      whileHover={{ y: "-0.06em" }}
      transition={{ duration: 0.9, ease, delay: delay + i * 0.035 }}
      onHoverStart={() => scramble(320)}
    >
      {ch}
    </motion.span>
  );
}

function Letters({ text, delay, offset = 0 }: { text: string; delay: number; offset?: number }) {
  return (
    <span className="block overflow-hidden pb-[0.08em]" aria-hidden>
      {[...text].map((c, i) => (
        <Letter key={i} c={c} i={offset + i} delay={delay + i * 0.035} />
      ))}
    </span>
  );
}

function useJakartaTime() {
  const [now, setNow] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function Hero() {
  const [role, setRole] = useState(0);
  const time = useJakartaTime();
  useEffect(() => {
    const id = setInterval(() => setRole((r) => (r + 1) % roles.length), 2600);
    return () => clearInterval(id);
  }, []);

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease, delay },
  });

  return (
    <section id="top" className="relative flex min-h-[100svh] items-end overflow-hidden pb-28 pt-28 sm:items-center sm:pb-0">
      <SignalField />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-ink/20 to-ink" />

      {/* HUD corner readouts */}
      <motion.div {...fade(1.2)} className="pointer-events-none absolute inset-x-4 top-20 flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted sm:inset-x-8">
        <span>JKT<span className="hidden sm:inline"> · 6.2088°S 106.8456°E</span></span>
        <span>{time && `${time} WIB`}</span>
      </motion.div>

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-8">
        <motion.p {...fade(0.3)} className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-ink/60 px-3 py-1 font-mono text-xs text-muted backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          Available for freelance &amp; full-time
        </motion.p>

        <h1 className="text-[clamp(3.4rem,15vw,10rem)] font-bold leading-[0.88] tracking-[-0.04em]">
          <span className="sr-only">{personalData.name}</span>
          <Letters text="M. Revan" delay={0.4} />
          <span className="flex items-baseline gap-4">
            <Letters text="Apriyandi" delay={0.6} offset={8} />
            <motion.span {...fade(1.1)} className="hidden h-[0.12em] flex-1 bg-gradient-to-r from-accent to-transparent md:block" aria-hidden />
          </span>
        </h1>

        <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <motion.div {...fade(1)} className="max-w-xl">
            <div className="flex h-8 items-center gap-3 overflow-hidden whitespace-nowrap font-mono text-sm sm:text-base">
              <span className="text-accent">~/role</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={role}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.4, ease }}
                >
                  {roles[role]}
                </motion.span>
              </AnimatePresence>
            </div>
            <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">
              Full-stack web &amp; Android developer in Jakarta. ERP, SaaS, POS and custom apps — 62 orders shipped, rated 5.0.
            </p>
          </motion.div>
          <motion.div {...fade(1.2)} className="flex shrink-0 gap-3 whitespace-nowrap [&>a]:flex-1 [&>a]:text-center md:[&>a]:flex-none">
            <a href="#projects" className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5">
              View work
            </a>
            <a href="#contact" className="rounded-full border border-line bg-ink/50 px-6 py-3 text-sm font-semibold backdrop-blur transition-colors hover:border-fg">
              Get in touch
            </a>
          </motion.div>
        </div>
      </div>

      <motion.a {...fade(1.6)} href="#about" aria-label="Scroll down" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted sm:flex">
        scroll
        <span className="relative h-10 w-px overflow-hidden bg-line">
          <motion.span className="absolute inset-x-0 h-4 bg-accent" animate={{ y: [-16, 40] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} />
        </span>
      </motion.a>
    </section>
  );
}
