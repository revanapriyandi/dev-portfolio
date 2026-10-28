import Groq from "groq-sdk";
import { assistantPrompt } from "@/utils/assistant-prompt";
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

const text = (msg: string, status: number) => new Response(msg, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });

export async function POST(request: Request) {
  if (!process.env.GROQ_API_KEY) return text("The assistant is not configured yet.", 503);

  if (limited(clientIp(request))) return text("You're sending messages quickly — please wait a few minutes, or reach Revan on WhatsApp.", 429);

  const messages = parse(await request.json().catch(() => null));
  if (!messages) return text("Invalid message.", 400);

  const groq = new Groq();
  try {
    const stream = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: "system", content: assistantPrompt }, ...messages],
      stream: true,
      temperature: 0.6,
      max_completion_tokens: 700,
      reasoning_effort: "low",
      include_reasoning: false,
    });

    const encoder = new TextEncoder();
    const question = messages[messages.length - 1].content;
    const visitor = visitorHash(request);
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
        } catch {
          controller.enqueue(encoder.encode("\n\n(The answer was cut off — please try again.)"));
        }
        controller.close();
        // admin log; a failed insert must never break the chat
        const supabase = db();
        if (supabase) {
          const { error } = await supabase.from("portfolio_chat_logs").insert({ visitor, question, answer: answer.slice(0, 4000) });
          if (error) console.error("Error storing chat log:", error.message);
        }
      },
    });
    return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
  } catch (err) {
    if (err instanceof Groq.RateLimitError) return text("The assistant is busy right now. Please reach Revan on WhatsApp or try again later.", 429);
    if (err instanceof Groq.AuthenticationError) return text("The assistant is not configured correctly.", 503);
    return text("Something went wrong. Please try again, or contact Revan directly.", 502);
  }
}
