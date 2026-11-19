"use client";

import { useEffect, useState } from "react";
import { CourtState } from "@/components/matchpa/court-state/court-state";
import { SERVE_HIT } from "@/components/matchpa/court-state/motion";

const WAKING_AFTER_MS = 3000;
const RELOAD_AFTER_MS = (SERVE_HIT + 0.5) * 1000;

const reloadAfterServe = () =>
  new Promise<never>(() => {
    setTimeout(() => window.location.reload(), RELOAD_AFTER_MS);
  });

export function SlowLoad({ children }: { children: React.ReactNode }) {
  const [waking, setWaking] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setWaking(true), WAKING_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  return waking ? <CourtState variant="waking" onRetry={reloadAfterServe} /> : children;
}
