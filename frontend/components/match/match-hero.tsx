import { PencilIcon } from "lucide-react";
import Link from "next/link";
import { MatchFace } from "@/components/match/match-face";
import { Button } from "@/components/ui/button";
import type { Match } from "@/lib/types";

export function MatchHeading({ match, canEdit }: { match: Match; canEdit: boolean }) {
  return (
    <header className="relative">
      <MatchFace match={match} />
      {canEdit ? <EditLink code={match.code} /> : null}
    </header>
  );
}

function EditLink({ code }: { code: string }) {
  return (
    <Button
      asChild
      size="icon"
      className="absolute -bottom-3 -right-3 z-10 size-12 rounded-full bg-brand-teal text-white shadow-md ring-4 ring-background hover:bg-brand-teal/90 hover:text-white [&_svg]:size-6"
    >
      <Link href={`/partidos/${code}/editar`} aria-label="Editar partido">
        <PencilIcon strokeWidth={2.75} />
      </Link>
    </Button>
  );
}
