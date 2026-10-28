import "server-only";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

const admins = () => (process.env.ADMIN_USER_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);

// Second gate behind proxy.ts: every admin page and server action calls this itself,
// so a middleware gap (or a direct server-action POST) still can't reach admin data.
export async function requireAdmin() {
  const { userId } = await auth();
  if (!userId || !admins().includes(userId)) notFound();
  return userId;
}
