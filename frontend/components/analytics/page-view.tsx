"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { ONE_SHOT_PARAMS, track } from "@/lib/analytics";

/** Virtual page_view for the SPA: fires on load and on every route or query change, ignoring one-shot URL flags. */
export function PageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    ONE_SHOT_PARAMS.forEach((name) => params.delete(name));
    const key = `${pathname}?${params.toString()}`;
    if (key === lastKey.current) return;
    lastKey.current = key;
    track("page_view");
  }, [pathname, searchParams]);

  return null;
}
