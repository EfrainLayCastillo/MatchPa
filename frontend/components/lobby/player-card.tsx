"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { GENDER_LABELS, shortCategory } from "@/lib/format";
import type { Match, Player } from "@/lib/types";

interface PlayerCardProps {
  player: Player;
  companyName: (companyId: number | null) => string;
}

export function PlayerCard({ player, companyName }: PlayerCardProps) {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [busy, setBusy] = useState(false);
  const { availability } = player;

  async function invite() {
    setBusy(true);
    const mine = await api
      .myMatches()
      .then((all) => all.filter((match) => match.isOrganizer && match.status === "open"))
      .catch(() => []);
    setBusy(false);

    if (mine.length === 0) {
      const params = new URLSearchParams({ invitar: String(player.id), nombre: player.fullName, n: String(Date.now()) });
      router.push(`/partidos/nuevo?${params.toString()}`);
      return;
    }
    setMatches(mine);
  }

  return (
    <Card className="gap-3 py-4">
      <CardContent className="flex items-center justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="truncate font-heading text-lg font-bold leading-tight">{player.fullName}</p>
          <p className="text-sm text-muted-foreground">
            {shortCategory(player.category)} categoría · {GENDER_LABELS[player.gender]}
          </p>
          <p className="text-xs text-muted-foreground">
            {availability.fromTime}–{availability.toTime} · {companyName(availability.companyId)}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={invite} disabled={busy} className="shrink-0">
          Ey Pa, ¿juegas?
        </Button>
      </CardContent>
      <InviteDialog player={player} matches={matches} onClose={() => setMatches(null)} />
    </Card>
  );
}

function InviteDialog({
  player,
  matches,
  onClose,
}: {
  player: Player;
  matches: Match[] | null;
  onClose: () => void;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const firstName = player.fullName.split(" ")[0];

  async function invite(match: Match) {
    try {
      await api.invite(match.code, player.id);
      setMessage(`Listo, le enviamos la invitación a ${firstName}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo enviar la invitación");
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setMessage(null);
      onClose();
    }
  }

  return (
    <Dialog open={matches !== null} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invitar a {firstName}</DialogTitle>
          <DialogDescription>Elige el partido al que lo quieres sumar.</DialogDescription>
        </DialogHeader>
        <ul className="space-y-2">
          {(matches ?? []).map((match) => (
            <li key={match.id}>
              <Button variant="outline" className="w-full justify-between" onClick={() => invite(match)}>
                <span>
                  Cancha {match.courtNumber} · {match.company.name}
                </span>
                <span className="text-muted-foreground">Faltan {match.spotsLeft}</span>
              </Button>
            </li>
          ))}
        </ul>
        {message ? <p role="status" className="text-sm font-medium">{message}</p> : null}
      </DialogContent>
    </Dialog>
  );
}
