"use client";

import { useEffect } from "react";

// One cookie-less page view per load; honours Do Not Track.
export default function Track() {
  useEffect(() => {
    if (navigator.doNotTrack === "1") return;
    const body = JSON.stringify({ path: location.pathname, referrer: document.referrer });
    if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) {
      fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
    }
  }, []);
  return null;
}
