"use client";

import { CardListSkeleton } from "@/components/matchpa/skeletons";
import { useQuery } from "@tanstack/react-query";
import {
  ClockIcon,
  CrownIcon,
  LandPlotIcon,
  MailOpenIcon,
  SendIcon,
  UserCheckIcon,
  UsersIcon,
  VenusAndMarsIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PageTitle } from "@/components/matchpa/page-title";
import { SectionHeading } from "@/components/matchpa/section-heading";
import { IconBadge, MatchSummaryCard } from "@/components/match/match-summary-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { TYPE_LABELS } from "@/lib/format";
import { lobbyKeys } from "@/lib/lobby-queries";
import type { Match, MyRequest } from "@/lib/types";

type SortBy = "updated" | "match";

const ALL_BRANCHES = "all";

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
  const [branch, setBranch] = useState(ALL_BRANCHES);

  const branches = useMemo(() => {
    const names = new Set<string>();
    (matchesQuery.data ?? []).forEach((match) => names.add(match.branch.name));
    (requestsQuery.data ?? []).forEach((request) => names.add(request.match.branchName));
    return [...names].sort();
  }, [matchesQuery.data, requestsQuery.data]);

  const matches = useMemo(() => {
    const filtered = (matchesQuery.data ?? []).filter(
      (match) => branch === ALL_BRANCHES || match.branch.name === branch,
    );
    return filtered.slice().sort(sorter(sortBy));
  }, [matchesQuery.data, branch, sortBy]);

  const pending = (requestsQuery.data ?? []).filter(
    (request) => branch === ALL_BRANCHES || request.match.branchName === branch,
  );

  return (
    <>
      <PageTitle className="text-2xl sm:text-3xl">Mis partidas</PageTitle>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Select value={branch} onValueChange={setBranch}>
          <SelectTrigger className="h-11! w-full min-w-0 bg-card" aria-label="Sucursal">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_BRANCHES}>Todas las sucursales</SelectItem>
            {branches.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
          <SelectTrigger className="h-11! w-full min-w-0 bg-card" aria-label="Orden">
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
          <SectionHeading>Pendientes</SectionHeading>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {pending.map((request) => (
              <li key={request.id}>
                <PendingRow request={request} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-2">
        <SectionHeading>Partidos</SectionHeading>
        {matchesQuery.isPending ? (
          <CardListSkeleton />
        ) : matches.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            {branch === ALL_BRANCHES
              ? "Todavía no organizas ni juegas ningún partido."
              : `No tienes partidos en ${branch}.`}
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
  return (
    <MatchSummaryCard
      match={match}
      image={null}
      badges={[
        <IconBadge key="role" icon={match.isOrganizer ? CrownIcon : UserCheckIcon}>
          {match.isOrganizer ? "Organizas" : "Juegas"}
        </IconBadge>,
        <IconBadge key="court" icon={LandPlotIcon}>
          Cancha {match.courtNumber}
        </IconBadge>,
        <IconBadge key="duration" icon={ClockIcon}>
          {match.durationMinutes} min
        </IconBadge>,
        <IconBadge key="type" icon={VenusAndMarsIcon}>
          {TYPE_LABELS[match.type]}
        </IconBadge>,
        <IconBadge key="spots" icon={UsersIcon}>
          {match.spotsLeft > 0 ? `Faltan ${match.spotsLeft}` : "Completo"}
        </IconBadge>,
      ]}
    />
  );
}

function PendingRow({ request }: { request: MyRequest }) {
  const { match } = request;
  const invited = request.kind === "invitation";
  return (
    <MatchSummaryCard
      match={{ ...match, branch: { name: match.branchName } }}
      image={null}
      badges={[
        <IconBadge key="kind" icon={invited ? MailOpenIcon : SendIcon}>
          {invited ? "Te invitaron" : "Solicitud enviada"}
        </IconBadge>,
        <IconBadge key="court" icon={LandPlotIcon}>
          Cancha {match.courtNumber}
        </IconBadge>,
        <IconBadge key="duration" icon={ClockIcon}>
          {match.durationMinutes} min
        </IconBadge>,
        <IconBadge key="type" icon={VenusAndMarsIcon}>
          {TYPE_LABELS[match.type]}
        </IconBadge>,
      ]}
    />
  );
}
