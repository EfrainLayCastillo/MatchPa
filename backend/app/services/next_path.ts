/** Only same-origin relative paths, so `next` can't redirect off the site. */
export function safeNextPath(next: unknown, fallback = '/lobby'): string {
  return typeof next === 'string' && next.startsWith('/') && !next.startsWith('//')
    ? next
    : fallback
}
