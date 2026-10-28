"use client";

import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FiChevronLeft, FiChevronRight, FiDownload, FiX } from "react-icons/fi";
import { personalData } from "@/utils/data/personal-data";

const ease = [0.22, 1, 0.36, 1] as const;
const PAGES = ["/resume/page-1.webp", "/resume/page-2.webp"];

function Cover() {
  return (
    <div className="force-dark relative flex h-full flex-col justify-between overflow-hidden bg-ink p-[8%] text-fg">
      <div className="grid-bg absolute inset-0" />
      {/* no CSS filter here: filters break backface-visibility during the page flip */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_5%,rgb(var(--accent)/0.22),transparent_55%)]" />
      <p className="relative font-mono text-[clamp(8px,1.4vh,12px)] uppercase tracking-[0.3em] text-accent">Curriculum Vitae</p>
      <div className="relative">
        <h3 className="text-[clamp(1.6rem,6vh,3.4rem)] font-bold leading-[0.95] tracking-tight">{personalData.name}</h3>
        <span className="mt-4 block h-1 w-16 bg-accent" />
        <p className="mt-4 font-mono text-[clamp(8px,1.5vh,13px)] uppercase tracking-widest text-muted">{personalData.designation}</p>
      </div>
      <p className="relative flex justify-between font-mono text-[clamp(8px,1.3vh,11px)] uppercase tracking-widest text-muted">
        <span>Jakarta</span>
        <span>{new Date().getFullYear()}</span>
      </p>
    </div>
  );
}

function BackCover() {
  return (
    <div className="force-dark relative flex h-full flex-col items-center justify-center gap-3 overflow-hidden bg-ink p-[8%] text-center font-mono text-[clamp(8px,1.4vh,12px)] uppercase tracking-widest text-muted">
      <div className="grid-bg absolute inset-0" />
      <span className="relative text-accent">&gt; revan.dev</span>
      <span className="relative normal-case tracking-normal text-fg">{personalData.contact.email}</span>
    </div>
  );
}

const pageImage = (src: string, i: number) => (
  <div className="relative h-full bg-white">
    <Image src={src} alt={`Resume page ${i + 1}`} fill sizes="(min-width: 768px) 40vw, 90vw" className="object-contain" priority={i === 0} />
  </div>
);

// every face of the book in reading order
const faces: ReactNode[] = [<Cover key="c" />, ...PAGES.map(pageImage), <BackCover key="b" />];

function useIsWide() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return wide;
}

// One leaf of the book. Faces are shown/hidden from the live rotation angle instead of
// backface-visibility, so they never mirror or vanish mid-turn (on any browser).
function Sheet({ front, back, wide, flipped, zIndex, onDone }: {
  front: ReactNode; back: ReactNode; wide: boolean; flipped: boolean; zIndex: number; onDone: () => void;
}) {
  const rot = useMotionValue(flipped ? -180 : 0);
  useEffect(() => {
    const c = animate(rot, flipped ? -180 : 0, { duration: 0.9, ease, onComplete: onDone });
    return () => c.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped]);
  const frontOn = useTransform(rot, (v) => (v > -90 ? 1 : 0));
  // narrow mode has no left page: the back face would land off-screen, so only wide shows it
  const backOn = useTransform(rot, (v) => (wide && v <= -90 ? 1 : 0));
  const shade = useTransform(rot, [0, -90, -180], [0, 0.45, 0]); // page darkens as it lifts

  return (
    <motion.div
      className="absolute top-0 h-full"
      style={{ left: wide ? "50%" : 0, width: wide ? "50%" : "100%", transformOrigin: "left center", transformStyle: "preserve-3d", rotateY: rot, zIndex }}
    >
      <motion.div style={{ opacity: frontOn }} className="absolute inset-0 overflow-hidden rounded-r-md shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55)]">
        {front}
        <span className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black/20 to-transparent" />
        <motion.span style={{ opacity: shade }} className="pointer-events-none absolute inset-0 bg-black" />
      </motion.div>
      <motion.div style={{ opacity: backOn }} className="absolute inset-0 overflow-hidden rounded-l-md bg-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55)] [transform:rotateY(180deg)]">
        {back ?? <div className="h-full bg-[repeating-linear-gradient(0deg,#f4f4f0,#f4f4f0_22px,#ecece6_23px)]" />}
        <span className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black/20 to-transparent" />
        <motion.span style={{ opacity: shade }} className="pointer-events-none absolute inset-0 bg-black" />
      </motion.div>
    </motion.div>
  );
}

