/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import RepositoryCard from "./repository-card";
import { Repositories } from "@/types/repository";
import { personalData } from "@/utils/data/personal-data";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

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
    <div id="repository" className="relative z-50 border-t my-12 lg:my-24 border-[#25213b]">
      <div className="w-[100px] h-[100px] bg-violet-100 rounded-full absolute top-6 left-[42%] translate-x-1/2 filter blur-3xl opacity-20"></div>

      <div className="flex justify-center -translate-y-[1px]">
        <div className="w-3/4">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent w-full" />
        </div>
      </div>

      <div className="flex justify-center my-5 lg:py-8">
        <div className="flex items-center">
          <span className="w-24 h-[2px] bg-[#1a1443]"></span>
          <span className="bg-[#1a1443] w-fit text-white p-2 px-5 text-xl rounded-md">
            Repositories
          </span>
          <span className="w-24 h-[2px] bg-[#1a1443]"></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 xl:gap-10">
        {isLoading ? (
          <>
            <Skeleton height={200} count={6} />
            <Skeleton height={20} count={1} />
            <Skeleton width={100} height={20} />
          </>
        ) : repos.length > 0 ? (
          repos.slice(0, displayCount).map((repo) => (
            <RepositoryCard key={repo.id} repo={repo} />
          ))
        ) : (
          <div>No repositories found</div>
        )}
      </div>

      {displayCount < repos.length && (
        <div className="flex justify-center mt-5 lg:mt-12">
          <button
            onClick={handleLoadMore}
            className="flex items-center gap-1 hover:gap-3 rounded-full bg-gradient-to-r from-[#16f2b3] to-violet-600 px-3 md:px-8 py-3 md:py-4 text-center text-xs md:text-sm font-medium uppercase tracking-wider text-white no-underline transition-all duration-200 ease-out hover:text-white hover:no-underline md:font-semibold"
          >
            <span>{isLoading ? "Loading..." : "Load More"}</span>
            <FaArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default RepositoryPage;
