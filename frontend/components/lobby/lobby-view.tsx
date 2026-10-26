"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/matchpa/page-title";
import { PushPrompt } from "@/components/matchpa/push-prompt";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, ApiError } from "@/lib/api";
import { byCategoryDistance, panamaDateKey } from "@/lib/format";
import { shouldAskForPush } from "@/lib/push";
import { subscribe } from "@/lib/realtime";
import { useSession } from "@/lib/session";
import type { Availability, Company, Match, Player } from "@/lib/types";
import { AvailabilitySheet } from "./availability-sheet";
import { DateStrip } from "./date-strip";
import { MatchCard } from "./match-card";
import { PlayerCard } from "./player-card";

const ALL_COMPANIES = "all";

export function LobbyView() {
  const { user } = useSession();
  const [date, setDate] = useState(panamaDateKey);
  const [companyFilter, setCompanyFilter] = useState(ALL_COMPANIES);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [players, setPlayers] = useState<Player[] | null>(null);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [version, setVersion] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [joiningCode, setJoiningCode] = useState<string | null>(null);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [pushOpen, setPushOpen] = useState(false);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  const companyId = companyFilter === ALL_COMPANIES ? undefined : Number(companyFilter);

  useEffect(() => {
    api.companies().then(setCompanies).catch(() => {});
  }, []);

  useEffect(() => subscribe("lobby", reload), [reload]);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.matches({ date, companyId }),
      api.players({ date, companyId }),
      api.myAvailabilities(),
    ])
      .then(([nextMatches, nextPlayers, mine]) => {
        if (!active) return;
        setMatches(nextMatches);
        setPlayers(nextPlayers);
        setAvailability(mine.find((slot) => slot.date === date) ?? null);
        setError(null);
      })
      .catch((err) => active && setError(err instanceof Error ? err.message : "No se pudo cargar el lobby"));
    return () => {
      active = false;
    };
  }, [date, companyId, version]);

  const companyName = (id: number | null) => companies.find((c) => c.id === id)?.name ?? "Cualquiera";
  const sortedMatches = matches?.slice().sort(byCategoryDistance(user?.category ?? null));
  const sortedPlayers = players?.slice().sort(byCategoryDistance(user?.category ?? null));

  async function requestToJoin(match: Match) {
    setJoiningCode(match.code);
    try {
      await api.requestToJoin(match.code);
      if (shouldAskForPush()) setPushOpen(true);
      reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo enviar la solicitud");
    } finally {
      setJoiningCode(null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 px-4 pb-32 pt-6">
      <div className="flex items-end justify-between gap-3">
        <PageTitle hint={`Hola, ${user?.fullName.split(" ")[0]}. ${availability ? `Estás disponible ${formatWindow(availability)}.` : "Aún no estás disponible."}`}>
          Lobby
        </PageTitle>
        <Button asChild variant="outline" size="sm">
          <Link href="/partidos/nuevo">Publicar partido</Link>
        </Button>
      </div>

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
          {sortedMatches === undefined ? <Loading /> : sortedMatches.length === 0 ? (
            <Empty>No hay partidos buscando pala para este día.</Empty>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {sortedMatches.map((match) => (
                <li key={match.id}>
                  <MatchCard match={match} onJoin={requestToJoin} joining={joiningCode === match.code} />
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="players" className="mt-4">
          {sortedPlayers === undefined ? <Loading /> : sortedPlayers.length === 0 ? (
            <Empty>Nadie disponible para este día todavía.</Empty>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {sortedPlayers.map((player) => (
                <li key={player.id}>
                  <PlayerCard player={player} companyName={companyName} />
                </li>
              ))}
            </ul>
          )}
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
        dateKey={date}
        current={availability}
        companies={companies}
        onSaved={reload}
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

function Loading() {
  return <p className="py-10 text-center text-sm text-muted-foreground">Cargando…</p>;
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">{children}</p>;
}
