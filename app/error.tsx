"use client";

import Link from "next/link";
import { useEffect } from "react";
import { StatusScreen, primaryAction, secondaryAction } from "@/components/status-screen";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusScreen
      code="500"
      label="Error"
      title="Something broke on this end."
      description="An unexpected error stopped this page from loading. Trying again usually fixes it."
      terminal={`render failed${error.digest ? ` · ref ${error.digest}` : ""}`}
    >
      <button onClick={reset} className={primaryAction}>Try again</button>
      <Link href="/" className={secondaryAction}>Back to home</Link>
    </StatusScreen>
  );
}
