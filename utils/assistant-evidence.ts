import { projectsData } from "@/utils/data/projects-data";
import { MAX_ASSISTANT_CARDS } from "@/utils/assistant-cards";

const normalize = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

export function projectEvidenceSuffix(question: string, answer: string): string {
  if (/\b(teks saja|tanpa kartu|tanpa gambar|text only|no cards)\b/i.test(question)) return "";
  const tags = [...answer.matchAll(/\[\[\s*(project|repo):([^\]]+)\]\]/gi)];
  const existing = new Set(tags.filter((t) => t[1].toLowerCase() === "project").map((t) => t[2].toLowerCase()));
  const available = Math.max(0, MAX_ASSISTANT_CARDS - tags.length);
  const prose = normalize(answer.replace(/\[\[[^\]]*\]\]/g, ""));
  const requested = normalize(question);
  const missing = projectsData.filter((project) => {
    const name = normalize(project.name);
    return !existing.has(project.slug) && (` ${prose} `.includes(` ${name} `) || ` ${requested} `.includes(` ${name} `));
  }).slice(0, available);
  if (!missing.length) return "";
  const goto = /\[\[\s*goto:/i.test(answer) ? "" : " [[goto:projects]]";
  return `\n\n${missing.map((p) => `[[project:${p.slug}]]`).join(" ")}${goto}`;
}
