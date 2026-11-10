"use client";

import { CalendarDaysIcon } from "lucide-react";
import { CardListSkeleton } from "@/components/matchpa/skeletons";
import { LoadFailed } from "@/components/matchpa/load-failed";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BranchPicker } from "@/components/branch/branch-picker";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/matchpa/page-title";
import { SectionHeading } from "@/components/matchpa/section-heading";
import { PushPrompt } from "@/components/matchpa/push-prompt";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { track } from "@/lib/analytics";
import { useVerifiedAction } from "@/components/auth/verify-email-dialog";
import { api } from "@/lib/api";
import { notifyError } from "@/lib/notify";
import { byDistance, distanceToBranch, zonesFrom } from "@/lib/distance";
import { byCategoryDistance } from "@/lib/format";
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
import { dateKey, todayKey } from "@/lib/panamaFormatDate";
import { shouldAskForPush } from "@/lib/push";
import { useSession } from "@/lib/session";
import type { Availability, Match, Player } from "@/lib/types";
import { AvailabilitySheet } from "./availability-sheet";
import { DateStrip, stripMonth } from "./date-strip";
import { InvitationCard } from "./invitation-card";
import { MatchCard } from "./match-card";
import { NearbyBar } from "./nearby-bar";
import { SortMenu, type LobbySort } from "./sort-menu";
import { PlayerCard } from "./player-card";
import { ProfileCard } from "./profile-card";
import { UpcomingMatches } from "./upcoming-matches";

const ALL_BRANCHES = "all";
const SCROLL_LIST =
  "grid max-h-[60dvh] grid-cols-1 gap-3 overflow-x-hidden overflow-y-auto overscroll-contain p-0.5 md:grid-cols-2";
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
    (stalePick ? null : pickedFilter) ??
    (hasMyBranches ? MY_MATCHES : ALL_BRANCHES);
  const branchId = isBranchValue(branchFilter)
    ? Number(branchFilter)
    : undefined;

  const branchesQuery = useBranches();
  const matchesQuery = useLobbyMatches(date, branchId);
  const playersQuery = useLobbyPlayers(playerDate, branchId);
  const availabilitiesQuery = useAvailabilities();
  const invitations = useInvitations().data ?? [];

  const branches = branchesQuery.data ?? [];
  const onlyMine = branchFilter === MY_MATCHES;
  const matches =
    onlyMine && date !== null
      ? matchesQuery.data?.filter((match) =>
          myBranchIds.includes(match.branch.id),
        )
      : matchesQuery.data;
  const players = onlyMine
    ? playersQuery.data?.filter((player) =>
        myBranchIds.includes(player.availability.branchId),
      )
    : playersQuery.data;
  const availability: Availability | null =
    availabilitiesQuery.data?.find((slot) => slot.date === playerDate) ?? null;

  const refresh = useRefreshLobby();
  useLobbyRealtime(user?.id);

  const [joiningCode, setJoiningCode] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [pushOpen, setPushOpen] = useState(false);

  const nearby = useNearby();
  const [sort, setSort] = useState<LobbySort>("distance");
  const zones = useMemo(
    () => zonesFrom(branchesQuery.data ?? []),
    [branchesQuery.data],
  );
  const byDistanceActive = nearby.origin !== null && sort === "distance";
  const origin = byDistanceActive ? nearby.origin!.point : null;

  const findBranch = (id: number) => branches.find((c) => c.id === id);
  const branchName = (id: number) => findBranch(id)?.name ?? "";
  const matchKm = (match: Match) => distanceToBranch(origin, match.branch);
  const playerKm = (player: Player) =>
    distanceToBranch(origin, findBranch(player.availability.branchId));
  const byLevel = byCategoryDistance({
    category: user?.category ?? null,
    categoryTier: user?.categoryTier,
  });
  const sortedMatches = matches
    ?.slice()
    .sort(byDistanceActive ? byDistance(matchKm, byLevel) : byLevel);
  const sortedPlayers = players
    ?.slice()
    .sort(byDistanceActive ? byDistance(playerKm, byLevel) : byLevel);

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

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 pb-44 pt-6">
      <div className="flex items-center gap-3">
        <PageTitle className="text-2xl sm:text-3xl">Lobby</PageTitle>
        <Button asChild variant="outline" size="sm" className="shrink-0 bg-card font-semibold">
          <Link href="/mis-partidas">
            <CalendarDaysIcon data-icon="inline-start" />
            Mis partidas
          </Link>
        </Button>
      </div>

      {user ? (
        <ProfileCard
          user={user}
          origin={nearby.origin}
          status={nearby.status}
          zones={zones}
          onLocate={nearby.locate}
          onChooseZone={nearby.chooseZone}
          locationHelp={
            <NearbyBar
              origin={nearby.origin}
              status={nearby.status}
              zones={zones}
              onLocate={nearby.locate}
              onChooseZone={nearby.chooseZone}
              onClear={nearby.clear}
            />
          }
        />
      ) : null}

      {upcomingMatches.length > 0 ? (
        <UpcomingMatches matches={upcomingMatches} />
      ) : null}

      {invitations.length > 0 ? (
        <section className="space-y-2">
          <SectionHeading>Te invitaron</SectionHeading>
          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {invitations.map((invitation) => (
              <li key={invitation.id}>
                <InvitationCard
                  invitation={invitation}
                  rejecting={rejectingId === invitation.id}
                  onReject={() => rejectInvitation(invitation.id)}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-2">
        <SectionHeading
          trailing={
            <span className="text-xs font-semibold capitalize text-muted-foreground">
              {stripMonth(date)}
            </span>
          }
        >
          Buscar partidos
        </SectionHeading>
        <DateStrip
          value={date}
          onChange={(next) => {
            setDate(next);
            setPickedFilter(null);
          }}
        />
      </section>

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
                  label:
                    myBranchIds.length > 1
                      ? "Sucursales de tus partidos"
                      : "Sucursal de tu partido",
                }
              : undefined
          }
          className="min-w-0 flex-1 bg-card sm:w-72 sm:flex-none"
        />
        <SortMenu
          sort={sort}
          onSortChange={setSort}
          distanceAvailable={nearby.origin !== null}
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
            <ul className={SCROLL_LIST}>
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
            <ul className={SCROLL_LIST}>
              {sortedPlayers?.map((player) => (
                <li key={player.id}>
                  <PlayerCard
                    player={player}
                    branchName={branchName}
                    distanceKm={playerKm(player)}
                  />
                </li>
              ))}
            </ul>
          </ListState>
        </TabsContent>
      </Tabs>

      <div
        data-fixed-bottom-bar
        className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 p-4 backdrop-blur"
      >
        <div className="mx-auto grid max-w-6xl gap-2">
          <Button
            size="lg"
            className="h-12 w-full text-base font-bold"
            onClick={() => setAvailabilityOpen(true)}
          >
            {availability ? "Editar mi disponibilidad" : "Estoy disponible"}
          </Button>
          <Button
            size="lg"
            className="h-12 w-full bg-brand-teal text-base font-bold text-brand-ivory hover:bg-brand-teal/90 dark:bg-brand-turquoise dark:text-brand-teal dark:hover:bg-brand-turquoise/90"
            onClick={() =>
              guard(() => router.push(`/partidos/nuevo?n=${Date.now()}`))
            }
          >
            Crear una partida
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
    .filter(
      (m) =>
        m.isOrganizer &&
        m.status === "open" &&
        dateKey(new Date(m.startsAt)) === day,
    )
    .map((m) => m.branch.id);
  return [...new Set(ids)];
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
