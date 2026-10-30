"use client";

import { DetailSkeleton } from "@/components/matchpa/skeletons";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PushPrompt } from "@/components/matchpa/push-prompt";
import { StatusBadge } from "@/components/matchpa/status-badge";
import { track } from "@/lib/analytics";
import { api, ApiError } from "@/lib/api";
import { formatDuration, GENDER_LABELS, shortCategory, TYPE_LABELS } from "@/lib/format";
import { formatDateTime } from "@/lib/panamaFormatDate";
import { shouldAskForPush } from "@/lib/push";
import { useMatch, useMatchRealtime, useRefreshMatch } from "@/lib/match-queries";
import { useSession } from "@/lib/session";
import type { Match, MatchRequest } from "@/lib/types";
import { ShareMatch } from "./share-match";

export function MatchDetail({ code, serverMatch }: { code: string; serverMatch?: Match }) {
  const { user } = useSession();
  const query = useMatch(code, serverMatch);
  const personalized = !query.isPlaceholderData;
  const refresh = useRefreshMatch(code);
  useMatchRealtime(code);
  const match = query.data ?? null;
  const [actionError, setActionError] = useState<string | null>(null);
  const loadError = query.error ? (query.error instanceof ApiError ? query.error.message : "No encontramos este partido") : null;
  const error = actionError ?? loadError;
  const [busy, setBusy] = useState(false);
  const [pushOpen, setPushOpen] = useState(false);

  if (loadError && !match) return <p role="alert" className="p-6 text-sm text-destructive">{loadError}</p>;
  if (!match) return <DetailSkeleton />;

  async function run(action: () => Promise<unknown>, afterRequest = false) {
    setBusy(true);
    setActionError(null);
    try {
      await action();
      if (afterRequest && shouldAskForPush()) setPushOpen(true);
      refresh();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Algo salió mal, intenta de nuevo");
    } finally {
      setBusy(false);
    }
  }

  async function respond(requestId: number, action: "accept" | "reject" | "remove") {
    await api.respondToRequest(requestId, action);
    if (action === "accept") track("join_approved", {});
  }

  const summary = `Partido de pádel en ${match.branch.name}, cancha ${match.courtNumber}. Faltan ${match.spotsLeft} puestos.`;
  const whatsappHref = match.organizer.phone ? `https://wa.me/${match.organizer.phone.replace(/\D/g, "")}` : null;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 pb-16 pt-6">
      <header className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-heading text-3xl font-extrabold leading-tight">{formatDateTime(match.startsAt)}</h1>
          <StatusBadge status={match.status} />
        </div>
        <p className="text-muted-foreground">
          {match.branch.name} · Cancha {match.courtNumber} · {formatDuration(match.durationMinutes)}
        </p>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-md bg-brand-lime/60 px-2 py-1 text-brand-teal dark:bg-brand-lime dark:text-brand-teal">
            {shortCategory(match.category)} categoría
          </span>
          <span className="rounded-md bg-muted px-2 py-1">{TYPE_LABELS[match.type]}</span>
          <span className="rounded-md bg-muted px-2 py-1">
            Faltan {match.spotsLeft} de {match.maxPlayers - 1}
          </span>
        </div>
      </header>

      <Card className="gap-3 py-4">
        <CardContent className="space-y-2">
          <h2 className="font-heading text-lg font-bold">Jugadores</h2>
          <ul className="space-y-1.5 text-sm">
            {match.players.map((player) => (
              <li key={`p-${player.id}`} className="flex justify-between gap-2">
                <span className="font-medium">
                  {player.fullName}
                  {player.id === match.organizer.id ? " · organizador" : ""}
                </span>
                <span className="text-muted-foreground">
                  {shortCategory(player.category)} · {GENDER_LABELS[player.gender]}
                </span>
              </li>
            ))}
            {match.guests.map((guest) => (
              <li key={`g-${guest.id}`} className="flex justify-between gap-2">
                <span className="font-medium">{guest.name} · invitado</span>
                <span className="text-muted-foreground">
                  {shortCategory(guest.category)} · {GENDER_LABELS[guest.gender]}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {match.status !== "open" ? (
        <p className="rounded-xl bg-muted p-4 text-sm">
          {match.status === "full"
            ? "Este partido ya está completo."
            : match.status === "closed"
              ? "El organizador cerró la búsqueda."
              : "Este partido ya expiró."}
        </p>
      ) : null}

      {personalized ? (
        <>
          <ActionPanel
            match={match}
            signedIn={user !== null}
            busy={busy}
            onJoin={() => run(() => api.requestToJoin(match.code).then(() => track("join_request", { source: "match_page" })), true)}
            onLeave={(request) => run(() => api.respondToRequest(request.id, "leave"))}
            onAnswer={(request, action) => run(() => api.respondToRequest(request.id, action))}
          />

          {match.isOrganizer && match.requests ? (
            <OrganizerPanel
              match={match}
              busy={busy}
              onRespond={(request, action) => run(() => respond(request.id, action))}
              onClose={() => run(() => api.closeMatch(match.code))}
            />
          ) : null}

          {match.status === "open" || match.isOrganizer ? <ShareMatch code={match.code} summary={summary} /> : null}

          {whatsappHref && match.myRequest?.status === "accepted" && (match.status === "open" || match.status === "full") ? (
            <Button asChild variant="outline" className="w-full">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                Escribir al organizador por WhatsApp
              </a>
            </Button>
          ) : null}
        </>
      ) : (
        <div aria-hidden className="h-12 animate-pulse rounded-lg bg-muted" />
      )}

      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}

      <PushPrompt
        open={pushOpen}
        onOpenChange={setPushOpen}
        reason="Te avisamos cuando el organizador responda tu solicitud."
      />
    </div>
  );
}

function ActionPanel({
  match,
  signedIn,
  busy,
  onJoin,
  onLeave,
  onAnswer,
}: {
  match: Match;
  signedIn: boolean;
  busy: boolean;
  onJoin: () => void;
  onLeave: (request: { id: number }) => void;
  onAnswer: (request: { id: number }, action: "accept" | "reject") => void;
}) {
  if (match.isOrganizer) return null;
  if (!signedIn) {
    return (
      <Button asChild size="lg" className="h-12 w-full text-base font-bold">
        <Link href={`/login?next=/partidos/${match.code}`}>Inicia sesión para unirte</Link>
      </Button>
    );
  }
  const request = match.myRequest;
  if (!request && match.status === "open") {
    return (
      <Button size="lg" className="h-12 w-full text-base font-bold" onClick={onJoin} disabled={busy}>
        Pedir unirme
      </Button>
    );
  }
  if (request?.status === "pending" && request.kind === "invitation") {
    return (
      <div className="space-y-3 rounded-xl border border-border p-4 text-sm">
        <p className="font-medium">Te invitaron a este partido.</p>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => onAnswer({ id: request.id }, "accept")} disabled={busy || match.spotsLeft === 0}>
            Aceptar
          </Button>
          <Button variant="outline" onClick={() => onAnswer({ id: request.id }, "reject")} disabled={busy}>
            Rechazar
          </Button>
        </div>
      </div>
    );
  }
  if (request?.status === "pending") {
    return (
      <p className="rounded-xl border border-border p-4 text-sm">
        Tu solicitud está esperando respuesta del organizador.
      </p>
    );
  }
  if (request?.status === "accepted" && match.status !== "expired") {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-4 text-sm">
        <span>¡Ya estás en el partido!</span>
        <Button variant="outline" size="sm" onClick={() => onLeave({ id: request.id })} disabled={busy}>
          Salirme
        </Button>
      </div>
    );
  }
  return null;
}

