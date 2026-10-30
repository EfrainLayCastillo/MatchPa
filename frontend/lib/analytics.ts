import { sendGTMEvent } from "@next/third-parties/google";
import type { Category, MatchType } from "./types";

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

/** Contract with the GTM container (`docs/analitica.md`). No personal data: GA4 forbids it. */
interface AnalyticsEvents {
  sign_up: { category: Category | null };
  publish_match: { match_type: MatchType; category: Category; max_players: number };
  join_request: { source: "lobby" | "match_page" };
  join_approved: Record<string, never>;
}

export function track<E extends keyof AnalyticsEvents>(event: E, params: AnalyticsEvents[E]) {
  if (GTM_ID) sendGTMEvent({ event, ...params });
}
