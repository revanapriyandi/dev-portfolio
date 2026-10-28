import Groq from "groq-sdk";
import { buildAssistantPrompt } from "@/utils/assistant-prompt";
import { getRepos } from "@/utils/github";
import { projectEvidenceSuffix } from "@/utils/assistant-evidence";
import { getRepoActivity } from "@/utils/github-activity";
import { isProjectStatusQuestion, projectStatusReply } from "@/utils/assistant-status";
import { clientIp, rateLimiter } from "@/utils/rate-limit";
import { db, visitorHash } from "@/utils/db";

const MODEL = "openai/gpt-oss-120b";
const MAX_TURNS = 12; // messages kept from the client history
const MAX_CHARS = 800; // per message
const limited = rateLimiter(15, 10 * 60 * 1000); // 15 messages per IP per 10 minutes

type ChatMessage = { role: "user" | "assistant"; content: string };

function parse(body: unknown): ChatMessage[] | null {
  const messages = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(messages) || messages.length === 0) return null;
  const clean: ChatMessage[] = [];
  for (const m of messages.slice(-MAX_TURNS)) {
    const role = (m as ChatMessage)?.role;
    const content = (m as ChatMessage)?.content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string" || !content.trim()) return null;
    clean.push({ role, content: content.slice(0, MAX_CHARS) });
  }
  return clean[clean.length - 1].role === "user" ? clean : null;
}

const text = (msg: string, status: number) => new Response(msg, { status, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });

async function logChat(request: Request, question: string, answer: string) {
  try {
    const supabase = db();
    if (supabase) {
      const { error } = await supabase.from("portfolio_chat_logs").insert({ visitor: visitorHash(request), question, answer: answer.slice(0, 4000) });
      if (error) console.error("Error storing chat log:", error.message);
    }
  } catch { console.error("Error storing chat log"); }
}

export async function POST(request: Request) {
  if (limited(clientIp(request))) return text("You're sending messages quickly — please wait a few minutes, or reach Revan on WhatsApp.", 429);

  const messages = parse(await request.json().catch(() => null));
  if (!messages) return text("Invalid message.", 400);

  const question = messages[messages.length - 1].content;
  if (isProjectStatusQuestion(question)) {
    const repos = await getRepos().catch(() => []);
    const activity = await getRepoActivity(question, repos);
    const answer = projectStatusReply(question, activity, repos);
    await logChat(request, question, answer);
    return text(answer, 200);
  }
  if (!process.env.GROQ_API_KEY) return text("The assistant is not configured yet.", 503);

  const groq = new Groq();
  const repos = await getRepos().catch(() => []);
  const system = buildAssistantPrompt(repos, await getRepoActivity(question, repos));
  try {
    const stream = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: "system", content: system }, ...messages],
      stream: true,
      temperature: 0.2,
      max_completion_tokens: 700,
      reasoning_effort: "low",
      include_reasoning: false,
    });

    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        let answer = "";
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              answer += delta;
              controller.enqueue(encoder.encode(delta));
            }
          }
          const evidence = projectEvidenceSuffix(question, answer);
          if (evidence) {
            answer += evidence;
            controller.enqueue(encoder.encode(evidence));
          }
        } catch {
          controller.enqueue(encoder.encode("\n\n(The answer was cut off — please try again.)"));
        }
        controller.close();
        await logChat(request, question, answer);
      },
    });
    return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
  } catch (err) {
    if (err instanceof Groq.RateLimitError) return text("The assistant is busy right now. Please reach Revan on WhatsApp or try again later.", 429);
    if (err instanceof Groq.AuthenticationError) return text("The assistant is not configured correctly.", 503);
    return text("Something went wrong. Please try again, or contact Revan directly.", 502);
  }
}
