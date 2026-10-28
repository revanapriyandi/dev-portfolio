"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FaGithub, FaStar } from "react-icons/fa";
import { FiArrowUpRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { githubAccounts } from "@/utils/data/github-accounts";
import type { RepoCard } from "@/utils/github";
import Swiper from "swiper";
import { A11y, Pagination } from "swiper/modules";

export default function RepositorySlider({ repos }: { repos: RepoCard[] }) {
  const [account, setAccount] = useState<string>("all");
  const [edges, setEdges] = useState({ start: true, end: false });
  const track = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const swiper = useRef<Swiper | null>(null);
  const visible = useMemo(() => repos.filter((r) => account === "all" || r.fullName.split("/")[0].toLowerCase() === account), [repos, account]);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const sync = (instance: Swiper) => setEdges({ start: instance.isBeginning, end: instance.isEnd });
    const instance = new Swiper(el, {
      modules: [A11y, Pagination], spaceBetween: 16, slidesPerView: 1.08,
      breakpoints: { 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } },
      grabCursor: true, watchOverflow: true, speed: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 450,
      pagination: { el: progress.current, type: "progressbar" },
      a11y: { containerMessage: "GitHub repositories", itemRoleDescriptionMessage: "repository", slideRole: "listitem" },
      on: { init: sync, slideChange: sync, resize: sync, lock: sync, unlock: sync },
    });
    swiper.current = instance;
    return () => { instance.destroy(true, true); swiper.current = null; };
  }, [account, repos]);

  const slide = (direction: number) => {
    const speed = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 450;
    if (direction > 0) swiper.current?.slideNext(speed); else swiper.current?.slidePrev(speed);
  };
  const control = "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-panel transition-colors hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-default disabled:opacity-30 disabled:hover:border-line disabled:hover:text-inherit";

  return (
    <div className="min-w-0">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label="Filter repositories by account" className="flex flex-wrap gap-2">
          {["all", ...githubAccounts].map((owner) => (
            <button
              key={owner}
              aria-pressed={account === owner}
              aria-controls="github-repository-track"
              onClick={() => setAccount(owner)}
              className={`min-h-11 rounded-xl border px-3 py-2 font-mono text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${account === owner ? "border-accent/50 bg-accent/10 text-accent" : "border-line text-muted hover:border-accent/40 hover:text-fg"}`}
            >
              {owner === "all" ? "All accounts" : `@${owner}`}
              <span className="ml-2 opacity-65">{owner === "all" ? repos.length : repos.filter((r) => r.fullName.split("/")[0].toLowerCase() === owner).length}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button aria-label="Previous repositories" aria-controls="github-repository-track" disabled={edges.start || !visible.length} onClick={() => slide(-1)} className={control}><FiChevronLeft size={18} /></button>
          <button aria-label="Next repositories" aria-controls="github-repository-track" disabled={edges.end || !visible.length} onClick={() => slide(1)} className={control}><FiChevronRight size={18} /></button>
        </div>
      </div>
      <p role="status" className="mb-3 text-xs text-muted">{visible.length} public repositories · swipe or use the arrows to browse</p>
      {!visible.length && <p className="py-8 text-sm text-muted">No public repositories available for this account.</p>}
      <div
        ref={track}
        id="github-repository-track"
        aria-label="GitHub repositories"
        tabIndex={0}
        onKeyDown={(e) => { if (e.target === e.currentTarget && ["ArrowLeft", "ArrowRight"].includes(e.key)) { e.preventDefault(); slide(e.key === "ArrowRight" ? 1 : -1); } }}
        className="swiper portfolio-swiper rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        <ul className="swiper-wrapper">
        {visible.map((r) => (
          <li key={r.fullName} className="swiper-slide min-w-0">
            <a href={r.url!} target="_blank" rel="noreferrer" className="group flex h-full min-h-[240px] w-full min-w-0 flex-col rounded-2xl border border-line bg-panel p-6 transition-colors hover:border-accent/40 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent">
              <div className="flex items-center justify-between">
                <FaGithub className="text-muted" />
                <FiArrowUpRight className="text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
              </div>
              <h3 className="mt-5 break-words font-mono text-lg font-medium">{r.name}</h3>
              <p className="mt-1 font-mono text-xs text-muted">{r.fullName.split("/")[0]}</p>
              <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">{r.description || "No description provided on GitHub."}</p>
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-muted">
                {r.language && <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan" />{r.language}</span>}
                <span className="flex items-center gap-1"><FaStar /> {r.stars}</span>
                <span className="ml-auto">{new Date(r.pushed).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span>
              </div>
            </a>
          </li>
        ))}
        </ul>
        <div ref={progress} className="swiper-pagination" />
      </div>
    </div>
  );
}
