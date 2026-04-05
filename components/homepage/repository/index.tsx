/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { MotionGroup, MotionItem, MotionSection } from "@/components/motion/section-reveal";
import React, { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import RepositoryCard from "./repository-card";
import { Repositories } from "@/types/repository";
import { personalData } from "@/utils/data/personal-data";

async function getData(): Promise<Repositories> {
  const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  try {
    const res = await fetch(
      `https://api.github.com/users/${personalData.username}/repos?visibility=all`,
      { headers }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await res.json();

    const filtered: Repositories = data
      .filter((repo: any) => repo.name && repo.description)
      .map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        primaryLanguage: repo.language
          ? {
              name: repo.language,
              color: "#666",
            }
          : null,
        forkCount: repo.forks_count,
        stargazers: {
          totalCount: repo.stargazers_count,
        },
        diskUsage: repo.size,
      }))
      .sort((a: any, b: any) => {
        if (b.stargazers.totalCount !== a.stargazers.totalCount) {
          return b.stargazers.totalCount - a.stargazers.totalCount;
        }
        return b.forkCount - a.forkCount;
      });

    return filtered;
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return [];
  }
}

const RepositoryPage: React.FC = () => {
  const [repos, setRepos] = useState<Repositories>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(6);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getData();
        setRepos(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLoadMore = () => {
    setDisplayCount((prevCount) => prevCount + 6);
  };

  return (
    <MotionSection
      id="repository"
      className="relative z-50 my-12 border-t border-[#25213b] lg:my-24"
    >
      <div className="absolute left-[42%] top-6 h-[100px] w-[100px] translate-x-1/2 rounded-full bg-violet-100 opacity-20 blur-3xl filter"></div>

      <div className="flex justify-center -translate-y-[1px]">
        <div className="w-3/4">
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
        </div>
      </div>

      <MotionItem className="flex justify-center py-6 lg:py-8">
        <div className="flex items-center">
          <span className="h-[2px] w-24 bg-[#1a1443]"></span>
          <span className="w-fit rounded-md bg-[#1a1443] px-5 py-2 text-xl text-white">
            Repositories
          </span>
          <span className="h-[2px] w-24 bg-[#1a1443]"></span>
        </div>
      </MotionItem>

      <MotionGroup className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 lg:gap-8 xl:gap-10">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <MotionItem key={index}>
              <div className="h-[220px] rounded-2xl border border-white/10 bg-white/[0.04] animate-pulse" />
            </MotionItem>
          ))
        ) : repos.length > 0 ? (
          repos.slice(0, displayCount).map((repo) => (
            <MotionItem key={repo.id}>
              <RepositoryCard repo={repo} />
            </MotionItem>
          ))
        ) : (
          <MotionItem className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/70">
            No repositories found
          </MotionItem>
        )}
      </MotionGroup>

      {displayCount < repos.length && (
        <MotionItem className="mt-5 flex justify-center lg:mt-12">
          <button
            onClick={handleLoadMore}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#16f2b3] to-violet-600 px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white transition-all duration-300 hover:-translate-y-1 md:px-8 md:py-4 md:text-sm"
          >
            <span>{isLoading ? "Loading..." : "Load More"}</span>
            <FaArrowRight size={16} />
          </button>
        </MotionItem>
      )}
    </MotionSection>
  );
};

export default RepositoryPage;
