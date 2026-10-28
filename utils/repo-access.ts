import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const lifetime = 24 * 60 * 60;
const key = () => process.env.GITHUB_REPO_CARD_SECRET?.trim() || process.env.GROQ_API_KEY?.trim();
const sign = (secret: string, value: string) => createHmac("sha256", secret).update(`aksa-repo:${value}`).digest("hex");

export function repoReference(fullName: string, now = Date.now()): string | null {
  const secret = key();
  if (!secret) return null;
  const value = `${fullName}:${Math.floor(now / 1000) + lifetime}`;
  return `${value}:${sign(secret, value)}`;
}

export function verifiedRepo(reference: string, now = Date.now()): string | null {
  const secret = key();
  const match = /^([\w.-]+\/[\w.-]+):(\d{10}):([a-f0-9]{64})$/.exec(reference);
  if (!secret || !match) return null;
  const [, fullName, expires, signature] = match;
  const remaining = Number(expires) - Math.floor(now / 1000);
  if (remaining <= 0 || remaining > lifetime) return null;
  const expected = sign(secret, `${fullName}:${expires}`);
  return timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex")) ? fullName : null;
}
