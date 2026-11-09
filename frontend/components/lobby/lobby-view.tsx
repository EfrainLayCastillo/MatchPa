"use client";

import { CardListSkeleton } from "@/components/matchpa/skeletons";
import { LoadFailed } from "@/components/matchpa/load-failed";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BranchPicker } from "@/components/branch/branch-picker";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/matchpa/page-title";
import { PushPrompt } from "@/components/matchpa/push-prompt";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { track } from "@/lib/analytics";
import { useVerifiedAction } from "@/components/auth/verify-email-dialog";
import { api } from "@/lib/api";
import { notifyError } from "@/lib/notify";
import { byDistance, distanceToBranch, zonesFrom } from "@/lib/distance";
import { byCategoryDistance, formatAvailabilityWindow } from "@/lib/format";
import { useNearby } from "@/lib/nearby";
import {
  useAvailabilities,
  useBranches,
  useInvitations,
  useLobbyMatches,
  useLobbyPlayers,
  useLobbyRealtime,
  useRefreshLobby,
  useUpcomingMatches,
} from "@/lib/lobby-queries";
import { dateKey, formatDateTime, todayKey } from "@/lib/panamaFormatDate";
import { shouldAskForPush } from "@/lib/push";
import { useSession } from "@/lib/session";
import type { Availability, Match, Player } from "@/lib/types";
import { AvailabilitySheet } from "./availability-sheet";
import { DateStrip } from "./date-strip";
import { MatchCard } from "./match-card";
import { NearbyBar, type LobbySort } from "./nearby-bar";
import { PlayerCard } from "./player-card";
import { UpcomingMatches } from "./upcoming-matches";

const ALL_BRANCHES = "all";
const MY_MATCHES = "mine";

