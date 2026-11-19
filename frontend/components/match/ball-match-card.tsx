import Link from "next/link";
import { BallStamp } from "@/components/lobby/ball-stamp";
import { StatusBadge } from "@/components/matchpa/status-badge";
import { startParts } from "@/lib/panamaFormatDate";
import type { MatchStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BallMatchCardProps {
  code: string;
  startsAt: string;
  branchName: string;
  locationLabel?: string;
  badges: React.ReactNode[];
  status?: MatchStatus;
}

const isInactive = (status?: MatchStatus) => status === "closed" || status === "expired";

/** A match at a glance for the player's own lists: a padel ball with the date, then time, branch and badges. */
export function BallMatchCard({ code, startsAt, branchName, locationLabel, badges, status }: BallMatchCardProps) {
  const { time, period } = startParts(startsAt);
  const inactive = isInactive(status);
  return (
    <article
      className={cn(
        "relative flex h-full items-center gap-3 rounded-2xl p-3 ring-1 has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/50",
        inactive ? "bg-muted ring-foreground/5" : "bg-card shadow-sm ring-foreground/10",
      )}
    >
      {status ? <StatusBadge status={status} className="absolute top-3 right-3" /> : null}
      <div className={cn("size-28 shrink-0", inactive && "opacity-50 grayscale")}>
        <BallStamp startsAt={startsAt} place={branchName} />
      </div>
      <div className={cn("min-w-0 flex-1 space-y-1.5", inactive && "opacity-60 grayscale")}>
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
