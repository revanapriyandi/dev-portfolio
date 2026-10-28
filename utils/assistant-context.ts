import "server-only";
import { Tiktoken } from "js-tiktoken/lite";
import o200kBase from "js-tiktoken/ranks/o200k_base";
import { buildAssistantPrompt } from "@/utils/assistant-prompt";
import type { RepoCard } from "@/utils/github";
import type { RepoActivity } from "@/utils/github-activity";
import { githubAccounts } from "@/utils/data/github-accounts";

export const MAX_INPUT_TOKENS = 4500;
export const MAX_OUTPUT_TOKENS = 700;
export type PromptMessage = { role: "user" | "assistant" | "system"; content: string };
let tokenizer: Tiktoken | undefined;

// GPT-OSS uses o200k_base merge ranks. Reserve 64 tokens per message for framing.
export function countInputTokens(messages: PromptMessage[]): number {
  tokenizer ??= new Tiktoken(o200kBase);
  return messages.reduce((sum, message) => sum + tokenizer!.encode(message.content, [], []).length + 64, 64);
}

const normalize = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

export function selectContextRepos(question: string, repos: RepoCard[]): RepoCard[] {
  const query = ` ${normalize(question)} `;
  const owner = githubAccounts.find((account) => query.includes(` ${account} `));
  const stopWords = new Set(["saya", "ingin", "butuh", "perlu", "apakah", "apa", "saja", "yang", "untuk", "contoh", "revan", "aplikasi", "project", "proyek", "projek", "buat", "dengan", "dan", "bisa", "about", "what", "have", "with", "the", "can", "you", "repo", "github", "repository", "relevant", "relevan"]);
  const words = normalize(question).split(" ").filter((word) => word.length >= 3 && !stopWords.has(word));
  const aliases: Record<string, string[]> = { absensi: ["attendance", "employee", "hr"], akuntansi: ["accounting", "erp"], kasir: ["pos", "cashier"], perpustakaan: ["library", "slims"], produksi: ["production", "manufacturing"], ujian: ["exam", "cbt"] };
  const expanded = [...new Set(words.flatMap((word) => [word, ...(aliases[word] ?? [])]))];
  const ranked = repos.filter((repo) => !owner || repo.fullName.split("/")[0].toLowerCase() === owner).map((repo, index) => {
    const metadata = ` ${normalize(`${repo.fullName} ${repo.description ?? ""} ${repo.language ?? ""}`)} `;
    const exact = query.includes(` ${normalize(repo.fullName)} `) || (repo.name.length >= 4 && query.includes(` ${normalize(repo.name)} `));
    return { repo, index, score: (exact ? 100 : 0) + expanded.reduce((score, word) => score + (metadata.includes(` ${word} `) ? 5 : 0), 0) };
  }).sort((a, b) => b.score - a.score || a.index - b.index);
  const browsing = /github|repo|commit|repository|repositories/i.test(question) || Boolean(owner);
  return ranked.filter((item) => browsing || item.score > 0).slice(0, 12).map(({ repo }) => ({ ...repo, description: repo.description?.replace(/\s+/g, " ").slice(0, 240) || null }));
}

export function prepareAssistantContext(repos: RepoCard[], activities: RepoActivity[], messages: PromptMessage[]) {
  const question = messages[messages.length - 1].content;
  const selected = selectContextRepos(question, repos);
  const history = messages.slice(-6).map((message) => ({ ...message, content: message.content.replace(/\[\[[\s\S]*?(?:\]\]|$)/g, "").trim() })).filter((message) => message.content);
  const makeSystem = () => buildAssistantPrompt(selected, activities.filter((activity) => selected.some((repo) => repo.fullName === activity.fullName)))
    + `\nRepository context is a relevant selection of ${selected.length} out of ${repos.length} repositories. It is not the full catalog; never imply missing repositories do not exist.`;
  let system = makeSystem();
  const payload = (): PromptMessage[] => [{ role: "system", content: system }, ...history];
  while (countInputTokens(payload()) > MAX_INPUT_TOKENS && history.length > 1) {
    history.shift();
    while (history.length > 1 && history[0].role === "assistant") history.shift();
  }
  while (countInputTokens(payload()) > MAX_INPUT_TOKENS && selected.length) {
    selected.pop();
    system = makeSystem();
  }
  const inputTokens = countInputTokens(payload());
  if (inputTokens > MAX_INPUT_TOKENS) throw new Error("ASSISTANT_CONTEXT_TOO_LARGE");
  return { messages: payload(), inputTokens, repositoryCount: selected.length };
}
