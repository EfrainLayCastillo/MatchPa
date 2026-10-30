"use client";

import { CardListSkeleton } from "@/components/matchpa/skeletons";
import { LoadFailed } from "@/components/matchpa/load-failed";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageTitle } from "@/components/matchpa/page-title";
import { PushPrompt } from "@/components/matchpa/push-prompt";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, ApiError } from "@/lib/api";
import { byCategoryDistance } from "@/lib/format";
import {
  useAvailabilities,
  useCompanies,
  useInvitations,
  useLobbyMatches,
  useLobbyPlayers,
  useLobbyRealtime,
  useOwnMatch,
  useRefreshLobby,
} from "@/lib/lobby-queries";
import { formatDateTime, todayKey } from "@/lib/panamaFormatDate";
import { shouldAskForPush } from "@/lib/push";
import { useSession } from "@/lib/session";
import type { Availability, Match } from "@/lib/types";
import { AvailabilitySheet } from "./availability-sheet";
import { DateStrip } from "./date-strip";
import { MatchCard } from "./match-card";
import { PlayerCard } from "./player-card";

const ALL_COMPANIES = "all";

export function LobbyView() {
  const router = useRouter();
  const { user } = useSession();
  const [date, setDate] = useState<string | null>(null);
  const playerDate = date ?? todayKey();
  const [companyFilter, setCompanyFilter] = useState(ALL_COMPANIES);
  const companyId = companyFilter === ALL_COMPANIES ? undefined : Number(companyFilter);

  const companiesQuery = useCompanies();
  const matchesQuery = useLobbyMatches(date, companyId);
  const playersQuery = useLobbyPlayers(playerDate, companyId);
  const availabilitiesQuery = useAvailabilities();
  const invitations = useInvitations().data ?? [];
  const ownMatch = useOwnMatch().data ?? null;

  const companies = companiesQuery.data ?? [];
  const matches = matchesQuery.data;
  const players = playersQuery.data;
  const availability: Availability | null =
    availabilitiesQuery.data?.find((slot) => slot.date === playerDate) ?? null;

  const refresh = useRefreshLobby();
  useLobbyRealtime(user?.id);

  const [actionError, setActionError] = useState<string | null>(null);
  const error = actionError;

  const [joiningCode, setJoiningCode] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [pushOpen, setPushOpen] = useState(false);

  const companyName = (id: number | null) => companies.find((c) => c.id === id)?.name ?? "Cualquiera";
  const sortedMatches = matches?.slice().sort(byCategoryDistance(user?.category ?? null));
  const sortedPlayers = players?.slice().sort(byCategoryDistance(user?.category ?? null));

  async function requestToJoin(match: Match) {
    setJoiningCode(match.code);
    setActionError(null);
    try {
      await api.requestToJoin(match.code);
      if (shouldAskForPush()) setPushOpen(true);
      refresh();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "No se pudo enviar la solicitud");
    } finally {
      setJoiningCode(null);
    }
  }

  async function cancelOwnMatch(match: Match) {
    setCancelling(true);
    setActionError(null);
    try {
      await api.closeMatch(match.code);
      refresh();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "No se pudo cancelar el partido");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 px-4 pb-32 pt-6">
      <div className="flex items-end justify-between gap-3">
        <PageTitle hint={`Hola, ${user?.fullName.split(" ")[0]}. ${availability ? `Estás disponible ${formatWindow(availability)}.` : "Aún no estás disponible."}`}>
          Lobby
        </PageTitle>
        <Button size="sm" className="font-bold" onClick={() => router.push(`/partidos/nuevo?n=${Date.now()}`)}>
          Publicar partido
        </Button>
      </div>

      {ownMatch ? (
        <section className="flex flex-col gap-3 rounded-xl border border-brand-teal bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Tu próximo partido · {ownMatch.isOrganizer ? "Organizas" : "Juegas"}
            </p>
            <p className="font-heading text-lg font-bold leading-tight">{formatDateTime(ownMatch.startsAt)}</p>
            <p className="text-sm text-muted-foreground">
              {ownMatch.company.name} · Cancha {ownMatch.courtNumber} · Faltan {ownMatch.spotsLeft}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild size="sm">
              <Link href={`/partidos/${ownMatch.code}`}>Ver partido</Link>
            </Button>
            {ownMatch.isOrganizer ? (
              <Button size="sm" variant="outline" onClick={() => setConfirmCancel(true)} disabled={cancelling}>
                Cancelar partido
              </Button>
            ) : null}
          </div>
          <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Cancelar este partido?</AlertDialogTitle>
                <AlertDialogDescription>
                  Dejará de aparecer en el lobby y no se podrán sumar más jugadores.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Volver</AlertDialogCancel>
                <AlertDialogAction onClick={() => cancelOwnMatch(ownMatch)} disabled={cancelling}>
                  Sí, cancelar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>
      ) : null}

      {invitations.length > 0 ? (
        <section className="space-y-2">
          <h2 className="font-heading text-lg font-bold">Te invitaron</h2>
          <ul className="grid gap-2 md:grid-cols-2">
            {invitations.map((invitation) => (
              <li key={invitation.id}>
                <Link
                  href={`/partidos/${invitation.match.code}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-brand-lime bg-brand-lime/30 p-3 text-sm font-semibold"
                >
                  <span>
                    {formatDateTime(invitation.match.startsAt)} · Cancha {invitation.match.courtNumber} ·{" "}
                    {invitation.match.companyName}
                  </span>
                  <span className="shrink-0 text-brand-teal dark:text-brand-lime">Responder</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <DateStrip value={date} onChange={setDate} />

      <div className="flex items-center gap-2">
        <Select value={companyFilter} onValueChange={setCompanyFilter}>
          <SelectTrigger className="w-full sm:w-64" aria-label="Empresa">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_COMPANIES}>Todas las empresas</SelectItem>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id.toString()}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}

      <Tabs defaultValue="matches">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="matches">Partidos {matches ? `(${matches.length})` : ""}</TabsTrigger>
          <TabsTrigger value="players">Jugadores {players ? `(${players.length})` : ""}</TabsTrigger>
        </TabsList>

        <TabsContent value="matches" className="mt-4">
          <ListState query={matchesQuery} count={sortedMatches?.length} empty="No hay partidos buscando pala para este día.">
            <ul className="grid gap-3 md:grid-cols-2">
              {sortedMatches?.map((match) => (
                <li key={match.id}>
                  <MatchCard match={match} onJoin={requestToJoin} joining={joiningCode === match.code} />
                </li>
              ))}
            </ul>
          </ListState>
        </TabsContent>

        <TabsContent value="players" className="mt-4">
          <ListState query={playersQuery} count={sortedPlayers?.length} empty="Nadie disponible para este día todavía.">
            <ul className="grid gap-3 md:grid-cols-2">
              {sortedPlayers?.map((player) => (
                <li key={player.id}>
                  <PlayerCard player={player} companyName={companyName} />
                </li>
              ))}
            </ul>
          </ListState>
        </TabsContent>
      </Tabs>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 p-4 backdrop-blur">
        <div className="mx-auto max-w-5xl">
          <Button size="lg" className="h-12 w-full text-base font-bold" onClick={() => setAvailabilityOpen(true)}>
            {availability ? "Editar mi disponibilidad" : "Estoy disponible"}
          </Button>
        </div>
      </div>

      <AvailabilitySheet
        open={availabilityOpen}
        onOpenChange={setAvailabilityOpen}
        dateKey={playerDate}
        current={availability}
        companies={companies}
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

function formatWindow(slot: Availability): string {
  return `de ${slot.fromTime} a ${slot.toTime}`;
}

interface ListStateProps {
  query: { isError: boolean; refetch: () => Promise<unknown> };
  count: number | undefined;
  empty: string;
  children: React.ReactNode;
}

function ListState({ query, count, empty, children }: ListStateProps) {
  if (count === undefined && query.isError) return <LoadFailed onRetry={query.refetch} />;
  if (count === undefined) return <CardListSkeleton />;
  if (count === 0) return <Empty>{empty}</Empty>;
  return children;
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">{children}</p>;
}
