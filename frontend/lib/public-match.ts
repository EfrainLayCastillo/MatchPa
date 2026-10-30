import { cacheLife } from "next/cache";
import { API_BASE, USING_MOCKS } from "./api";
import type { Match } from "./types";

/** Server-side fetches need an absolute URL; in production `API_BASE` is the relative `/api` rewrite. */
const SERVER_API_BASE = process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/api` : API_BASE;

/**
 * Public match read for metadata and the share image. Cached briefly so seat counts stay fresh.
 * Resolves `null` only when the match does not exist; throws when the API is unreachable.
 */
export async function fetchPublicMatch(code: string): Promise<Match | null> {
  "use cache";
  cacheLife("minutes");

  if (USING_MOCKS) throw new Error("Mock API has no server-side data");
  const res = await fetch(`${SERVER_API_BASE}/matches/${encodeURIComponent(code)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Match ${code} unavailable: ${res.status}`);
  return (await res.json()) as Match;
}

export function isIndexable(match: Match): boolean {
  return match.status === "open" || match.status === "full";
}
