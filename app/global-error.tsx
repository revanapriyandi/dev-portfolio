"use client";

import "@/styles/globals.scss";
import { StatusScreen, primaryAction } from "@/components/status-screen";

// Replaces the root layout when it fails, so it brings its own <html>/<body>.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <StatusScreen
          code="500"
          label="Error"
          title="The site hit a snag."
          description="Something went wrong while loading. Please try again in a moment."
          terminal="root layout failed"
        >
          <button onClick={reset} className={primaryAction}>Try again</button>
        </StatusScreen>
      </body>
    </html>
  );
}
