"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/utils/db";
import { requireAdmin } from "@/utils/admin";

const UUID = /^[0-9a-f-]{36}$/i;

export async function setMessageRead(id: string, read: boolean) {
  await requireAdmin();
  if (!UUID.test(id)) return;
  await db()?.from("portfolio_messages").update({ read_at: read ? new Date().toISOString() : null }).eq("id", id);
  revalidatePath("/dashboard", "layout");
}

export async function deleteMessage(id: string) {
  await requireAdmin();
  if (!UUID.test(id)) return;
  await db()?.from("portfolio_messages").delete().eq("id", id);
  revalidatePath("/dashboard", "layout");
}
