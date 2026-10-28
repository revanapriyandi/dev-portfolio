import "server-only";
import { githubAccounts } from "@/utils/data/github-accounts";
import type { RepoActivity } from "@/utils/github-activity";

export type RepoCard = {
  fullName: string;
  lastCommit?: RepoActivity;
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  pushed: string;
  private: boolean;
  url: string | null; // null for private repos: visitors can't open them anyway
};

type GitHubRepo = {
  owner: { login: string };
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  private: boolean;
  fork: boolean;
  archived: boolean;
  html_url: string;
};

async function accountRepos(owner: string, token?: string): Promise<GitHubRepo[]> {
  const all: GitHubRepo[] = [];
  // A broken upstream must not hold the chat open indefinitely.
  const signal = AbortSignal.timeout(8000);
  for (let page = 1; ; page++) {
    const endpoint = token ? "/user/repos?affiliation=owner" : `/users/${owner}/repos?type=owner`;
    const url = `https://api.github.com${endpoint}&per_page=100&sort=pushed&direction=desc&page=${page}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2026-03-10",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      signal,
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`GitHub returned ${res.status}`);
    const batch: GitHubRepo[] = await res.json();
    if (!Array.isArray(batch)) throw new Error("Invalid GitHub response");
    all.push(...batch.filter((r) => r.owner.login.toLowerCase() === owner.toLowerCase() && (token || !r.private)));
    if (batch.length < 100) return all;
  }
}

export async function getRepos(): Promise<RepoCard[]> {
  const tokens = [process.env.GITHUB_TOKEN?.trim(), process.env.GITHUB_TOKEN_2?.trim()];
  const results = await Promise.allSettled(githubAccounts.map(async (owner, index) => {
    try {
      return await accountRepos(owner, tokens[index]);
    } catch {
      if (tokens[index]) return accountRepos(owner);
      throw new Error(`GitHub account ${owner} unavailable`);
    }
  }));
  const available = results.filter((r) => r.status === "fulfilled");
  if (!available.length) throw new Error("GitHub repositories unavailable");
  const repos = available.flatMap((r) => r.value)
    .filter((r) => !r.fork && !r.archived && r.name.toLowerCase() !== r.owner.login.toLowerCase())
    .map((r) => ({
      fullName: `${r.owner.login}/${r.name}`,
      name: r.name,
      description: r.description || null,
      language: r.language,
      stars: r.stargazers_count,
      pushed: r.pushed_at,
      private: r.private,
      url: r.private ? null : `https://github.com/${r.owner.login}/${r.name}`,
    }));
  return [...new Map(repos.map((r) => [r.fullName.toLowerCase(), r])).values()]
    .sort((a, b) => b.pushed.localeCompare(a.pushed));
}
