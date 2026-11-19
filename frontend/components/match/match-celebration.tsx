"use client";

import { useEffect, useState } from "react";
import type { MatchStatus } from "@/lib/types";

const SHOW_MS = 2600;

/** Shows "¡Match!" once when the match fills while the page is open, not on arrival. */
export function MatchCelebration({ status, maxPlayers }: { status: MatchStatus; maxPlayers: number }) {
  const [previous, setPrevious] = useState(status);
  const [visible, setVisible] = useState(false);
  if (previous !== status) {
    setPrevious(status);
    if (previous === "open" && status === "full") setVisible(true);
  }

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), SHOW_MS);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;
  return (
    <div role="status" className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="relative motion-safe:animate-in motion-safe:zoom-in-75 motion-safe:fade-in motion-safe:duration-300">
        <span aria-hidden className="absolute inset-0 rounded-3xl bg-brand-lime motion-safe:animate-ping motion-safe:[animation-iteration-count:1]" />
        <div className="relative rounded-3xl bg-brand-teal px-8 py-6 text-center shadow-xl ring-4 ring-brand-lime">
          <p className="font-script text-5xl text-brand-lime">¡Match!</p>
          <p className="mt-1 font-heading text-lg font-bold text-brand-ivory">Ya están los {maxPlayers}</p>
        </div>
      </div>
    </div>
  );
}
