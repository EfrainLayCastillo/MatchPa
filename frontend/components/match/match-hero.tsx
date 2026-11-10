import { ClockIcon, LandPlotIcon, MapPinIcon, PencilIcon, TrophyIcon, UsersIcon, VenusAndMarsIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconBadge } from "@/components/match/match-summary-card";
import { StatusBadge } from "@/components/matchpa/status-badge";
import { formatCategory, TYPE_LABELS } from "@/lib/format";
import { MATCH_IMAGES, type MatchImage } from "@/lib/match-images";
import { formatDateTime } from "@/lib/panamaFormatDate";
import type { Match } from "@/lib/types";

export function MatchBanner({ image }: { image: MatchImage }) {
  return (
    <div aria-hidden className="relative h-40 w-full sm:h-56">
      <Image src={MATCH_IMAGES[image]} alt="" fill priority sizes="(min-width: 672px) 672px, 100vw" className="object-cover" />
      <div className="absolute inset-0 bg-linear-to-br from-brand-teal/20 via-transparent to-brand-lime/15" />
    </div>
  );
}

export function MatchHeading({ match, canEdit }: { match: Match; canEdit: boolean }) {
  return (
    <header className="space-y-3">
      <div className="flex min-w-0 items-center gap-2">
        <StatusBadge status={match.status} className="shrink-0" />
        <p className="flex min-w-0 flex-1 items-center gap-1 text-sm text-muted-foreground">
          <MapPinIcon aria-hidden className="size-4 shrink-0 text-brand-teal dark:text-brand-lime" />
          <span className="truncate">{match.branch.name}</span>
        </p>
        {canEdit ? (
          <Button asChild variant="outline" size="sm" className="shrink-0 bg-card font-semibold">
            <Link href={`/partidos/${match.code}/editar`}>
              <PencilIcon data-icon="inline-start" />
              Editar
            </Link>
          </Button>
        ) : null}
      </div>
      <h1 className="font-heading text-3xl font-extrabold leading-tight">{formatDateTime(match.startsAt)}</h1>
      <div className="flex flex-wrap gap-1.5">
        <IconBadge icon={LandPlotIcon}>Cancha {match.courtNumber}</IconBadge>
        <IconBadge icon={ClockIcon}>{match.durationMinutes} min</IconBadge>
        <IconBadge icon={TrophyIcon}>{formatCategory(match.category, match.categoryTier)}</IconBadge>
        <IconBadge icon={VenusAndMarsIcon}>{TYPE_LABELS[match.type]}</IconBadge>
        <IconBadge icon={UsersIcon}>
          Faltan {match.spotsLeft} de {match.maxPlayers - 1}
        </IconBadge>
      </div>
    </header>
  );
}
