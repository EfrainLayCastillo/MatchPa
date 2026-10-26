import type { Category, Gender, MatchStatus, MatchType } from "./types";

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

export function categoryLabel(category: Category): string {
  return `${CATEGORY_LABELS[category]} categoría`;
}

export function shortCategory(category: Category): string {
  return CATEGORY_LABELS[category];
}

/** Orders by distance to the user's category: their own level first, then the closest ones. */
export function byCategoryDistance(mine: Category | null) {
  return <T extends { category: Category }>(a: T, b: T) =>
    distance(a.category, mine) - distance(b.category, mine);
}

function distance(category: Category, mine: Category | null): number {
  return mine === null ? 0 : Math.abs(category - mine);
}

export function formatDuration(minutes: 90 | 120): string {
  return minutes === 90 ? "1h 30min" : "2 horas";
}

export function firstName(fullName: string): string {
  return fullName.split(" ")[0] ?? fullName;
}
