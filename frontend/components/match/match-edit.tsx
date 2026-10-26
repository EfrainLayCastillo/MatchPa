"use client";

import { DetailSkeleton } from "@/components/matchpa/skeletons";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/matchpa/page-title";
import { api, ApiError } from "@/lib/api";
import type { Match } from "@/lib/types";
import { MatchForm } from "./match-form";

export function MatchEdit({ code }: { code: string }) {
  const [match, setMatch] = useState<Match | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api
      .match(code)
      .then((data) => active && setMatch(data))
      .catch((err) => active && setError(err instanceof ApiError ? err.message : "No encontramos este partido"));
    return () => {
      active = false;
    };
  }, [code]);

  if (error) return <p role="alert" className="text-sm text-destructive">{error}</p>;
  if (!match) return <DetailSkeleton />;

  if (!match.isOrganizer || match.status !== "open") {
    return (
      <div className="space-y-4">
        <p className="text-sm">Solo el organizador puede editar un partido abierto.</p>
        <Button asChild variant="outline">
          <Link href={`/partidos/${code}`}>Volver al partido</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageTitle hint="Puedes cambiar la hora, la cancha, el tipo y los jugadores que ya tienes.">Editar partido</PageTitle>
      <MatchForm match={match} />
    </div>
  );
}
