import { sendGTMEvent } from "@next/third-parties/google";
import { dateKey, nextDayKeys, todayKey } from "./panamaFormatDate";
import { effectiveLevel } from "./format";
import type { Category, CategoryTier, Match, MatchStatus, MatchType, SignalKind } from "./types";

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

type AuthMethod = "email" | "google";
type Role = "organizer" | "player" | "visitor";
type DayBucket = "today" | "tomorrow" | "later";

/** Contract with the GTM container (`docs/ingenieria/analitica.md`). No personal data and never a code, id, name, email or phone. `branch` is the branch slug. */
interface AnalyticsEvents {
  sign_up: { method: AuthMethod };
  login: { method: AuthMethod };
  email_verified: { context: "signup" | "action" | "profile" };
  onboarding_complete: { category: Category | null };
  confirm_booking: { branch: string; match_status: MatchStatus };
  publish_match: {
    match_type: MatchType;
    category: Category;
    max_players: number;
    branch: string;
    guests: number;
    from_invite: boolean;
    court_booked: boolean;
    lead_time: "same_day" | "next_day" | "later";
  };
  share: {
    method: "share_sheet" | "story_image" | "copy_link";
    content_type: "match";
    sharer_role: Role;
    match_status: MatchStatus;
  };
  view_match: {
    match_status: MatchStatus;
    viewer_role: Role | "anonymous";
    spots_left: number;
    branch: string;
  };
  send_signal: { kind: SignalKind; viewer_role: Exclude<Role, "visitor"> };
  join_intent: { branch: string };
  join_request: { entry_point: "lobby" | "match_page"; branch: string; level_gap: "0" | "1" | "2_plus" };
  join_approved: { branch: string; fills_match: boolean };
  set_availability: { branch: string; has_time_window: boolean; day: DayBucket };
  invite_player: { branch: string; entry_point: "pool" | "new_match" };
  page_view: Record<string, never>;
}

export type AnalyticsEvent = keyof AnalyticsEvents;

const INTERNAL_KEY = "mp_internal";
/** Flags the app consumes and strips from the URL right away; they are not page changes. */
export const ONE_SHOT_PARAMS = ["internal"];
const STRIPPED_PARAMS = [...ONE_SHOT_PARAMS, "auth", "invitar", "nombre", "email"];
const MATCH_SEGMENT = /^\/partidos\/(?!nuevo(?=[/?#]|$))[^/?#]+/;

function maskMatchCode(path: string): string {
  return path.replace(MATCH_SEGMENT, "/partidos/:code");
}

/** Masks match codes and drops personal params so GA4 never sees them in `page_location`. */
function cleanUrl(href: string): string {
  const url = new URL(href, "https://matchpa.invalid");
  const absolute = /^[a-z][a-z0-9+.-]*:/i.test(href);
  STRIPPED_PARAMS.forEach((name) => url.searchParams.delete(name));
  const next = url.searchParams.get("next");
  if (next) url.searchParams.set("next", maskMatchCode(next));
  const path = maskMatchCode(url.pathname);
  const query = url.search;
  return `${absolute ? url.origin : ""}${path}${query}${url.hash}`;
}

function cleanReferrer(referrer: string): string {
  if (!referrer) return "";
  const url = new URL(referrer);
  if (url.origin === window.location.origin) return cleanUrl(referrer);
  return `${url.origin}${url.pathname}`;
}

export function setInternalTraffic(on: boolean) {
  try {
    if (on) localStorage.setItem(INTERNAL_KEY, "1");
    else localStorage.removeItem(INTERNAL_KEY);
  } catch {}
}

function isInternalTraffic(): boolean {
  try {
    return localStorage.getItem(INTERNAL_KEY) === "1";
  } catch {
    return false;
  }
}

let currentPage: string | null = null;
let currentReferrer: string | null = null;

function pageContext(event: string) {
  const location = cleanUrl(window.location.href);
  if (event === "page_view" && location !== currentPage) {
    currentReferrer = currentPage ?? safeReferrer();
    currentPage = location;
  }
  const referrer = currentReferrer ?? safeReferrer();
  return {
    page_location: location,
    ...(referrer ? { page_referrer: referrer } : {}),
    ...(isInternalTraffic() ? { traffic_type: "internal" } : {}),
  };
}

function safeReferrer(): string {
  try {
    return cleanReferrer(document.referrer);
  } catch {
    return "";
  }
}

export function track<E extends AnalyticsEvent>(
  event: E,
  ...[params]: AnalyticsEvents[E] extends Record<string, never> ? [] : [AnalyticsEvents[E]]
) {
  if (!GTM_ID) return;
  try {
    sendGTMEvent({ event, ...params, ...pageContext(event) });
  } catch {}
}

export function dayBucket(key: string): DayBucket {
  if (key === todayKey()) return "today";
  return key === nextDayKeys(2)[1] ? "tomorrow" : "later";
}

export function leadTime(startsAt: string): AnalyticsEvents["publish_match"]["lead_time"] {
  const bucket = dayBucket(dateKey(new Date(startsAt)));
  return bucket === "today" ? "same_day" : bucket === "tomorrow" ? "next_day" : "later";
}

export function levelGap(
  mine: { category: Category | null; categoryTier?: CategoryTier | null },
  match: { category: Category; categoryTier?: CategoryTier | null },
): AnalyticsEvents["join_request"]["level_gap"] {
  if (mine.category === null) return "0";
  const gap = Math.round(
    Math.abs(effectiveLevel(match.category, match.categoryTier) - effectiveLevel(mine.category, mine.categoryTier)),
  );
  return gap >= 2 ? "2_plus" : gap === 1 ? "1" : "0";
}

export function matchRole(match: Match): Role {
  if (match.isOrganizer) return "organizer";
  return match.myRequest?.status === "accepted" ? "player" : "visitor";
}
