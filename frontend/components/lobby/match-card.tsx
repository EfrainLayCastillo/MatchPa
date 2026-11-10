import { ClockIcon, LandPlotIcon, UsersIcon, VenusAndMarsIcon } from "lucide-react";
import { IconBadge, MatchSummaryCard } from "@/components/match/match-summary-card";
import { Button } from "@/components/ui/button";
import { TYPE_LABELS } from "@/lib/format";
import type { Match } from "@/lib/types";

interface MatchCardProps {
  match: Match;
  onJoin: (match: Match) => void;
  joining: boolean;
  distanceKm?: number | null;
}

export function MatchCard({ match, onJoin, joining, distanceKm }: MatchCardProps) {
  return (
    <MatchSummaryCard
      match={match}
      distanceKm={distanceKm}
      image="bg2"
      badges={[
        <IconBadge key="court" icon={LandPlotIcon}>Cancha {match.courtNumber}</IconBadge>,
        <IconBadge key="duration" icon={ClockIcon}>{match.durationMinutes} min</IconBadge>,
        <IconBadge key="type" icon={VenusAndMarsIcon}>{TYPE_LABELS[match.type]}</IconBadge>,
        <IconBadge key="spots" icon={UsersIcon}>
          Faltan {match.spotsLeft} de {match.maxPlayers - 1}
        </IconBadge>,
      ]}
      footer={joinAction({ match, onJoin, joining })}
    />
  );
}

function joinAction({ match, onJoin, joining }: Omit<MatchCardProps, "distanceKm">): React.ReactNode {
  if (match.myRequest)
    return (
      <span className="text-sm text-muted-foreground">
        {match.myRequest.status === "accepted" ? "Ya juegas" : "Solicitud enviada"}
      </span>
    );
  if (match.status !== "open" || match.isOrganizer) return null;
  return (
    <Button size="sm" onClick={() => onJoin(match)} disabled={joining}>
      Pedir unirme
    </Button>
  );
}
