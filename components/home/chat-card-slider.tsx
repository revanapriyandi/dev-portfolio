"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Swiper from "swiper";
import { A11y } from "swiper/modules";

export default function ChatCardSlider({ children }: { children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const swiper = useRef<Swiper | null>(null);
  const [position, setPosition] = useState({ index: 1, total: 0, start: true, end: true });

  useEffect(() => {
    if (!track.current || !wrapper.current) return;
    const sync = (instance: Swiper) => setPosition({ index: instance.activeIndex + 1, total: instance.slides.length, start: instance.isBeginning, end: instance.isEnd });
    const instance = new Swiper(track.current, {
      modules: [A11y], slidesPerView: 1, spaceBetween: 12, autoHeight: true, speed: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 380,
      grabCursor: true, watchOverflow: true, nested: true,
      a11y: { containerMessage: "Recommended projects and repositories", slideRole: "", slideLabelMessage: "" },
      on: { init: sync, slideChange: sync, resize: sync, lock: sync, unlock: sync },
    });
    swiper.current = instance;
    let frame = 0;
    const changes = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => { if (!instance.destroyed) { instance.update(); instance.updateAutoHeight(0); sync(instance); } });
    });
    changes.observe(wrapper.current, { childList: true, subtree: true });
    return () => { changes.disconnect(); cancelAnimationFrame(frame); instance.destroy(true, true); swiper.current = null; };
  }, []);

  const slide = (direction: number) => {
    const speed = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 380;
    if (direction > 0) swiper.current?.slideNext(speed); else swiper.current?.slidePrev(speed);
  };
  const control = "flex h-10 w-10 items-center justify-center rounded-xl border border-line text-muted transition-colors hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-default disabled:opacity-30";

  return (
    <div className="mt-2 w-full min-w-0 max-w-[85%]">
      <div ref={track} role="group" aria-roledescription="carousel" aria-label="Recommended projects and repositories" tabIndex={0}
        onKeyDown={(e) => { if (e.target === e.currentTarget && ["ArrowLeft", "ArrowRight"].includes(e.key)) { e.preventDefault(); slide(e.key === "ArrowRight" ? 1 : -1); } }}
        className="swiper aksa-card-swiper w-full rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
        <div ref={wrapper} className="swiper-wrapper">{children}</div>
      </div>
      {position.total > 1 && (
        <div className="mt-1 flex items-center justify-between gap-2">
          <span role="status" aria-live="polite" className="font-mono text-[11px] text-muted">{position.index} / {position.total}</span>
          <div className="flex gap-1.5">
            <button aria-label="Previous recommendation" disabled={position.start} onClick={() => slide(-1)} className={control}><FiChevronLeft /></button>
            <button aria-label="Next recommendation" disabled={position.end} onClick={() => slide(1)} className={control}><FiChevronRight /></button>
          </div>
        </div>
      )}
    </div>
  );
}
