import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import loadTs from "./load-ts.mjs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Groq from "groq-sdk";
import { Tiktoken } from "js-tiktoken/lite";
import o200kBase from "js-tiktoken/ranks/o200k_base";
const originalFetch = global.fetch;
const originalEnv = { ...process.env };
afterEach(() => { global.fetch = originalFetch; process.env = { ...originalEnv }; });
const repo = (owner, name = "same", extra = {}) => ({
  name, full_name: `${owner}/${name}`, owner: { login: owner },
  description: "A repository", language: "TypeScript", stargazers_count: 2,
  pushed_at: "2026-10-28T10:00:00Z", private: false, fork: false, archived: false,
  html_url: `https://github.com/${owner}/${name}`, ...extra,
});
const json = (value, status = 200) => new Response(JSON.stringify(value), { status });
const loadRepoRoute = (overrides) => loadTs("app/api/repos/route.ts", { "@/utils/github-activity": { getRepoActivity: async () => [] }, ...overrides });

test("merges both accounts without confusing identical repository names", async () => {
  delete process.env.GITHUB_TOKEN; delete process.env.GITHUB_TOKEN_2;
  global.fetch = async (url) => json([repo(String(url).includes("revanapriyandi19") ? "revanapriyandi19" : "revanapriyandi")]);
  const { getRepos } = loadTs("utils/github.ts");
  assert.deepEqual((await getRepos()).map(r => r.fullName).sort(), ["revanapriyandi/same", "revanapriyandi19/same"]);
});

test("pairs tokens with owners, filters unrelated owners, hides private URLs", async () => {
  process.env.GITHUB_TOKEN = "first-test-token"; process.env.GITHUB_TOKEN_2 = "second-test-token";
  global.fetch = async (_url, options) => {
    const owner = options.headers.Authorization === "Bearer first-test-token" ? "revanapriyandi" : "revanapriyandi19";
    return json([repo(owner, "secret", { private: true }), repo("unrelated")]);
  };
  const repos = await loadTs("utils/github.ts").getRepos();
  assert.equal(repos.length, 2);
  assert.ok(repos.every(r => r.private && r.url === null && r.fullName.endsWith("/secret")));
});

test("expired token falls back to that account's public repositories", async () => {
  process.env.GITHUB_TOKEN = "expired"; delete process.env.GITHUB_TOKEN_2;
  global.fetch = async (url, options) => options.headers.Authorization ? json({}, 401) : json([repo(String(url).includes("revanapriyandi19") ? "revanapriyandi19" : "revanapriyandi")]);
  assert.equal((await loadTs("utils/github.ts").getRepos()).length, 2);
});

test("follows pagination and keeps the other account when one fails", async () => {
  delete process.env.GITHUB_TOKEN; delete process.env.GITHUB_TOKEN_2;
  global.fetch = async (url) => {
    const u = new URL(url);
    if (u.pathname.includes("revanapriyandi19")) return json({}, 503);
    return json(u.searchParams.get("page") === "1" ? Array.from({length: 100}, (_, i) => repo("revanapriyandi", `repo-${i}`)) : [repo("revanapriyandi", "last")]);
  };
  assert.equal((await loadTs("utils/github.ts").getRepos()).length, 101);
});

test("public API never returns private metadata, guessed names do not unlock it", async () => {
  const privateRepo = { fullName: "revanapriyandi/secret", name: "secret", private: true, description: "Sensitive", url: null };
  const route = loadRepoRoute({ "@/utils/github": { getRepos: async () => [privateRepo] } });
  for (const query of ["", "?names=secret", "?names=revanapriyandi/secret"]) {
    assert.deepEqual(await (await route.GET(new Request(`http://localhost/api/repos${query}`))).json(), []);
  }
});

