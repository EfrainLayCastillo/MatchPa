import Link from "next/link";
import { cn } from "@/lib/utils";

export function BetaPill({ large = false }: { large?: boolean }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full bg-brand-lime font-extrabold uppercase tracking-widest text-brand-teal",
        large ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[0.65rem]",
      )}
    >
      Beta
    </span>
  );
}

export function BetaBadge({ className }: { className?: string }) {
  return (
    <Link
      href="/beta"
      aria-label="MatchPa está en beta: qué es y qué viene"
      className={cn("inline-flex min-h-11 items-center", className)}
    >
      <BetaPill />
    </Link>
  );
}
