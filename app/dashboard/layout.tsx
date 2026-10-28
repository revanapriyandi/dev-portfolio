import { ReactNode } from "react";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { AdminNav } from "@/components/panel/admin-nav";
import { requireAdmin } from "@/utils/admin";
import { db } from "@/utils/db";

// Nested layout: <html>/<body>, fonts and the toast container come from app/layout.tsx.
export const metadata: Metadata = {
    title: "Dashboard",
    robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    await requireAdmin();
    const { count } = (await db()?.from("portfolio_messages").select("id", { count: "exact", head: true }).is("read_at", null)) ?? { count: 0 };

    return (
        <ClerkProvider>
            <div className="flex min-h-screen flex-col bg-ink md:flex-row">
                <AdminNav unread={count ?? 0} />
                <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8 md:h-screen md:py-10">{children}</main>
            </div>
        </ClerkProvider>
    );
}
