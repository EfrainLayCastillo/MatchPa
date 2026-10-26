import { API_BASE, USING_MOCKS } from "./api";
import type { Match } from "./types";

/** Server-side read of a public match, used for metadata and the share image. */
export async function fetchPublicMatch(code: string): Promise<Match | null> {
  if (USING_MOCKS) return null;
  const res = await fetch(`${API_BASE}/matches/${code}`).catch(() => null);
  return res?.ok ? ((await res.json()) as Match) : null;
}
