/** Browsers read `\\` as `/` and drop tabs/newlines, so `/\\evil.com` would become `//evil.com`. */
const RELATIVE_PATH = /^\/(?![/\\])[^\\\p{Cc}]*$/u

/** Only same-origin relative paths, so `next` can't redirect off the site. */
export function safeNextPath(next: unknown, fallback = '/lobby'): string {
  return typeof next === 'string' && RELATIVE_PATH.test(next) ? next : fallback
}
