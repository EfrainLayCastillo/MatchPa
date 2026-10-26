"use client";

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
  const [open, setOpen] = useState(false);
  const { availability } = player;

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
        <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="shrink-0">
          Ey Pa, ¿juegas?
        </Button>
      </CardContent>
      <InviteDialog open={open} onOpenChange={setOpen} player={player} />
    </Card>
  );
}

function InviteDialog({ open, onOpenChange, player }: { open: boolean; onOpenChange: (open: boolean) => void; player: Player }) {
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (next) {
      setMessage(null);
      api.myMatches().then((all) => setMatches(all.filter((m) => m.isOrganizer && m.status === "open")));
    }
  }

  async function invite(match: Match) {
    try {
      await api.invite(match.code, player.id);
      setMessage(`Listo, le enviamos la invitación a ${player.fullName.split(" ")[0]}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo enviar la invitación");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invitar a {player.fullName.split(" ")[0]}</DialogTitle>
          <DialogDescription>Elige el partido al que lo quieres sumar.</DialogDescription>
        </DialogHeader>
        {matches === null ? (
          <p className="text-sm text-muted-foreground">Cargando tus partidos…</p>
        ) : matches.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no tienes partidos abiertos. Publica uno primero.</p>
        ) : (
          <ul className="space-y-2">
            {matches.map((match) => (
              <li key={match.id}>
                <Button variant="outline" className="w-full justify-between" onClick={() => invite(match)}>
                  <span>Cancha {match.courtNumber} · {match.company.name}</span>
                  <span className="text-muted-foreground">Faltan {match.spotsLeft}</span>
                </Button>
              </li>
            ))}
          </ul>
        )}
        {message ? <p role="status" className="text-sm font-medium">{message}</p> : null}
      </DialogContent>
    </Dialog>
  );
}