test("private cards require a valid signature; tampering and expiry are rejected", async () => {
  process.env.GITHUB_REPO_CARD_SECRET = "test-only-signing-key";
  const { repoReference, verifiedRepo } = loadTs("utils/repo-access.ts");
  const reference = repoReference("revanapriyandi/secret");
  assert.equal(verifiedRepo(reference), "revanapriyandi/secret");
  assert.equal(verifiedRepo(reference.replace("/secret", "/other")), null);
  assert.equal(verifiedRepo(reference, Date.now() + 25 * 3600 * 1000), null);
  const secret = { name: "secret", fullName: "revanapriyandi/secret", private: true, url: null };
  const route = loadRepoRoute({ "@/utils/github": { getRepos: async () => [secret] } });
  const response = await route.GET(new Request(`http://localhost/api/repos?names=${encodeURIComponent(reference)}`));
  assert.deepEqual(await response.json(), [secret]);
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("reply parser accepts owner-qualified and signed repository tags without printing secrets", () => {
  const { parseReply } = loadTs("components/home/aksa-actions.tsx", { "./sections": { openWhatsApp() {} } });
  const reference = `revanapriyandi19/same:1793232000:${"a".repeat(64)}`;
  const reply = parseReply(`Related projects. [[repo:revanapriyandi/same]] [[repo:${reference}]]`);
  assert.deepEqual(reply.repos, ["revanapriyandi/same", reference]);
  assert.equal(reply.text, "Related projects.");
});

test("links for the older GitHub account keep their own destination", () => {
  const { parseReply } = loadTs("components/home/aksa-actions.tsx", { "./sections": { openWhatsApp() {} } });
  assert.deepEqual(parseReply("Older account: https://github.com/revanapriyandi19").buttons, ["githubold"]);
});

test("a complete upstream outage is reported by the repository endpoint", async () => {
  const route = loadRepoRoute({ "@/utils/github": { getRepos: async () => { throw new Error("offline"); } } });
  assert.equal((await route.GET(new Request("http://localhost/api/repos"))).status, 503);
});

test("signatures cannot be reused after the signing key changes", () => {
  process.env.GITHUB_REPO_CARD_SECRET = "original-key";
  const { repoReference, verifiedRepo } = loadTs("utils/repo-access.ts");
  const reference = repoReference("revanapriyandi19/same");
  process.env.GITHUB_REPO_CARD_SECRET = "new-key";
  assert.equal(verifiedRepo(reference), null);
});

test("larger recommendations keep all requested cards for the chat slider", async () => {
  const names = Array.from({ length: 6 }, (_, i) => `revanapriyandi/repo-${i}`);
  const { parseReply } = loadTs("components/home/aksa-actions.tsx", { "./sections": { openWhatsApp() {} } });
  assert.deepEqual(parseReply(names.map(n => `[[repo:${n}]]`).join(" ")).repos, names);
  const cards = names.map(fullName => ({ fullName, private: false }));
  const route = loadRepoRoute({ "@/utils/github": { getRepos: async () => cards } });
  assert.equal((await (await route.GET(new Request(`http://localhost/api/repos?names=${names.join(",")}`))).json()).length, 6);
});

test("project overview answers get evidence cards even if the model forgets tags", () => {
  const { projectEvidenceSuffix } = loadTs("utils/assistant-evidence.ts");
  const suffix = projectEvidenceSuffix("apa saja project yang pernah di kerjakan", "Accounting ERP untuk akuntansi, Production Tracker untuk produksi, serta Attendance & Employee Self-Service.");
  assert.ok(suffix.includes("[[project:accounting-erp]]"));
  assert.ok(suffix.includes("[[project:production-tracker]]"));
  assert.ok(suffix.includes("[[project:attendance-ess]]"));
});

test("evidence fallback does not invent project matches or duplicate existing cards", () => {
  const { projectEvidenceSuffix } = loadTs("utils/assistant-evidence.ts");
  assert.equal(projectEvidenceSuffix("Accounting ERP", "Accounting ERP [[project:accounting-erp]] [[goto:projects]]"), "");
  assert.equal(projectEvidenceSuffix("apa project quantum yang pernah dibuat?", "Belum ada informasi tentang proyek quantum."), "");
  assert.equal(projectEvidenceSuffix("apa saja project? teks saja", "Accounting ERP"), "");
});

test("chat response stream appends project evidence when a provider omits card tags", async () => {
  process.env.GROQ_API_KEY = "fake-provider-key-for-test";
  class FakeGroq {
    chat = { completions: { create: async () => (async function* () {
      yield { choices: [{ delta: { content: "Revan pernah membuat Accounting ERP dan Production Tracker." } }] };
    })() } };
  }
  const route = loadTs("app/api/chat/route.ts", {
    "groq-sdk": { __esModule: true, default: FakeGroq },
    "@/utils/github": { getRepos: async () => [] },
    "@/utils/rate-limit": { clientIp: () => "test", rateLimiter: () => () => false },
    "@/utils/db": { db: () => null, visitorHash: () => "test" },
  });
  const response = await route.POST(new Request("http://localhost/api/chat", { method: "POST", body: JSON.stringify({ messages: [{ role: "user", content: "apa saja project yang pernah dikerjakan?" }] }) }));
  assert.equal(response.status, 200);
  const text = await response.text();
  assert.ok(text.includes("[[project:accounting-erp]]"));
  assert.ok(text.includes("[[project:production-tracker]]"));
});

test("current workload questions do not let the provider invent active projects", async () => {
  process.env.GROQ_API_KEY = "fake-provider-key-for-test";
  let calls = 0;
  class FakeGroq {
    chat = { completions: { create: async () => { calls++; return (async function* () {
      yield { choices: [{ delta: { content: "Saat ini Revan sedang mengerjakan Accounting ERP." } }] };
    })(); } } };
  }
  const route = loadTs("app/api/chat/route.ts", {
    "groq-sdk": { __esModule: true, default: FakeGroq },
    "@/utils/github": { getRepos: async () => [], getRepoActivity: async () => [] },
    "@/utils/rate-limit": { clientIp: () => "test", rateLimiter: () => () => false },
    "@/utils/db": { db: () => null, visitorHash: () => "test" },
  });
  const response = await route.POST(new Request("http://localhost/api/chat", { method: "POST", body: JSON.stringify({ messages: [{ role: "user", content: "apa project yang di kerjakan sekarang" }] }) }));
  const answer = await response.text();
  assert.equal(calls, 0);
  assert.match(answer, /belum.*terverifikasi/i);
  assert.ok(!answer.includes("[[project:accounting-erp]]"));
});

test("assistant text renders bold and lists and escapes untrusted HTML", () => {
  const { default: AssistantText } = loadTs("components/home/assistant-text.tsx");
  const html = renderToStaticMarkup(createElement(AssistantText, { text: "Contoh:\n- **Accounting ERP** untuk akuntansi\n- Production Tracker\n\n<script>alert(1)</script>" }));
  assert.match(html, /<strong\b[^>]*>Accounting ERP<\/strong>/);
  assert.ok(html.includes("<ul"));
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;script&gt;"));
});

test("latest commit evidence uses the matching account token and strips private URLs", async () => {
  process.env.GITHUB_TOKEN_2 = "second-test-token";
  const { getRepoActivity } = loadTs("utils/github-activity.ts");
  let auth;
  global.fetch = async (_url, options) => {
    auth = options.headers.Authorization;
    return json([{ sha: "a".repeat(40), commit: { committer: { date: "2026-10-28T12:00:00Z" }, message: "Fix report totals\n\nMore details" } }]);
  };
  const activities = await getRepoActivity("last commit revanapriyandi19/Simperu", [{ fullName: "revanapriyandi19/Simperu", name: "Simperu", private: true }]);
  assert.equal(auth, "Bearer second-test-token");
  assert.equal(activities[0].message, "Fix report totals");
  assert.equal(activities[0].url, null);
});

test("contact handoff includes visitor requirements without AI claims or internal tags", () => {
  const { buildHandoffMessage } = loadTs("utils/chat-handoff.ts");
  const message = buildHandoffMessage([
    { role: "user", content: "Saya butuh aplikasi kasir untuk dua cabang." },
    { role: "assistant", content: "Pasti selesai besok, harganya Rp1! [[repo:private/secret:1793232000:" + "a".repeat(64) + "]]" },
    { role: "user", content: "Bisa integrasi printer? [[whatsapp]]" },
  ]);
  assert.ok(message.includes("dua cabang"));
  assert.ok(message.includes("integrasi printer"));
  assert.ok(!message.includes("Pasti selesai"));
  assert.ok(!message.includes("[["));
  assert.ok(message.length < 1800);
});

test("activity queries for the older account do not select the newer account", async () => {
  const { getRepoActivity } = loadTs("utils/github-activity.ts");
  const urls = [];
  global.fetch = async (url) => { urls.push(String(url)); return json([]); };
  await getRepoActivity("commit terakhir di revanapriyandi19", [
    { fullName: "revanapriyandi/newest", name: "newest", private: false },
    { fullName: "revanapriyandi19/legacy", name: "legacy", private: false },
  ]);
  assert.equal(urls.length, 1);
  assert.ok(urls[0].includes("/revanapriyandi19/legacy/"));
});

test("large private catalogs and long chat history stay below the input token budget", async () => {
  process.env.GROQ_API_KEY = "test-only-provider-key";
  const tokenizer = new Tiktoken(o200kBase);
  let captured;
  class FakeGroq {
    chat = { completions: { create: async (options) => {
      captured = options;
      return (async function* () { yield { choices: [{ delta: { content: "Contoh absensi tersedia." } }] }; })();
    } } };
  }
  const repos = Array.from({ length: 180 }, (_, i) => ({ fullName: `revanapriyandi/project-${i}`, name: `project-${i}`, private: true, language: "TypeScript", description: "A general web application with administration and reporting. ".repeat(12) }));
  repos.push({ fullName: "revanapriyandi19/absensi-hr", name: "absensi-hr", private: true, language: "PHP", description: "Aplikasi absensi karyawan attendance employee HR." });
  const route = loadTs("app/api/chat/route.ts", {
    "groq-sdk": { __esModule: true, default: FakeGroq },
    "@/utils/github": { getRepos: async () => repos },
    "@/utils/github-activity": { getRepoActivity: async () => [] },
    "@/utils/rate-limit": { clientIp: () => "test", rateLimiter: () => () => false },
    "@/utils/db": { db: () => null, visitorHash: () => "test" },
  });
  const history = Array.from({ length: 10 }, (_, i) => ({ role: i % 2 ? "assistant" : "user", content: `Kebutuhan lama ${i} ${"pengelolaan transaksi dan laporan ".repeat(23)} [[repo:private/project:1793232000:${"a".repeat(64)}]]` }));
  const question = "Saya perlu aplikasi absensi karyawan, apa contoh yang relevan?";
  const response = await route.POST(new Request("http://localhost/api/chat", { method: "POST", body: JSON.stringify({ messages: [...history, { role: "user", content: question }] }) }));
  await response.text();
  const inputTokens = captured.messages.reduce((total, m) => total + tokenizer.encode(m.content, [], []).length + 64, 64);
  assert.ok(inputTokens <= 4500, `Input has ${inputTokens} tokens`);
  assert.equal(captured.messages.at(-1).content, question);
  assert.ok(captured.messages[0].content.includes("revanapriyandi19/absensi-hr"));
  assert.ok(captured.messages.slice(1).every(m => !m.content.includes("[[repo:")));
  assert.ok(inputTokens + captured.max_completion_tokens < 8000);
});

test("Groq token-limit errors returned as HTTP 413 map to a clear 429 instead of 502", async () => {
  process.env.GROQ_API_KEY = "test-only-provider-key";
  class FakeGroq {
    static RateLimitError = Groq.RateLimitError;
    static AuthenticationError = Groq.AuthenticationError;
    chat = { completions: { create: async () => { throw new Groq.APIError(413, { error: { code: "rate_limit_exceeded", type: "tokens", message: "Request too large on tokens per minute" } }, "Request too large", new Headers()); } } };
  }
  const route = loadTs("app/api/chat/route.ts", {
    "groq-sdk": { __esModule: true, default: FakeGroq },
    "@/utils/github": { getRepos: async () => [] },
    "@/utils/github-activity": { getRepoActivity: async () => [] },
    "@/utils/rate-limit": { clientIp: () => "test", rateLimiter: () => () => false },
    "@/utils/db": { db: () => null, visitorHash: () => "test" },
  });
  const response = await route.POST(new Request("http://localhost/api/chat", { method: "POST", body: JSON.stringify({ messages: [{ role: "user", content: "Apa layanan Revan?" }] }) }));
  assert.equal(response.status, 429);
  assert.ok(Number(response.headers.get("retry-after")) > 0);
  assert.match(await response.text(), /batas.*token|token.*limit/i);
});
