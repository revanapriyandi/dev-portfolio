import type { Metadata } from "next";
import Link from "next/link";
import { StatusScreen, primaryAction, secondaryAction } from "@/components/status-screen";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <StatusScreen
      code="404"
      label="Not found"
      title="This page drifted off the grid."
      description="The link may be broken, or the page has moved. Let's get you back to something that exists."
      terminal="GET this-page → 404 not found"
    >
      <Link href="/" className={primaryAction}>Back to home</Link>
      <Link href="/#projects" className={secondaryAction}>See projects</Link>
    </StatusScreen>
  );
}