export default function ResumeBook({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    window.dispatchEvent(new Event("aksa:resume-visible"));
    const frame = requestAnimationFrame(() => closeButton.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);
  const wide = useIsWide();
  // wide: each sheet carries two faces (front / back) like a real book; narrow: one face per sheet
  const sheets = wide
    ? Array.from({ length: Math.ceil(faces.length / 2) }, (_, i) => [faces[i * 2], faces[i * 2 + 1]])
    : faces.map((f) => [f, null]);
  const n = sheets.length;
  const [rawTurned, setTurned] = useState(0); // number of sheets flipped to the left
  const [moving, setMoving] = useState<number | null>(null);
  const turned = Math.min(rawTurned, wide ? n : n - 1); // clamp when switching between wide/narrow
  const close = () => {
    setTurned(0);
    onClose();
  };

  const go = (d: 1 | -1) => {
    const next = turned + d;
    if (next < 0 || next > n || (!wide && next > n - 1)) return;
    setMoving(d === 1 ? turned : next);
    setTurned(next);
  };

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  });

  // closed book sits centred on its cover; fully read sits centred on the back cover
  const shift = !wide ? "0%" : turned === 0 ? "-25%" : turned === n ? "25%" : "0%";
  const label = wide
    ? turned === 0 ? "Cover" : turned === n ? "Back" : `${turned * 2 - 1}–${turned * 2} / ${PAGES.length}`
    : turned === 0 ? "Cover" : turned === n - 1 ? "Back" : `${turned} / ${PAGES.length}`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Resume"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex flex-col bg-ink/90 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between px-4 py-3 sm:px-8">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              <span className="text-accent">CV</span> · {label}
            </p>
            <div className="flex gap-2">
              <a href="/resume.pdf" download="M-Revan-Apriyandi-CV.pdf" className="flex h-11 items-center gap-2 rounded-full border border-line px-4 font-mono text-xs uppercase tracking-widest hover:border-accent hover:text-accent">
                <FiDownload /> <span className="hidden sm:inline">PDF</span>
              </a>
              <button ref={closeButton} onClick={close} aria-label="Close resume" className="flex h-11 w-11 items-center justify-center rounded-full border border-line hover:border-accent hover:text-accent">
                <FiX />
              </button>
            </div>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 [perspective:2400px]">
            <motion.div
              initial={{ y: 40, opacity: 0, rotateX: 12 }}
              animate={{ y: 0, opacity: 1, rotateX: 0, x: shift }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.8, ease }}
              onPanEnd={(_, i) => Math.abs(i.offset.x) > 50 && go(i.offset.x < 0 ? 1 : -1)}
              className="relative touch-pan-y [--ph:min(74svh,calc((100vw-2rem)/0.707))] md:[--ph:min(78svh,calc((100vw-8rem)/1.414))]"
              style={{ height: "var(--ph)", width: wide ? "calc(var(--ph) * 1.414)" : "calc(var(--ph) * 0.707)", transformStyle: "preserve-3d" }}
            >
              {sheets.map(([front, back], i) => (
                <Sheet
                  key={`${wide}-${i}`}
                  front={front}
                  back={back}
                  wide={wide}
                  flipped={i < turned}
                  zIndex={moving === i ? 50 : i < turned ? i + 1 : n - i}
                  onDone={() => moving === i && setMoving(null)}
                />
              ))}
              {/* tap zones */}
              <button aria-label="Previous page" onClick={() => go(-1)} className="absolute inset-y-0 left-0 z-[55] w-1/3" />
              <button aria-label="Next page" onClick={() => go(1)} className="absolute inset-y-0 right-0 z-[55] w-1/3" />
            </motion.div>
          </div>

          <div className="flex items-center justify-center gap-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3">
            <button onClick={() => go(-1)} aria-label="Previous page" className="flex h-12 w-12 items-center justify-center rounded-full border border-line hover:border-accent hover:text-accent disabled:opacity-30" disabled={turned === 0}>
              <FiChevronLeft size={20} />
            </button>
            <div className="flex gap-1.5">
              {Array.from({ length: wide ? n + 1 : n }, (_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all ${i === turned ? "w-6 bg-accent" : "w-1.5 bg-muted/40"}`} />
              ))}
            </div>
            <button onClick={() => go(1)} aria-label="Next page" className="flex h-12 w-12 items-center justify-center rounded-full border border-line hover:border-accent hover:text-accent disabled:opacity-30" disabled={turned >= (wide ? n : n - 1)}>
              <FiChevronRight size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
