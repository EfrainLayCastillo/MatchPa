import {
  ClockIcon,
  FlameIcon,
  LandPlotIcon,
  NavigationIcon,
  TrophyIcon,
  UserIcon,
  VenusAndMarsIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/matchpa/status-badge";
import { formatDistance } from "@/lib/distance";
import { TYPE_LABELS, courtLabel, formatCategory } from "@/lib/format";
import { startParts } from "@/lib/panamaFormatDate";
import { seatsOf, type Seat } from "@/lib/seats";
import { cn } from "@/lib/utils";
import type { Match } from "@/lib/types";

const HIDDEN_SCROLL =
  "overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

interface MatchFaceProps {
  match: Match;
  distanceKm?: number | null;
  /** Makes the whole face a link (lobby card). Without it, the start time is the page heading. */
  href?: string;
  /** Floats at the bottom-right corner: join button, edit link. */
  corner?: React.ReactNode;
  className?: string;
}

/** The match at a glance: big start time, seats, spots seal, branch and details over court lines. */
export function MatchFace({ match, distanceKm, href, corner, className }: MatchFaceProps) {
  const { day, time, period } = startParts(match.startsAt);
  return (
    <article
      className={cn(
        "relative isolate overflow-hidden rounded-2xl bg-brand-teal px-4 pt-4 pb-2.5 text-brand-ivory shadow-sm ring-1 ring-brand-teal/20 has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/50 dark:ring-brand-ivory/15",
        className,
      )}
    >
      <CourtLines />
      {match.status === "open" ? null : <StatusBadge status={match.status} />}
      <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
        <div className="shrink-0">
          <p className="text-sm font-semibold leading-none text-white">{day}</p>
          <StartTime href={href} time={time} period={period} />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <SeatRow seats={seatsOf(match)} />
          <SpotsSeal match={match} />
        </div>
      </div>
      <p className={cn("relative z-10 mt-3 whitespace-nowrap font-heading text-2xl font-extrabold leading-tight", HIDDEN_SCROLL)}>
        {href ? (
          <Link href={href} tabIndex={-1} className="outline-none">
            {match.branch.name}
          </Link>
        ) : (
          match.branch.name
        )}
      </p>
      <Details match={match} distanceKm={distanceKm} />
      {corner ? <div className="absolute bottom-2.5 right-3 z-10">{corner}</div> : null}
    </article>
  );
}

function StartTime({ href, time, period }: { href?: string; time: string; period: string }) {
  const content = (
    <>
      <span className="text-5xl font-extrabold tracking-tight">{time}</span>
      <span className="ml-1 text-lg font-bold">{period}</span>
    </>
  );
  const style = "block font-heading leading-none text-brand-lime";
  if (!href) return <h1 className={style}>{content}</h1>;
  return (
    <Link href={href} className={cn(style, "outline-none after:absolute after:inset-0")}>
      {content}
    </Link>
  );
}

function Details({ match, distanceKm }: { match: Match; distanceKm?: number | null }) {
  const details: [LucideIcon, string][] = [
    [VenusAndMarsIcon, TYPE_LABELS[match.type]],
    [TrophyIcon, formatCategory(match.category, match.categoryTier)],
    [LandPlotIcon, courtLabel(match)],
    [ClockIcon, `${match.durationMinutes} min`],
  ];
  if (distanceKm != null) details.push([NavigationIcon, formatDistance(distanceKm)]);
  return (
    <ul
      className={cn(
        "relative z-10 mt-1 mr-14 flex gap-x-2.5 text-xs text-brand-ivory/80 [mask-image:linear-gradient(to_right,black_85%,transparent)]",
        HIDDEN_SCROLL,
      )}
    >
      {details.map(([Icon, label]) => (
        <li key={label} className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap">
          <Icon aria-hidden className="size-3 shrink-0 text-brand-lime" />
          {label}
        </li>
      ))}
      <li aria-hidden className="w-8 shrink-0" />
    </ul>
  );
}

function CourtLines() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 100"
      preserveAspectRatio="none"
      className="absolute inset-0 -z-10 size-full stroke-brand-ivory/12"
      fill="none"
    >
      <rect x="1" y="1" width="198" height="98" vectorEffect="non-scaling-stroke" />
      <path d="M30.5 1V99M169.5 1V99M30.5 50H169.5M100 1V99" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function SpotsSeal({ match }: { match: Match }) {
  if (match.status !== "open") return null;
  return (
    <div className="relative flex size-12 shrink-0 rotate-6 flex-col items-center justify-center rounded-full bg-brand-lime text-brand-teal ring-4 ring-brand-teal/40">
      <span className="font-heading text-xl font-extrabold leading-none">{match.spotsLeft}</span>
      <span className="text-[8px] font-bold uppercase tracking-wide">
        {match.spotsLeft === 1 ? "Falta" : "Faltan"}
      </span>
      {match.spotsLeft === 1 ? <LastSpotDot /> : null}
    </div>
  );
}

function LastSpotDot() {
  return (
    <span aria-hidden className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center">
      <span className="absolute inset-0 rounded-full bg-brand-turquoise motion-safe:animate-ping" />
      <span className="relative flex size-5 items-center justify-center rounded-full bg-brand-teal ring-2 ring-brand-lime">
        <FlameIcon className="size-3 text-brand-lime" />
      </span>
    </span>
  );
}

function SeatRow({ seats }: { seats: Seat[] }) {
  const taken = seats.filter((seat) => seat.filled).length;
  return (
    <div
      role="img"
      className={cn("grid shrink-0 gap-1", seats.length > 4 ? "grid-cols-3" : "grid-cols-2")}
      aria-label={`${taken} de ${seats.length} jugadores`}
    >
      {seats.map((seat, index) => (
        <span key={index} aria-hidden>
          {seat.filled ? (
            <span className="flex size-7 items-center justify-center rounded-full bg-brand-ivory text-[10px] font-bold text-brand-teal ring-2 ring-brand-teal">
              {seat.initials ?? <UserIcon className="size-3.5" />}
            </span>
          ) : (
            <span className="flex size-7 items-center justify-center rounded-full border-2 border-dashed border-brand-lime bg-brand-teal text-sm font-bold text-brand-lime">
              +
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
