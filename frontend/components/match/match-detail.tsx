"use client";

import { DetailSkeleton } from "@/components/matchpa/skeletons";
import { whatsappUrl } from "@/lib/whatsapp";
import { SITE_URL } from "@/lib/config";
import { formatDateTime } from "@/lib/panamaFormatDate";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PushPrompt } from "@/components/matchpa/push-prompt";
import {
  INVITE_PRIMARY,
  INVITE_SECONDARY,
  InviteSurface,
} from "@/components/matchpa/invite-surface";
import { SectionHeading } from "@/components/matchpa/section-heading";
import { levelGap, matchRole, track } from "@/lib/analytics";
import { useVerifiedAction } from "@/components/auth/verify-email-dialog";
import { api } from "@/lib/api";
import { refreshMatchPage } from "@/app/partidos/[code]/actions";
import { answeredMessage } from "@/lib/errors";
import { canConfirmBooking, courtLabel, MAX_PLAYERS } from "@/lib/format";
import { notifyError } from "@/lib/notify";
import { LoadFailed } from "@/components/matchpa/load-failed";
import { SlowLoad } from "@/components/matchpa/slow-load";
import { shouldAskForPush } from "@/lib/push";
import {
  useMatch,
  useMatchRealtime,
  useRefreshMatch,
} from "@/lib/match-queries";
import { useSession } from "@/lib/session";
import type { Match, MatchRequest } from "@/lib/types";
import { BookingBanner } from "./booking-banner";
import { BranchShowcase } from "./branch-contact";
import { MatchBottomBar } from "./match-bottom-bar";
import { NamesHiddenCard } from "./names-hidden-card";
import { PlayerRow } from "./player-row";
import { MatchCelebration } from "./match-celebration";
import { RequestCard } from "./request-card";
import { StatusNote } from "./status-note";
import { MatchHeading } from "./match-hero";