function OrganizerPanel({
  match,
  busy,
  onRespond,
  onClose,
}: {
  match: Match;
  busy: boolean;
  onRespond: (request: MatchRequest, action: "accept" | "reject" | "remove") => void;
  onClose: () => void;
}) {
  const requests = match.requests ?? [];
  const pending = requests.filter((r) => r.status === "pending" && r.kind === "join_request");
  const invited = requests.filter((r) => r.status === "pending" && r.kind === "invitation");
  const accepted = requests.filter((r) => r.status === "accepted");

  return (
    <Card className="gap-4 py-4">
      <CardContent className="space-y-4">
        <h2 className="font-heading text-lg font-bold">Tu partido</h2>

        <RequestGroup title="Solicitudes" empty="Nadie ha pedido unirse todavía.">
          {pending.map((request) => (
            <RequestRow key={request.id} request={request}>
              <Button
                size="sm"
                onClick={() => onRespond(request, "accept")}
                disabled={busy || match.spotsLeft === 0}
              >
                Aceptar
              </Button>
              <Button size="sm" variant="outline" onClick={() => onRespond(request, "reject")} disabled={busy}>
                Rechazar
              </Button>
            </RequestRow>
          ))}
        </RequestGroup>

        <RequestGroup title="Invitados" empty="Todavía no invitaste a nadie.">
          {invited.map((request) => (
            <RequestRow key={request.id} request={request}>
              <span className="text-xs text-muted-foreground">Esperando su respuesta</span>
            </RequestRow>
          ))}
        </RequestGroup>

        <RequestGroup title="Confirmados" empty="Aún no hay jugadores confirmados.">
          {accepted.map((request) => (
            <RequestRow key={request.id} request={request}>
              <Button size="sm" variant="outline" onClick={() => onRespond(request, "remove")} disabled={busy}>
                Sacar
              </Button>
            </RequestRow>
          ))}
        </RequestGroup>

        {match.status === "open" ? (
          <div className="grid gap-2 sm:grid-cols-2">
            <Button asChild variant="outline">
              <Link href={`/partidos/${match.code}/editar`}>Editar partido</Link>
            </Button>
            <Button variant="outline" onClick={onClose} disabled={busy}>
              Cerrar búsqueda
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function RequestGroup({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: React.ReactNode[];
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
      {children.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {children.map((child, i) => (
            <li key={i}>{child}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RequestRow({ request, children }: { request: MatchRequest; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border p-3">
      <div className="min-w-0">
        <p className="truncate font-medium">{request.user.fullName}</p>
        <p className="text-xs text-muted-foreground">
          {shortCategory(request.user.category)} · {GENDER_LABELS[request.user.gender]}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">{children}</div>
    </div>
  );
}
