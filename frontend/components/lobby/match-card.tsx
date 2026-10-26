import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/matchpa/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDuration, formatMatchTime, shortCategory, TYPE_LABELS } from "@/lib/format";
import type { Match } from "@/lib/types";

interface MatchCardProps {
  match: Match;
  onJoin: (match: Match) => void;
  joining: boolean;
}

export function MatchCard({ match, onJoin, joining }: MatchCardProps) {
  const canJoin = match.status === "open" && !match.isOrganizer && !match.myRequest;

  return (
    <Card className="gap-3 py-4">
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-heading text-lg font-bold leading-tight">{formatMatchTime(match.startsAt)}</p>
            <p className="text-sm text-muted-foreground">
              {match.company.name} · Cancha {match.courtNumber} · {formatDuration(match.durationMinutes)}
            </p>
          </div>
          <StatusBadge status={match.status} />
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-md bg-brand-lime/60 px-2 py-1 text-brand-teal dark:bg-brand-lime dark:text-brand-teal">
            {shortCategory(match.category)}
          </span>
          <span className="rounded-md bg-muted px-2 py-1">{TYPE_LABELS[match.type]}</span>
          <span className="rounded-md bg-muted px-2 py-1">
            Faltan {match.spotsLeft} de {match.maxPlayers - 1}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Link href={`/partidos/${match.code}`} className="text-sm font-semibold text-brand-teal underline-offset-4 hover:underline dark:text-brand-lime">
            Ver partido
          </Link>
          {canJoin ? (
            <Button size="sm" onClick={() => onJoin(match)} disabled={joining}>
              Pedir unirme
            </Button>
          ) : match.myRequest ? (
            <span className="text-sm text-muted-foreground">
              {match.myRequest.status === "accepted" ? "Ya juegas" : "Solicitud enviada"}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
