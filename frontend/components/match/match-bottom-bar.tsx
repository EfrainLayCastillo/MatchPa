"use client";

import { MapPinIcon, Share2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { matchRole, track } from "@/lib/analytics";
import type { MatchImage } from "@/lib/match-images";
import { shareUrl } from "@/lib/share-url";
import type { Match } from "@/lib/types";
import { directionsHref } from "./branch-contact";

export function MatchBottomBar({ match, image }: { match: Match; image: MatchImage }) {
  const directions = directionsHref(match.branch);
  const canShare = match.status === "open" || match.isOrganizer;
  const storyImage = useStoryImage(canShare ? match.code : null, image);
  if (!directions && !canShare) return null;

  return (
    <div
      data-fixed-bottom-bar
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 p-4 backdrop-blur"
    >
      <div className="mx-auto grid max-w-2xl auto-cols-fr grid-flow-col gap-2">
        {directions ? (
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 bg-card text-base font-bold"
          >
            <a href={directions} target="_blank" rel="noopener noreferrer">
              <MapPinIcon data-icon="inline-start" />
              Cómo llegar
            </a>
          </Button>
        ) : null}
        {canShare ? (
          <Button
            size="lg"
            className="h-12 text-base font-bold"
            onClick={() => shareMatch(match, storyImage, image)}
          >
            <Share2Icon data-icon="inline-start" />
            Compartir
          </Button>
        ) : null}
      </div>
    </div>
  );
}

/** Fetched ahead of the tap: iOS blocks the share sheet if the file is downloaded after the user gesture. */
function useStoryImage(code: string | null, image: MatchImage): File | null {
  const [file, setFile] = useState<File | null>(null);
  useEffect(() => {
    if (!code || typeof navigator.canShare !== "function") return;
    let active = true;
    fetch(`/partidos/${code}/historia?img=${image}`)
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => {
        if (!active || !blob) return;
        const next = new File([blob], `matchpa-${code}.png`, {
          type: "image/png",
        });
        if (navigator.canShare({ files: [next] })) setFile(next);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [code, image]);
  return file;
}

async function shareMatch(match: Match, file: File | null, image: MatchImage) {
  const text = `Partido de pádel en ${match.branch.name}, cancha ${match.courtNumber}. Faltan ${match.spotsLeft} puestos.`;
  const common = {
    content_type: "match",
    sharer_role: matchRole(match),
    match_status: match.status,
  } as const;
  if (typeof navigator.share === "function") {
    const url = shareUrl(match.code, file ? "story" : "link", image);
    const data: ShareData = file
      ? { files: [file], text: `${text}\n${url}` }
      : { title: "Partido de pádel en MatchPa", text, url };
    const shared = await navigator.share(data).then(() => true, () => false);
    if (shared) track("share", { ...common, method: file ? "story_image" : "share_sheet" });
    return;
  }
  await navigator.clipboard.writeText(shareUrl(match.code, "copy", image));
  track("share", { ...common, method: "copy_link" });
  toast.success("Link copiado");
}
