"use client";

import { MapPinIcon, Share2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/config";
import type { Match } from "@/lib/types";
import { directionsHref } from "./branch-contact";

export function MatchBottomBar({ match }: { match: Match }) {
  const directions = directionsHref(match.branch);
  const canShare = match.status === "open" || match.isOrganizer;
  if (!directions && !canShare) return null;

  return (
    <div
      data-fixed-bottom-bar
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 p-4 backdrop-blur"
    >
      <div className="mx-auto grid max-w-2xl auto-cols-fr grid-flow-col gap-2">
        {directions ? (
          <Button asChild variant="outline" size="lg" className="h-12 bg-card text-base font-bold">
            <a href={directions} target="_blank" rel="noopener noreferrer">
              <MapPinIcon data-icon="inline-start" />
              Cómo llegar
            </a>
          </Button>
        ) : null}
        {canShare ? (
          <Button size="lg" className="h-12 text-base font-bold" onClick={() => shareMatch(match)}>
            <Share2Icon data-icon="inline-start" />
            Compartir
          </Button>
        ) : null}
      </div>
    </div>
  );
}

async function shareMatch(match: Match) {
  const url = `${SITE_URL}/partidos/${match.code}`;
  const text = `Partido de pádel en ${match.branch.name}, cancha ${match.courtNumber}. Faltan ${match.spotsLeft} puestos.`;
  if (typeof navigator.share === "function") {
    await navigator.share({ title: "Partido de pádel en MatchPa", text, url }).catch(() => {});
    return;
  }
  await navigator.clipboard.writeText(url);
  toast.success("Link copiado");
}
