import { useId } from "react";
import { cn } from "@/lib/utils";

/** Decorative wallpaper tile (racket, balls, court) drawn with `currentColor`, so the text color sets its tone. */
export function PadelPattern({ className }: { className?: string }) {
  const id = `padel-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg aria-hidden className={cn("pointer-events-none absolute inset-0 size-full", className)}>
      <defs>
        <pattern id={id} width="104" height="104" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <g transform="translate(26 30) rotate(-30)">
              <ellipse rx="10" ry="12" />
              <path d="M-1.5 12v12h3V12" />
              <circle cx="-4" cy="-4" r="1" />
              <circle cx="4" cy="-4" r="1" />
              <circle cx="0" cy="1" r="1" />
              <circle cx="-4" cy="5" r="1" />
              <circle cx="4" cy="5" r="1" />
            </g>
            <g transform="translate(76 22)">
              <circle r="6" />
              <path d="M-4.2-4.2a6 6 0 0 1 0 8.4M4.2-4.2a6 6 0 0 0 0 8.4" />
            </g>
            <g transform="translate(64 56)">
              <rect width="24" height="34" rx="1.5" />
              <path d="M0 17h24M12 7v20M0 7h24M0 27h24" />
            </g>
            <g transform="translate(22 80)">
              <circle r="4" />
              <path d="M-2.8-2.8a4 4 0 0 1 0 5.6" />
            </g>
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
