"use client";

import { CardListSkeleton } from "@/components/matchpa/skeletons";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PageTitle } from "@/components/matchpa/page-title";
import { StatusBadge } from "@/components/matchpa/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { formatDuration, shortCategory, TYPE_LABELS } from "@/lib/format";
import { lobbyKeys } from "@/lib/lobby-queries";
import { formatDateTime } from "@/lib/panamaFormatDate";
import type { Match, MyRequest } from "@/lib/types";

type SortBy = "updated" | "match";

const ALL_COMPANIES = "all";

export function MyMatchesView() {
  const matchesQuery = useQuery({
    queryKey: lobbyKeys.owned,
    queryFn: () => api.myMatches(),
    refetchOnMount: "always",
  });
  const requestsQuery = useQuery({
    queryKey: lobbyKeys.requests,
    queryFn: () => api.myRequests(),
    refetchOnMount: "always",
  });

  const [sortBy, setSortBy] = useState<SortBy>("updated");
  const [company, setCompany] = useState(ALL_COMPANIES);

  const companies = useMemo(() => {
    const names = new Set<string>();
    (matchesQuery.data ?? []).forEach((match) => names.add(match.company.name));
    (requestsQuery.data ?? []).forEach((request) => names.add(request.match.companyName));
    return [...names].sort();
  }, [matchesQuery.data, requestsQuery.data]);

  const matches = useMemo(() => {
    const filtered = (matchesQuery.data ?? []).filter(
      (match) => company === ALL_COMPANIES || match.company.name === company,
    );
    return filtered.slice().sort(sorter(sortBy));
  }, [matchesQuery.data, company, sortBy]);

  const pending = (requestsQuery.data ?? []).filter(
    (request) => company === ALL_COMPANIES || request.match.companyName === company,
  );

  return (
    <>
      <PageTitle hint="Los partidos que organizas o en los que juegas.">Mis partidas</PageTitle>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Select value={company} onValueChange={setCompany}>
          <SelectTrigger className="w-full sm:w-56" aria-label="Empresa">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_COMPANIES}>Todas las empresas</SelectItem>
            {companies.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
          <SelectTrigger className="w-full sm:w-56" aria-label="Orden">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Última actualización</SelectItem>
            <SelectItem value="match">Fecha del partido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {pending.length > 0 ? (
        <section className="space-y-2">
          <h2 className="font-heading text-lg font-bold">Pendientes</h2>
          <ul className="space-y-2">
            {pending.map((request) => (
              <li key={request.id}>
                <PendingRow request={request} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold">Partidos</h2>
        {matchesQuery.isPending ? (
          <CardListSkeleton />
        ) : matches.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            {company === ALL_COMPANIES
              ? "Todavía no organizas ni juegas ningún partido."
              : `No tienes partidos en ${company}.`}
          </p>
        ) : (
          <ul className="space-y-3">
            {matches.map((match) => (
              <li key={match.id}>
                <MatchRow match={match} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

/** "updated": most recently changed first. "match": soonest match first. */
function sorter(sortBy: SortBy) {
  return (a: Match, b: Match) =>
    sortBy === "updated"
      ? (b.updatedAt ?? b.startsAt).localeCompare(a.updatedAt ?? a.startsAt)
      : a.startsAt.localeCompare(b.startsAt);
}

function MatchRow({ match }: { match: Match }) {
  const seated = match.players.length + match.guests.length;

  return (
    <Card className="gap-3 py-4">
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="font-heading text-lg font-bold leading-tight">{formatDateTime(match.startsAt)}</p>
            <p className="text-sm text-muted-foreground">
              {match.company.name} · Cancha {match.courtNumber} · {formatDuration(match.durationMinutes)}
            </p>
          </div>
          <StatusBadge status={match.status} />
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-md bg-brand-teal px-2 py-1 text-brand-ivory">
            {match.isOrganizer ? "Organizas" : "Juegas"}
          </span>
          <span className="rounded-md bg-muted px-2 py-1">{shortCategory(match.category)} categoría</span>
          <span className="rounded-md bg-muted px-2 py-1">{TYPE_LABELS[match.type]}</span>
          <span className="rounded-md bg-muted px-2 py-1">
            {seated}/{match.maxPlayers} jugadores
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          {match.updatedAt ? (
            <span className="text-xs text-muted-foreground">Actualizado {formatDateTime(match.updatedAt)}</span>
          ) : (
            <span />
          )}
          <Button asChild size="sm" variant="outline">
            <Link href={`/partidos/${match.code}`}>Ver partido</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PendingRow({ request }: { request: MyRequest }) {
  const label = request.kind === "invitation" ? "Te invitaron" : "Solicitud enviada";

  return (
    <Link
      href={`/partidos/${request.match.code}`}
      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 text-sm"
    >
      <span>
        {formatDateTime(request.match.startsAt)} · Cancha {request.match.courtNumber} · {request.match.companyName}
      </span>
      <span className="shrink-0 font-semibold text-brand-teal dark:text-brand-lime">{label}</span>
    </Link>
  );
}
