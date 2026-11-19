import { ArrowRightIcon } from "lucide-react";
import { MatchFace } from "@/components/match/match-face";
import { Button } from "@/components/ui/button";
import type { Match } from "@/lib/types";

interface MatchCardProps {
  match: Match;
  onJoin: (match: Match) => void;
  joining: boolean;
  distanceKm?: number | null;
}

export function MatchCard({ match, onJoin, joining, distanceKm }: MatchCardProps) {
  return (
    <MatchFace
      match={match}
      distanceKm={distanceKm}
      href={`/partidos/${match.code}`}
      corner={joinAction({ match, onJoin, joining })}
      className="h-full"
    />
  );
}

function joinAction({ match, onJoin, joining }: Omit<MatchCardProps, "distanceKm">): React.ReactNode {
  if (match.myRequest)
    return (
      <span className="text-sm text-brand-ivory/80">
        {match.myRequest.status === "accepted" ? "Ya juegas" : "Solicitud enviada"}
      </span>
    );
  if (match.status !== "open" || match.isOrganizer) return null;
  return (
    <Button
      size="icon"
      variant="ghost"
      className="size-11 rounded-full bg-transparent text-white hover:bg-white/10 hover:text-white"
      aria-label="Unirme"
      onClick={() => onJoin(match)}
      disabled={joining}
    >
      <ArrowRightIcon />
    </Button>
  );
}
