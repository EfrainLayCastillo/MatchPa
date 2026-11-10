import { LandPlotIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";
import {
  INVITE_PRIMARY,
  INVITE_SECONDARY,
  InviteSurface,
} from "@/components/matchpa/invite-surface";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/panamaFormatDate";
import type { MyRequest } from "@/lib/types";

interface InvitationCardProps {
  invitation: MyRequest;
  rejecting: boolean;
  onReject: () => void;
}

export function InvitationCard({
  invitation,
  rejecting,
  onReject,
}: InvitationCardProps) {
  const { match } = invitation;
  return (
    <InviteSurface
      title="¡Ey Pa, te invitaron!"
      actions={
        <>
          <Button asChild size="sm" className={INVITE_PRIMARY}>
            <Link href={`/partidos/${match.code}`}>Responder</Link>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={INVITE_SECONDARY}
            onClick={onReject}
            disabled={rejecting}
          >
            Rechazar
          </Button>
        </>
      }
    >
      <p className="truncate font-heading text-base font-bold leading-tight">
        {formatDateTime(match.startsAt)}
      </p>
      <p className="flex min-w-0 items-center gap-1 text-xs font-medium">
        <LandPlotIcon aria-hidden className="size-3.5 shrink-0" />
        <span className="shrink-0">Cancha {match.courtNumber}</span>
        <MapPinIcon aria-hidden className="ml-1 size-3.5 shrink-0" />
        <span className="truncate">{match.branchName}</span>
      </p>
    </InviteSurface>
  );
}
