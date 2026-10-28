"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { personalData } from "@/utils/data/personal-data";

const ease = [0.22, 1, 0.36, 1] as const;
const DURATION = 1700; // ms until the curtain lifts; keep in sync with SPLASH_OFFSET in hero.tsx

// Shown only when the inline script in app/layout.tsx set html[data-splash] (first visit this session).
// CSS hides it otherwise, and a CSS failsafe fades it out after 6s even if this script never runs.
export default function Splash() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.dataset.splash) return;
    try {
      sessionStorage.setItem("splash", "1");
    } catch {}

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      root.dataset.splash = "out"; // CSS curtain lift
      setTimeout(() => delete root.dataset.splash, 800);
    };
    const timer = setTimeout(finish, DURATION);
    window.addEventListener("pointerdown", finish, { once: true });
    window.addEventListener("keydown", finish, { once: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointerdown", finish);
      window.removeEventListener("keydown", finish);
    };
  }, []);

  return (
    <div className="splash fixed inset-0 z-[100] flex-col items-center justify-center bg-ink" aria-hidden>
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" />

      {/* logo mark: flips in, then the prompt draws itself */}
      <motion.div
        className="[perspective:600px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.svg
          viewBox="0 0 64 64"
          className="h-16 w-16 sm:h-20 sm:w-20"
          initial={{ rotateY: -70, rotateX: 15 }}
          animate={{ rotateY: 0, rotateX: 0 }}
          transition={{ duration: 0.9, ease }}
        >
          <rect x="1" y="1" width="62" height="62" rx="14" fill="none" stroke="rgb(var(--accent) / 0.35)" strokeWidth="1.5" />
          <motion.path
            d="M19 21l11 11-11 11"
            fill="none"
            stroke="rgb(var(--accent))"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, ease, delay: 0.25 }}
          />
          <motion.rect
            x="34" y="39" width="12" height="5" rx="1.5"
            fill="rgb(var(--fg))"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0, 1] }}
            transition={{ duration: 0.8, delay: 0.7, times: [0, 0.2, 0.6, 1] }}
          />
        </motion.svg>
      </motion.div>

      {/* name */}
      <div className="mt-6 overflow-hidden">
        <motion.p
          className="text-xl font-semibold tracking-tight sm:text-2xl"
          initial={{ y: "110%" }}
          animate={{ y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.55 }}
        >
          {personalData.name}
        </motion.p>
      </div>
      <motion.p
        className="mt-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        {personalData.designation}
      </motion.p>

      {/* progress hairline */}
      <span className="mt-8 block h-px w-40 overflow-hidden bg-line">
        <motion.span
          className="block h-full origin-left bg-accent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: DURATION / 1000 - 0.2, ease: "easeInOut", delay: 0.1 }}
        />
      </span>
    </div>
  );
}
