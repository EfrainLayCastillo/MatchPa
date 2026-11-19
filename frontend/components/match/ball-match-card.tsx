import Link from "next/link";
import { BallStamp } from "@/components/lobby/ball-stamp";
import { startParts } from "@/lib/panamaFormatDate";

interface BallMatchCardProps {
  code: string;
  startsAt: string;
  branchName: string;
  locationLabel?: string;
  badges: React.ReactNode[];
}

/** A match at a glance for the player's own lists: a padel ball with the date, then time, branch and badges. */
export function BallMatchCard({ code, startsAt, branchName, locationLabel, badges }: BallMatchCardProps) {
  const { time, period } = startParts(startsAt);
  return (
    <article className="relative flex h-full items-center gap-3 rounded-2xl bg-card p-3 shadow-sm ring-1 ring-foreground/10 has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/50">
      <div className="size-28 shrink-0">
        <BallStamp startsAt={startsAt} place={branchName} />
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <Link
          href={`/partidos/${code}`}
          className="block font-heading leading-none text-brand-teal outline-none after:absolute after:inset-0 dark:text-brand-lime"
        >
          <span className="text-4xl font-extrabold tracking-tight">{time}</span>
          <span className="ml-1 text-base font-bold">{period}</span>
        </Link>
        <p className="truncate font-heading text-base font-bold leading-tight">{branchName}</p>
        {locationLabel ? <p className="truncate text-xs text-muted-foreground">{locationLabel}</p> : null}
        <div className="flex flex-wrap gap-1.5">{badges}</div>
      </div>
    </article>
  );
}