export function MatchDetail({
  code,
  serverMatch,
}: {
  code: string;
  serverMatch?: Match;
}) {
  const { user, loading: sessionLoading } = useSession();
  const { guard, handleError } = useVerifiedAction();
  const query = useMatch(code, serverMatch);
  const personalized = !query.isPlaceholderData;
  const refresh = useRefreshMatch(code);
  useMatchRealtime(code);
  const match = query.data ?? null;
  const loadError = answeredMessage(query.error);
  const [busy, setBusy] = useState(false);
  const [pushOpen, setPushOpen] = useState(false);
  const viewTracked = useRef(false);

  useEffect(() => {
    if (!match || !personalized || sessionLoading || viewTracked.current) return;
    viewTracked.current = true;
    track("view_match", {
      match_status: match.status,
      viewer_role: user ? matchRole(match) : "anonymous",
      spots_left: match.spotsLeft,
      branch: match.branch.slug,
    });
  }, [match, personalized, sessionLoading, user]);

  if (query.error && !match)
    return (
      <div className="p-6">
        <LoadFailed message={loadError} onRetry={query.refetch} />
      </div>
    );
  if (!match) return <SlowLoad><DetailSkeleton /></SlowLoad>;

  async function run(action: () => Promise<unknown>, afterRequest = false) {
    setBusy(true);
    try {
      await action();
      refreshMatchPage(code).catch(() => {});
      if (afterRequest && shouldAskForPush()) setPushOpen(true);
      refresh();
    } catch (err) {
      if (handleError(err)) return;
      notifyError(err);
    } finally {
      setBusy(false);
    }
  }

  async function respond(
    current: Match,
    requestId: number,
    action: "accept" | "reject" | "remove",
  ) {
    await api.respondToRequest(requestId, action);
    if (action === "accept")
      track("join_approved", {
        branch: current.branch.slug,
        fills_match: current.spotsLeft === 1,
      });
  }

  const whatsappHref = match.organizer.phone
    ? whatsappUrl(match.organizer.phone, organizerMessage(match))
    : null;

  const namesHidden = match.organizer.fullName === null;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="space-y-6 px-4 pb-32 pt-5">
        <MatchHeading
          match={match}
          canEdit={personalized && match.isOrganizer && match.status === "open"}
        />

        <PlayerRow
          match={match}
          busy={busy}
          onRemove={
            personalized && match.isOrganizer
              ? (request) => run(() => respond(match, request.id, "remove"))
              : undefined
          }
        />
        <MatchCelebration status={match.status} maxPlayers={match.maxPlayers} />
        {namesHidden ? <NamesHiddenCard code={match.code} /> : null}

        <StatusNote match={match} />

        {personalized ? (
          <>
            {match.isOrganizer && canConfirmBooking(match) ? (
              <BookingBanner match={match} onBooked={refresh} />
            ) : null}
            <ActionPanel
              match={match}
              signedIn={user !== null}
              busy={busy}
              onJoin={() =>
                guard(() =>
                  run(
                    () =>
                      api
                        .requestToJoin(match.code)
                        .then(() =>
                          track("join_request", {
                            entry_point: "match_page",
                            branch: match.branch.slug,
                            level_gap: levelGap(user ?? { category: null }, match),
                          }),
                        ),
                    true,
                  ),
                )
              }
              onLeave={(request) =>
                run(() => api.respondToRequest(request.id, "leave"))
              }
              onAnswer={(request, action) => {
                const answer = () =>
                  run(() => api.respondToRequest(request.id, action));
                return action === "accept" ? guard(answer) : answer();
              }}
            />

            {match.isOrganizer && match.requests ? (
              <OrganizerPanel
                match={match}
                busy={busy}
                onRespond={(request, action) =>
                  run(() => respond(match, request.id, action))
                }
                onClose={() => run(() => api.closeMatch(match.code))}
                onAddSeat={() => run(() => api.addSeat(match.code))}
              />
            ) : null}

            {whatsappHref &&
            match.myRequest?.status === "accepted" &&
            (match.status === "open" || match.status === "full") ? (
              <Button asChild variant="outline" className="w-full">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Escribir al organizador por WhatsApp
                </a>
              </Button>
            ) : null}
          </>
        ) : (
          <div aria-hidden className="h-12 animate-pulse rounded-lg bg-muted" />
        )}
        <section className="space-y-2">
          <SectionHeading>Sucursal</SectionHeading>
          <BranchShowcase branch={match.branch} />
        </section>
      </div>
      <MatchBottomBar match={match} />
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
        <Link
          href={`/login?next=/partidos/${match.code}`}
          onClick={() => track("join_intent", { branch: match.branch.slug })}
        >
          Inicia sesión para unirte
        </Link>
      </Button>
    );
  }
  const request = match.myRequest;
  if (!request && match.status === "open") {
    return (
      <Button
        size="lg"
        className="h-12 w-full text-base font-bold"
        onClick={onJoin}
        disabled={busy}
      >
        Pedir unirme
      </Button>
    );
  }
  if (request?.status === "pending" && request.kind === "invitation") {
    return (
      <InviteSurface
        title="¡Ey Pa, te invitaron!"
        actions={
          <>
            <Button
              size="sm"
              className={INVITE_PRIMARY}
              onClick={() => onAnswer({ id: request.id }, "accept")}
              disabled={busy || match.spotsLeft === 0}
            >
              Aceptar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={INVITE_SECONDARY}
              onClick={() => onAnswer({ id: request.id }, "reject")}
              disabled={busy}
            >
              Rechazar
            </Button>
          </>
        }
      >
        <p className="font-semibold">¿Te sumas a este partido?</p>
      </InviteSurface>
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
        {match.status === "open" ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLeave({ id: request.id })}
            disabled={busy}
          >
            Salirme
          </Button>
        ) : null}
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
  onAddSeat,
}: {
  match: Match;
  busy: boolean;
  onRespond: (
    request: MatchRequest,
    action: "accept" | "reject" | "remove",
  ) => void;
  onClose: () => void;
  onAddSeat: () => void;
}) {
  const pending = (match.requests ?? []).filter(
    (r) => r.status === "pending" && r.kind === "join_request",
  );

  return (
    <section className="space-y-2">
      <SectionHeading
        trailing={
          <span className="shrink-0 text-xs text-muted-foreground">
            Solicitudes ({pending.length})
          </span>
        }
      >
        Tu partido
      </SectionHeading>
      <div className="space-y-4">
          <div className="space-y-2">
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nadie ha pedido unirse todavía.</p>
            ) : (
              <ul className="space-y-2">
                {pending.map((request) => (
                  <li key={request.id}>
                    <RequestCard
                      match={match}
                      request={request}
                      busy={busy}
                      onAccept={() => onRespond(request, "accept")}
                      onReject={() => onRespond(request, "reject")}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {match.status === "open" ? (
            <Button
              variant="secondary"
              className="h-11 w-full"
              onClick={onClose}
              disabled={busy}
            >
              Cerrar búsqueda
            </Button>
          ) : null}

          {match.status === "full" && match.maxPlayers < MAX_PLAYERS ? (
            <div className="space-y-2">
              <Button
                variant="outline"
                className="h-11 w-full"
                onClick={onAddSeat}
                disabled={busy}
              >
                Sumar un puesto
              </Button>
              <p className="text-sm text-muted-foreground">
                Pasa a {match.maxPlayers + 1} jugadores y vuelve a abrirse para que alguien más se una.
              </p>
            </div>
          ) : null}
      </div>
    </section>
  );
}

function organizerMessage(match: Match): string {
  return [
    `Hola, te escribo por el partido de pádel del ${formatDateTime(match.startsAt)} en ${match.branch.name}, ${courtLabel(match).toLowerCase()}.`,
    `${SITE_URL}/partidos/${match.code}`,
  ].join("\n");
}
