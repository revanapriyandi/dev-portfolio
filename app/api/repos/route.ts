import { getRepos } from "@/utils/github";
import { verifiedRepo } from "@/utils/repo-access";
import { MAX_ASSISTANT_CARDS } from "@/utils/assistant-cards";
import { getRepoActivity } from "@/utils/github-activity";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const names = (params.get("names") ?? "").split(",").filter(Boolean).slice(0, MAX_ASSISTANT_CARDS);
  const wanted = new Set(names.map((n) => n.split(":")[0].toLowerCase()));
  const allowed = new Set(names.map((n) => verifiedRepo(n)?.toLowerCase()).filter(Boolean));
  try {
    const repos = (await getRepos()).filter((r) => {
      if (r.private) return allowed.has(r.fullName.toLowerCase());
      return !names.length || wanted.has(r.fullName.toLowerCase());
    });
    if (!names.length) return Response.json(repos, { headers: { "Cache-Control": "no-store" } });
    const cards = repos.slice(0, MAX_ASSISTANT_CARDS);
    const activities = await getRepoActivity(cards.map((r) => r.fullName).join(" "), cards);
    return Response.json(cards.map((r) => {
      const lastCommit = activities.find((a) => a.fullName === r.fullName);
      return lastCommit ? { ...r, lastCommit } : r;
    }), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "GitHub is unavailable. Please try again later." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
