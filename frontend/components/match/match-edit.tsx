"use client";

import { DetailSkeleton } from "@/components/matchpa/skeletons";
import { LoadFailed } from "@/components/matchpa/load-failed";
import { SlowLoad } from "@/components/matchpa/slow-load";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/matchpa/page-title";
import { api } from "@/lib/api";
import { answeredMessage } from "@/lib/errors";
import type { Match } from "@/lib/types";
import { MatchForm } from "./match-form";

export function MatchEdit({ code }: { code: string }) {
  const [match, setMatch] = useState<Match | null>(null);
  const [error, setError] = useState<{ message?: string } | null>(null);
  const load = useCallback(
    (isActive: () => boolean = () => true) =>
      api
        .match(code)
        .then((data) => {
          if (!isActive()) return;
          setMatch(data);
          setError(null);
        })
        .catch((err) => isActive() && setError({ message: answeredMessage(err) })),
    [code],
  );

  useEffect(() => {
    let active = true;
    void load(() => active);
    return () => {
      active = false;
    };
  }, [load]);

  if (error)
    return (
      <LoadFailed
        message={error.message}
        onRetry={() => load()}
      />
    );
  if (!match) return <SlowLoad><DetailSkeleton /></SlowLoad>;

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
      <MatchForm key={match.updatedAt ?? match.code} match={match} />
    </div>
  );
}