export function LobbyView() {
  const router = useRouter();
  const { guard, handleError } = useVerifiedAction();
  const { user } = useSession();
  const [date, setDate] = useState<string | null>(null);
  const playerDate = date ?? todayKey();
  const [pickedFilter, setPickedFilter] = useState<string | null>(null);

  const upcomingQuery = useUpcomingMatches();
  const upcomingMatches = upcomingQuery.data ?? [];
  const myBranchIds = useMemo(
    () => myOpenBranchIds(upcomingQuery.data ?? [], playerDate),
    [upcomingQuery.data, playerDate],
  );
  const hasMyBranches = myBranchIds.length > 0;
  const stalePick = pickedFilter === MY_MATCHES && !hasMyBranches;
  const branchFilter =
    (stalePick ? null : pickedFilter) ?? (hasMyBranches ? MY_MATCHES : ALL_BRANCHES);
  const branchId = isBranchValue(branchFilter) ? Number(branchFilter) : undefined;

  const branchesQuery = useBranches();
  const matchesQuery = useLobbyMatches(date, branchId);
  const playersQuery = useLobbyPlayers(playerDate, branchId);
  const availabilitiesQuery = useAvailabilities();
  const invitations = useInvitations().data ?? [];

  const branches = branchesQuery.data ?? [];
  const onlyMine = branchFilter === MY_MATCHES;
  const matches = onlyMine && date !== null
    ? matchesQuery.data?.filter((match) => myBranchIds.includes(match.branch.id))
    : matchesQuery.data;
  const players = onlyMine
    ? playersQuery.data?.filter((player) => myBranchIds.includes(player.availability.branchId))
    : playersQuery.data;
  const availability: Availability | null =
    availabilitiesQuery.data?.find((slot) => slot.date === playerDate) ?? null;

  const refresh = useRefreshLobby();
  useLobbyRealtime(user?.id);

  const [joiningCode, setJoiningCode] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [pushOpen, setPushOpen] = useState(false);

  const nearby = useNearby();
  const [sort, setSort] = useState<LobbySort>("distance");
  const zones = useMemo(() => zonesFrom(branchesQuery.data ?? []), [branchesQuery.data]);
  const byDistanceActive = nearby.origin !== null && sort === "distance";
  const origin = byDistanceActive ? nearby.origin!.point : null;

  const findBranch = (id: number) => branches.find((c) => c.id === id);
  const branchName = (id: number) => findBranch(id)?.name ?? "";
  const matchKm = (match: Match) => distanceToBranch(origin, match.branch);
  const playerKm = (player: Player) => distanceToBranch(origin, findBranch(player.availability.branchId));
  const byLevel = byCategoryDistance({ category: user?.category ?? null, categoryTier: user?.categoryTier });
  const sortedMatches = matches?.slice().sort(byDistanceActive ? byDistance(matchKm, byLevel) : byLevel);
  const sortedPlayers = players?.slice().sort(byDistanceActive ? byDistance(playerKm, byLevel) : byLevel);

  async function requestToJoin(match: Match) {
    setJoiningCode(match.code);
    try {
      await api.requestToJoin(match.code);
      track("join_request", { source: "lobby" });
      if (shouldAskForPush()) setPushOpen(true);
      refresh();
    } catch (err) {
      if (handleError(err)) return;
      notifyError(err, "No se pudo enviar la solicitud");
    } finally {
      setJoiningCode(null);
    }
  }

  async function rejectInvitation(requestId: number) {
    setRejectingId(requestId);
    try {
      await api.respondToRequest(requestId, "reject");
      refresh();
    } catch (err) {
      notifyError(err, "No se pudo rechazar la invitación");
    } finally {
      setRejectingId(null);
    }
  }

  async function cancelOwnMatch(match: Match) {
    setCancelling(true);
    try {
      await api.closeMatch(match.code);
      refresh();
    } catch (err) {
      notifyError(err, "No se pudo cancelar el partido");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 pb-32 pt-6">
      <div className="flex items-end justify-between gap-3">
        <PageTitle
          hint={`Hola, ${user?.fullName.split(" ")[0]}. ${availability ? formatWindow(availability) : "Aún no estás disponible."}`}
        >
          Lobby
        </PageTitle>
        <Button
          size="sm"
          className="font-bold"
          onClick={() => guard(() => router.push(`/partidos/nuevo?n=${Date.now()}`))}
        >
          Publicar partido
        </Button>
      </div>

      {upcomingMatches.length > 0 ? (
        <UpcomingMatches
          matches={upcomingMatches}
          cancelling={cancelling}
          onCancel={cancelOwnMatch}
        />
      ) : null}

      {invitations.length > 0 ? (
        <section className="space-y-2">
          <h2 className="font-heading text-lg font-bold">Te invitaron</h2>
          <ul className="grid gap-2 md:grid-cols-2">
            {invitations.map((invitation) => (
              <li
                key={invitation.id}
                className="flex items-center gap-2 rounded-xl border border-brand-lime bg-brand-lime/30 p-3 text-sm font-semibold"
              >
                <Link
                  href={`/partidos/${invitation.match.code}`}
                  className="flex min-w-0 flex-1 items-center justify-between gap-3"
                >
                  <span>
                    {formatDateTime(invitation.match.startsAt)} · Cancha{" "}
                    {invitation.match.courtNumber} ·{" "}
                    {invitation.match.branchName}
                  </span>
                  <span className="shrink-0 text-brand-teal dark:text-brand-lime">
                    Responder
                  </span>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => rejectInvitation(invitation.id)}
                  disabled={rejectingId === invitation.id}
                >
                  Rechazar
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <DateStrip
        value={date}
        onChange={(next) => {
          setDate(next);
          setPickedFilter(null);
        }}
      />

      <NearbyBar
        origin={nearby.origin}
        status={nearby.status}
        zones={zones}
        sort={sort}
        onSortChange={setSort}
        onLocate={nearby.locate}
        onChooseZone={nearby.chooseZone}
        onClear={nearby.clear}
      />

      <div className="flex items-center gap-2">
        <BranchPicker
          branches={branches}
          value={branchFilter}
          onChange={setPickedFilter}
          emptyOption={{ value: ALL_BRANCHES, label: "Todas las sucursales" }}
          extraOption={
            myBranchIds.length > 0
              ? {
                  value: MY_MATCHES,
                  label: myBranchIds.length > 1 ? "Sucursales de tus partidos" : "Sucursal de tu partido",
                }
              : undefined
          }
          className="sm:w-72"
        />
      </div>

      <Tabs defaultValue="matches">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="matches">
            Partidos {matches ? `(${matches.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="players">
            Jugadores {players ? `(${players.length})` : ""}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matches" className="mt-4">
          <ListState
            query={matchesQuery}
            count={sortedMatches?.length}
            empty="No hay partidos buscando pala para este día."
          >
            <ul className="grid gap-3 md:grid-cols-2">
              {sortedMatches?.map((match) => (
                <li key={match.id}>
                  <MatchCard
                    match={match}
                    onJoin={(match) => guard(() => requestToJoin(match))}
                    joining={joiningCode === match.code}
                    distanceKm={matchKm(match)}
                  />
                </li>
              ))}
            </ul>
          </ListState>
        </TabsContent>

        <TabsContent value="players" className="mt-4">
          <ListState
            query={playersQuery}
            count={sortedPlayers?.length}
            empty="Nadie disponible para este día todavía."
          >
            <ul className="grid gap-3 md:grid-cols-2">
              {sortedPlayers?.map((player) => (
                <li key={player.id}>
                  <PlayerCard player={player} branchName={branchName} distanceKm={playerKm(player)} />
                </li>
              ))}
            </ul>
          </ListState>
        </TabsContent>
      </Tabs>

      <div data-fixed-bottom-bar className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 p-4 backdrop-blur">
        <div className="mx-auto max-w-6xl">
          <Button
            size="lg"
            className="h-12 w-full text-base font-bold"
            onClick={() => setAvailabilityOpen(true)}
          >
            {availability ? "Editar mi disponibilidad" : "Estoy disponible"}
          </Button>
        </div>
      </div>

      <AvailabilitySheet
        open={availabilityOpen}
        onOpenChange={setAvailabilityOpen}
        dateKey={playerDate}
        current={availability}
        branches={branches}
        onSaved={refresh}
      />
      <PushPrompt
        open={pushOpen}
        onOpenChange={setPushOpen}
        reason="Te avisamos cuando alguien acepte tu solicitud o te invite a jugar."
      />
    </div>
  );
}

function isBranchValue(value: string): boolean {
  return value !== ALL_BRANCHES && value !== MY_MATCHES;
}

function myOpenBranchIds(matches: Match[], day: string): number[] {
  const ids = matches
    .filter((m) => m.isOrganizer && m.status === "open" && dateKey(new Date(m.startsAt)) === day)
    .map((m) => m.branch.id);
  return [...new Set(ids)];
}

function formatWindow(slot: Availability): string {
  const label = formatAvailabilityWindow(slot);
  return slot.fromTime === null
    ? `Estás disponible ${label.toLowerCase()}.`
    : `Estás disponible: ${label}.`;
}

interface ListStateProps {
  query: { isError: boolean; refetch: () => Promise<unknown> };
  count: number | undefined;
  empty: string;
  children: React.ReactNode;
}

function ListState({ query, count, empty, children }: ListStateProps) {
  if (count === undefined && query.isError)
    return <LoadFailed onRetry={query.refetch} />;
  if (count === undefined) return <CardListSkeleton />;
  if (count === 0) return <Empty>{empty}</Empty>;
  return children;
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}
