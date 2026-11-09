/** Browsers read `\\` as `/` and drop tabs/newlines, so `/\\evil.com` would become `//evil.com`. */
const RELATIVE_PATH = /^\/(?![/\\])[^\\\p{Cc}]*$/u;

/** Only same-origin relative paths, so `?next=` can't redirect off-site. */
export function safeNextPath(next: string | null | undefined, fallback = "/lobby"): string {
  return next && RELATIVE_PATH.test(next) ? next : fallback;
}
