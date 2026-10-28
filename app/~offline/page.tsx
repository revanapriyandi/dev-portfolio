import type { Metadata } from "next";
import Link from "next/link";
import { StatusScreen, primaryAction } from "@/components/status-screen";

export const metadata: Metadata = { title: "Offline" };

// Served by the service worker when a page is requested without a connection.
export default function Offline() {
  return (
    <StatusScreen
      code="OFF"
      label="No signal"
      title="You're offline."
      description="This page isn't saved on your device yet. Check your connection and try again."
      terminal="ping revan.dev → no route to host"
    >
      <Link href="/" className={primaryAction}>Retry</Link>
    </StatusScreen>
  );
}
