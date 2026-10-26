import { cacheLife } from "next/cache";
import { API_BASE, USING_MOCKS } from "./api";
import type { Match } from "./types";

/** Public match read for metadata and the share image. Cached briefly so seat counts stay fresh. */
export async function fetchPublicMatch(code: string): Promise<Match | null> {
  "use cache";
  cacheLife("minutes");

  if (USING_MOCKS) return null;
  const res = await fetch(`${API_BASE}/matches/${code}`).catch(() => null);
  return res?.ok ? ((await res.json()) as Match) : null;
}
