import "server-only";
import { githubAccounts } from "@/utils/data/github-accounts";
import type { RepoCard } from "@/utils/github";

export type RepoActivity = { fullName: string; sha: string; message: string; date: string; url: string | null };
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export async function getRepoActivity(question: string, repos: RepoCard[]): Promise<RepoActivity[]> {
  const query = ` ${normalize(question)} `;
  const owner = githubAccounts.find((account) => query.includes(` ${account} `));
  const pool = owner ? repos.filter((r) => r.fullName.split("/")[0].toLowerCase() === owner) : repos;
  const named = pool.filter((r) => query.includes(` ${normalize(r.fullName)} `) || (r.name.length >= 4 && query.includes(` ${normalize(r.name)} `)));
  if (!named.length && !/github|repo|commit|update|aktivitas|terbaru|sekarang|sedang|saat ini|current|working on/i.test(question)) return [];
  const candidates = (named.length ? named : pool).slice(0, 3);
  const result = await Promise.all(candidates.map(async (repo): Promise<RepoActivity | null> => {
    const owner = repo.fullName.split("/")[0].toLowerCase();
    const index = githubAccounts.findIndex((a) => a === owner);
    if (index < 0) return null;
    const token = [process.env.GITHUB_TOKEN, process.env.GITHUB_TOKEN_2][index]?.trim();
    const fetchCommit = (auth?: string) => fetch(`https://api.github.com/repos/${repo.fullName}/commits?per_page=1`, {
      headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2026-03-10", ...(auth && { Authorization: `Bearer ${auth}` }) },
      signal: AbortSignal.timeout(5000), next: { revalidate: 3600 },
    });
    try {
      let response = await fetchCommit(token);
      if (!response.ok && token && !repo.private) response = await fetchCommit();
      if (!response.ok) return null;
      const commits = await response.json();
      const latest = Array.isArray(commits) ? commits[0] : null;
      const date = latest?.commit?.committer?.date || latest?.commit?.author?.date;
      if (!latest || !/^[a-f0-9]{40,64}$/.test(latest.sha) || !date || !Number.isFinite(Date.parse(date))) return null;
      return { fullName: repo.fullName, sha: latest.sha, message: String(latest.commit?.message || "").split("\n")[0].slice(0, 220), date, url: repo.private ? null : `https://github.com/${repo.fullName}/commit/${latest.sha}` };
    } catch { return null; }
  }));
  return result.filter((r) => r !== null);
}
