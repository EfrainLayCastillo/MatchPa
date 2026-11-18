"use client";

import { useEffect, useState } from "react";
import { CourtState } from "@/components/matchpa/court-state/court-state";

const WAKING_AFTER_MS = 3000;

export function SlowLoad({ children }: { children: React.ReactNode }) {
  const [waking, setWaking] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setWaking(true), WAKING_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  return waking ? <CourtState variant="waking" /> : children;
}
