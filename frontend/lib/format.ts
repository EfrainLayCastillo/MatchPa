import type { Category, Gender, MatchStatus, MatchType } from "./types";

export const PANAMA_TZ = "America/Panama";

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

/** YYYY-MM-DD in Panama time, the key used by availabilities and the date selector. */
export function panamaDateKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PANAMA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function nextDateKeys(days: number): string[] {
  const today = new Date();
  return Array.from({ length: days }, (_, i) =>
    panamaDateKey(new Date(today.getTime() + i * 86_400_000)),
  );
}

export function dayLabel(dateKey: string): string {
  if (dateKey === panamaDateKey()) return "Hoy";
  const date = new Date(`${dateKey}T12:00:00-05:00`);
  return new Intl.DateTimeFormat("es-PA", {
    timeZone: PANAMA_TZ,
    weekday: "short",
    day: "numeric",
  }).format(date);
}

export function formatMatchTime(startsAt: string): string {
  const date = new Date(startsAt);
  const day = panamaDateKey(date) === panamaDateKey() ? "Hoy" : dayLabel(panamaDateKey(date));
  const time = new Intl.DateTimeFormat("es-PA", {
    timeZone: PANAMA_TZ,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
  return `${day} · ${time}`;
}

/** HH:MM in Panama time, the value an `<input type="time">` expects. */
export function panamaTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: PANAMA_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export function formatDuration(minutes: 90 | 120): string {
  return minutes === 90 ? "1h 30min" : "2 horas";
}

export function firstName(fullName: string): string {
  return fullName.split(" ")[0] ?? fullName;
}
