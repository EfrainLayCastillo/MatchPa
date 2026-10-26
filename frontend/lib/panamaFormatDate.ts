const PANAMA_TZ = "America/Panama";
const PANAMA_OFFSET = "-05:00";
const DAY_MS = 86_400_000;

/** YYYY-MM-DD of an instant, in Panama time. */
export function dateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PANAMA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Today's key in Panama. Reads the clock: call from client code only. */
export function todayKey(): string {
  return dateKey(new Date());
}

export function nextDayKeys(count: number): string[] {
  const start = new Date(`${todayKey()}T12:00:00${PANAMA_OFFSET}`);
  return Array.from({ length: count }, (_, i) => dateKey(new Date(start.getTime() + i * DAY_MS)));
}

/** "Hoy" for today, otherwise the short weekday and day, e.g. "mié 28". */
export function formatDay(key: string): string {
  if (key === todayKey()) return "Hoy";
  return new Intl.DateTimeFormat("es-PA", {
    timeZone: PANAMA_TZ,
    weekday: "short",
    day: "numeric",
  }).format(new Date(`${key}T12:00:00${PANAMA_OFFSET}`));
}

/** Day, month and time of a match, e.g. "dom 25 oct · 6:00 p. m.". Pure: no clock. */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  const day = new Intl.DateTimeFormat("es-PA", {
    timeZone: PANAMA_TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
  const time = new Intl.DateTimeFormat("es-PA", {
    timeZone: PANAMA_TZ,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
  return `${day} · ${time}`;
}

/** HH:MM in Panama time, the value an `<input type="time">` expects. */
export function formatClock(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: PANAMA_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

/** "HH:MM" (24 h, the stored value) as a 12-hour label, e.g. "6:30 p. m.". */
export function formatClock12(hhmm: string): string {
  return new Intl.DateTimeFormat("es-PA", {
    timeZone: PANAMA_TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(`2000-01-01T${hhmm}:00${PANAMA_OFFSET}`));
}

/** Every half hour of the day as "HH:MM"; `current` is kept as an option when it falls off the grid. */
export function halfHourTimes(current?: string): string[] {
  const grid = Array.from({ length: 48 }, (_, i) => {
    const hours = String(Math.floor(i / 2)).padStart(2, "0");
    return `${hours}:${i % 2 === 0 ? "00" : "30"}`;
  });
  if (!current || grid.includes(current)) return grid;
  return [current, ...grid].sort();
}

/** Earliest half-hour "HH:MM" a slot starting today can use, or null when today has none left. */
export function earliestSlotToday(): string | null {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: PANAMA_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === "hour")?.value);
  const minute = Number(parts.find((p) => p.type === "minute")?.value);
  const minutes = Math.ceil((hour * 60 + minute) / 30) * 30;
  if (minutes >= 24 * 60) return null;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

/** "YYYY-MM-DD" as a long label, e.g. "martes 27 de octubre". */
export function formatLongDate(key: string): string {
  return new Intl.DateTimeFormat("es-PA", {
    timeZone: PANAMA_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${key}T12:00:00${PANAMA_OFFSET}`));
}
