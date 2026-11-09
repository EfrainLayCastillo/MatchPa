import { formatClock12, todayKey } from "./panamaFormatDate";
import type { Availability, Category, CategoryTier, Gender, MatchStatus, MatchType } from "./types";

const CATEGORY_LABELS: Record<Category, string> = {
  1: "1ra",
  2: "2da",
  3: "3ra",
  4: "4ta",
  5: "5ta",
  6: "6ta",
  7: "7ma",
};

export const STATUS_LABELS: Record<MatchStatus, string> = {
  open: "Abierto",
  full: "Completo",
  closed: "Cerrado",
  expired: "Expirado",
};

export const TYPE_LABELS: Record<MatchType, string> = {
  male: "Masculino",
  female: "Femenino",
  mixed: "Mixto",
};

export const GENDER_LABELS: Record<Gender, string> = {
  male: "Masculino",
  female: "Femenino",
};

export const CATEGORIES = [1, 2, 3, 4, 5, 6, 7] as const satisfies Category[];

export function shortCategory(category: Category): string {
  return CATEGORY_LABELS[category];
}

export const CATEGORY_TIER_LABELS: Record<CategoryTier, string> = { high: "alta", entry: "de entrada" };

export function formatCategory(category: Category, tier?: CategoryTier | null): string {
  return tier ? `${shortCategory(category)} ${CATEGORY_TIER_LABELS[tier]}` : shortCategory(category);
}

const TIER_OFFSET: Record<CategoryTier, number> = { high: -1 / 3, entry: 1 / 3 };

function effectiveLevel(category: Category, tier?: CategoryTier | null): number {
  return category + (tier ? TIER_OFFSET[tier] : 0);
}

/** Orders by distance to the user's effective level: their own first, then the closest ones. */
export function byCategoryDistance(mine: { category: Category | null; categoryTier?: CategoryTier | null }) {
  const distance = (item: { category: Category; categoryTier?: CategoryTier | null }) =>
    mine.category === null ? 0 : Math.abs(effectiveLevel(item.category, item.categoryTier) - effectiveLevel(mine.category, mine.categoryTier));
  return <T extends { category: Category; categoryTier?: CategoryTier | null }>(a: T, b: T) => distance(a) - distance(b);
}

export function formatDuration(minutes: 90 | 120): string {
  return minutes === 90 ? "1h 30min" : "2 horas";
}

export function firstName(fullName: string): string {
  return fullName.split(" ")[0] ?? fullName;
}

export function formatAvailabilityWindow(slot: Pick<Availability, "date" | "fromTime" | "toTime">): string {
  if (slot.fromTime === null || slot.toTime === null) {
    return slot.date === todayKey() ? "Resto del día" : "Todo el día";
  }
  return `${formatClock12(slot.fromTime.slice(0, 5))} – ${formatClock12(slot.toTime.slice(0, 5))}`;
}
