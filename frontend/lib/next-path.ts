/** Only same-origin relative paths, so `?next=` can't redirect off-site. */
export function safeNextPath(next: string | null | undefined, fallback = "/lobby"): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
