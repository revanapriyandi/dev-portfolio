import { projectsData } from "@/utils/data/projects-data";

type Message = { role: "user" | "assistant"; content: string; error?: boolean };

export function buildHandoffMessage(messages: Message[]): string {
  const clean = (text: string) => text
    .replace(/\[\[[\s\S]*?(?:\]\]|$)/g, "")
    .replace(/[\w.-]+\/[\w.-]+:\d{10}:[a-f0-9]{64}/g, "")
    .replace(/\b(?:github_pat_[\w]+|gh[pousr]_[\w]+|gsk_[\w]+|sk-[\w-]+)\b/g, "[token disamarkan]")
    .replace(/\*\*|__/g, "")
    .replace(/\s+/g, " ").trim();
  const questions = [...new Set(messages.filter((m) => m.role === "user" && !m.error).map((m) => clean(m.content)).filter(Boolean))];
  if (!questions.length) return "Halo Revan, saya lihat portofolio Anda dan ingin diskusi proyek.";
  const selected = questions.length > 6 ? [questions[0], ...questions.slice(-5)] : questions;
  const excerpts = selected.map((q) => q.length > 220 ? `${q.slice(0, 217)}...` : q);
  const shown = new Set(messages.filter((m) => m.role === "assistant" && !m.error).flatMap((m) => [...m.content.matchAll(/\[\[project:([\w-]+)\]\]/g)].map((match) => match[1])));
  const projects = projectsData.filter((p) => shown.has(p.slug)).slice(0, 4).map((p) => p.name);
  const references = projects.length ? `\n\nReferensi portofolio yang ditampilkan Aksa: ${projects.join(", ")}.` : "";
  return `Halo Revan, saya ingin melanjutkan percakapan dari Aksa di portofolio Anda.\n\nRingkasan kebutuhan dan pertanyaan saya:\n${excerpts.map((q) => `- ${q}`).join("\n")}${references}\n\nBisa kita diskusikan lebih lanjut?`;
}
