import { MapPinIcon, TrophyIcon, type LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { StatusBadge } from "@/components/matchpa/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatDistance } from "@/lib/distance";
import { formatCategory } from "@/lib/format";
import { MATCH_IMAGES, type MatchImage } from "@/lib/match-images";
import { formatDateTime } from "@/lib/panamaFormatDate";
import type { Match } from "@/lib/types";

export type MatchSummary = Pick<Match, "code" | "status" | "category" | "categoryTier" | "startsAt"> & {
  branch: { name: string };
};

interface MatchSummaryCardProps {
  match: MatchSummary;
  badges: React.ReactNode[];
  distanceKm?: number | null;
  footer?: React.ReactNode;
  /** `null` drops the image column. */
  image?: MatchImage | null;
}

/** The whole card opens the match; the footer stays clickable above the stretched link. */
export function MatchSummaryCard({
  match,
  badges,
  distanceKm,
  footer,
  image = "bg1",
}: MatchSummaryCardProps) {
  return (
    <article className="relative flex h-full overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-foreground/10 has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/50">
      <div className="min-w-0 flex-1 space-y-2 p-4">
        <div className="flex items-center gap-1.5">
          <StatusBadge status={match.status} className="shrink-0" />
          <IconBadge icon={TrophyIcon}>
            {formatCategory(match.category, match.categoryTier)}
          </IconBadge>
        </div>
        <div className="space-y-0.5">
          <Link
            href={image ? `/partidos/${match.code}?img=${image}` : `/partidos/${match.code}`}
            className="block font-heading text-lg font-bold leading-tight outline-none after:absolute after:inset-0"
          >
            {formatDateTime(match.startsAt)}
          </Link>
          <Location name={match.branch.name} distanceKm={distanceKm} />
        </div>
        <div className="flex flex-wrap gap-1.5">{badges}</div>
        {footer ? (
          <div className="flex justify-end">
            <div className="relative z-10">{footer}</div>
          </div>
        ) : null}
      </div>
      {image ? <ImageColumn src={MATCH_IMAGES[image]} /> : null}
    </article>
  );
}

export function IconBadge({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <Badge variant="secondary">
      <Icon data-icon="inline-start" />
      {children}
    </Badge>
  );
}

function Location({
  name,
  distanceKm,
}: {
  name: string;
  distanceKm?: number | null;
}) {
  return (
    <p className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
      <MapPinIcon
        aria-hidden
        className="size-3.5 shrink-0 text-brand-teal dark:text-brand-lime"
      />
      <span className="truncate">{name}</span>
      {distanceKm != null ? (
        <span className="shrink-0 font-semibold text-brand-teal dark:text-brand-lime">
          · {formatDistance(distanceKm)}
        </span>
      ) : null}
    </p>
  );
}

function ImageColumn({ src }: { src: string }) {
  return (
    <div aria-hidden className="relative w-24 shrink-0 sm:w-32">
      <Image src={src} alt="" fill sizes="144px" className="object-cover" />
      <div className="absolute inset-0 bg-linear-to-br from-brand-teal/10 via-transparent to-brand-lime/10" />
    </div>
  );
}
