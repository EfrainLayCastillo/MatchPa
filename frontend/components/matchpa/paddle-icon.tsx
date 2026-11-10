/** Padel paddle in Lucide's style (24px grid, 2px stroke, currentColor); Lucide ships no paddle. */
export function PaddleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M14.5 2.5c3.6 0 6.5 2.9 6.5 6.5 0 4.2-3.6 7-7.5 7-1.3 0-2.4.4-3.3 1.3L7 20.5" />
      <path d="M14.5 2.5C10.9 2.5 8 5.4 8 9c0 1.4-.4 2.6-1.3 3.5L3.5 17" />
      <path d="m3.5 17 3.5 3.5" />
      <circle cx="12" cy="8" r=".5" fill="currentColor" />
      <circle cx="15.5" cy="7" r=".5" fill="currentColor" />
      <circle cx="16" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="12.5" cy="11.5" r=".5" fill="currentColor" />
    </svg>
  );
}
