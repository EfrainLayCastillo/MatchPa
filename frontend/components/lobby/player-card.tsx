"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ClockIcon, MapPinIcon } from "lucide-react";
import { IconBadge } from "@/components/match/match-summary-card";
import { FormAlert } from "@/components/matchpa/form-alert";
import { InviteNotice } from "@/components/matchpa/invite-notice";
import { PlayerSummary } from "@/components/matchpa/player-identity";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useVerifiedAction } from "@/components/auth/verify-email-dialog";
import { api } from "@/lib/api";
import { formatDistance } from "@/lib/distance";
import { firstName, formatAvailabilityWindow } from "@/lib/format";
import { dateKey } from "@/lib/panamaFormatDate";
import type { Match, Player } from "@/lib/types";

interface PlayerCardProps {
  player: Player;
  branchName: (branchId: number) => string;
  distanceKm?: number | null;
}

export function PlayerCard({
  player,
  branchName,
  distanceKm,
}: PlayerCardProps) {
  const router = useRouter();
  const { guard } = useVerifiedAction();
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [busy, setBusy] = useState(false);
  const { availability } = player;

  async function invite() {
    setBusy(true);
    const mine = await api
      .myMatches()
      .then((all) => all.filter(fitsAvailability))
      .catch(() => []);
    setBusy(false);

    if (mine.length === 0) {
      void guard(() => publishWithInvite());
      return;
    }
    setMatches(mine);
  }

  function fitsAvailability(match: Match) {
    return (
      match.isOrganizer &&
      match.status === "open" &&
      dateKey(new Date(match.startsAt)) === availability.date &&
      match.branch.id === availability.branchId
    );
  }

  function publishWithInvite() {
    const params = new URLSearchParams({
      invitar: String(player.id),
      nombre: player.fullName,
      fecha: availability.date,
      sucursal: String(availability.branchId),
      n: String(Date.now()),
    });
    router.push(`/partidos/nuevo?${params.toString()}`);
  }

  return (
    <Card className="gap-3 px-4">
      <PlayerSummary
        name={player.fullName}
        verified={player.emailVerified}
        gender={player.gender}
        category={player.category}
        tier={player.categoryTier}
        caption={
          <p className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
            <MapPinIcon
              aria-hidden
              className="size-3.5 shrink-0 text-brand-teal dark:text-brand-lime"
            />
            <span className="truncate">
              {branchName(availability.branchId)}
            </span>
            {distanceKm != null ? (
              <span className="shrink-0 font-semibold text-brand-teal dark:text-brand-lime">
                · {formatDistance(distanceKm)}
              </span>
            ) : null}
          </p>
        }
        extraBadges={
          <IconBadge icon={ClockIcon}>
            {formatAvailabilityWindow(availability)}
          </IconBadge>
        }
        action={
          <div className="flex flex-col items-center gap-1">
            <span
              aria-hidden
              className="font-script text-lg leading-none text-brand-teal dark:text-brand-lime"
            >
              Ey Pa,
            </span>
            <Button
              size="sm"
              onClick={invite}
              disabled={busy}
              aria-label={`Ey Pa, ¿juegas? Invitar a ${player.fullName}`}
              className="font-bold"
            >
              ¿Juegas?
            </Button>
          </div>
        }
      />
      <InviteDialog
        player={player}
        matches={matches}
        onClose={() => setMatches(null)}
      />
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
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const playerName = firstName(player.fullName);

  async function invite(match: Match) {
    try {
      setError(null);
      await api.invite(match.code, player.id);
      setSent(true);
    } catch (err) {
      setSent(false);
      setError(
        err instanceof Error ? err.message : "No se pudo enviar la invitación",
      );
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setSent(false);
      setError(null);
      onClose();
    }
  }

  return (
    <Dialog open={matches !== null} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invitar a {playerName}</DialogTitle>
          <DialogDescription>
            Elige el partido al que lo quieres sumar.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2">
          {(matches ?? []).map((match) => (
            <li key={match.id}>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => invite(match)}
              >
                <span>
                  Cancha {match.courtNumber} · {match.branch.name}
                </span>
                <span className="text-muted-foreground">
                  Faltan {match.spotsLeft}
                </span>
              </Button>
            </li>
          ))}
        </ul>
        {sent ? (
          <InviteNotice sent>
            Listo, le enviamos la invitación a <strong>{playerName}</strong>.
          </InviteNotice>
        ) : null}
        <FormAlert message={error} />
      </DialogContent>
    </Dialog>
  );
}
