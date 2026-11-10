"use client";

import { DetailSkeleton } from "@/components/matchpa/skeletons";
import { whatsappUrl } from "@/lib/whatsapp";
import { SITE_URL } from "@/lib/config";
import { formatDateTime } from "@/lib/panamaFormatDate";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PushPrompt } from "@/components/matchpa/push-prompt";
import {
  INVITE_PRIMARY,
  INVITE_SECONDARY,
  InviteSurface,
} from "@/components/matchpa/invite-surface";
import { PlayerSummary } from "@/components/matchpa/player-identity";
import { SectionHeading } from "@/components/matchpa/section-heading";
import { track } from "@/lib/analytics";
import { useVerifiedAction } from "@/components/auth/verify-email-dialog";
import { api, ApiError } from "@/lib/api";
import { notifyError } from "@/lib/notify";
import { LoadFailed } from "@/components/matchpa/load-failed";
import { toMatchImage } from "@/lib/match-images";
import { shouldAskForPush } from "@/lib/push";
import {
  useMatch,
  useMatchRealtime,
  useRefreshMatch,
} from "@/lib/match-queries";
import { useSession } from "@/lib/session";
import type { Match, MatchRequest } from "@/lib/types";
import { BranchDetails } from "./branch-contact";
import { MatchBottomBar } from "./match-bottom-bar";
import { MatchBanner, MatchHeading } from "./match-hero";

export function MatchDetail({
  code,
  serverMatch,
}: {
  code: string;
  serverMatch?: Match;
}) {
  const { user } = useSession();
  const { guard, handleError } = useVerifiedAction();
  const query = useMatch(code, serverMatch);
  const personalized = !query.isPlaceholderData;
  const refresh = useRefreshMatch(code);
  useMatchRealtime(code);
  const match = query.data ?? null;
  const loadError = query.error
    ? query.error instanceof ApiError
      ? query.error.message
      : "No encontramos este partido"
    : null;
  const [busy, setBusy] = useState(false);
  const [pushOpen, setPushOpen] = useState(false);
  const image = toMatchImage(useSearchParams().get("img"));

  if (loadError && !match)
    return (
      <div className="p-6">
        <LoadFailed message={loadError} onRetry={query.refetch} />
      </div>
    );
  if (!match) return <DetailSkeleton />;

  async function run(action: () => Promise<unknown>, afterRequest = false) {
    setBusy(true);
    try {
      await action();
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
    requestId: number,
    action: "accept" | "reject" | "remove",
  ) {
    await api.respondToRequest(requestId, action);
    if (action === "accept") track("join_approved", {});
  }

  const whatsappHref = match.organizer.phone
    ? whatsappUrl(match.organizer.phone, organizerMessage(match))
    : null;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <MatchBanner image={image} />
      <div className="relative -mt-6 space-y-6 rounded-t-3xl bg-background px-4 pb-32 pt-5">
        <MatchHeading
          match={match}
          canEdit={personalized && match.isOrganizer && match.status === "open"}
        />

        <section className="space-y-2">
          <SectionHeading>Jugadores</SectionHeading>
          <ul className="space-y-2">
            {match.players.map((player) => (
              <li key={`p-${player.id}`}>
                <Card className="px-4">
                  <PlayerSummary
                    name={player.fullName}
                    verified={player.emailVerified}
                    gender={player.gender}
                    category={player.category}
                    tier={player.categoryTier}
                    caption={
                      player.id === match.organizer.id ? (
                        <RoleCaption>Organizador</RoleCaption>
                      ) : null
                    }
                  />
                </Card>
              </li>
            ))}
            {match.guests.map((guest) => (
              <li key={`g-${guest.id}`}>
                <Card className="px-4">
                  <PlayerSummary
                    name={guest.name}
                    gender={guest.gender}
                    category={guest.category}
                    tier={guest.categoryTier}
                    caption={<RoleCaption>Invitado</RoleCaption>}
                  />
                </Card>
              </li>
            ))}
          </ul>
        </section>

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
              onJoin={() =>
                guard(() =>
                  run(
                    () =>
                      api
                        .requestToJoin(match.code)
                        .then(() =>
                          track("join_request", { source: "match_page" }),
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
                  run(() => respond(request.id, action))
                }
                onClose={() => run(() => api.closeMatch(match.code))}
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
          <BranchDetails branch={match.branch} />
        </section>
      </div>
      <MatchBottomBar match={match} image={image} />
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
        <Link href={`/login?next=/partidos/${match.code}`}>
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => onLeave({ id: request.id })}
          disabled={busy}
        >
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
  onRespond: (
    request: MatchRequest,
    action: "accept" | "reject" | "remove",
  ) => void;
  onClose: () => void;
}) {
  const requests = match.requests ?? [];
  const pending = requests.filter(
    (r) => r.status === "pending" && r.kind === "join_request",
  );
  const invited = requests.filter(
    (r) => r.status === "pending" && r.kind === "invitation",
  );
  const accepted = requests.filter((r) => r.status === "accepted");

  return (
    <section className="space-y-2">
      <SectionHeading>Tu partido</SectionHeading>
      <Card className="gap-4 py-4">
        <CardContent className="space-y-4">
          <RequestGroup
            title="Solicitudes"
            empty="Nadie ha pedido unirse todavía."
          >
            {pending.map((request) => (
              <RequestRow key={request.id} request={request}>
                <Button
                  size="sm"
                  onClick={() => onRespond(request, "accept")}
                  disabled={busy || match.spotsLeft === 0}
                >
                  Aceptar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRespond(request, "reject")}
                  disabled={busy}
                >
                  Rechazar
                </Button>
              </RequestRow>
            ))}
          </RequestGroup>

          <RequestGroup title="Invitados" empty="Todavía no invitaste a nadie.">
            {invited.map((request) => (
              <RequestRow key={request.id} request={request}>
                <span className="text-xs text-muted-foreground">
                  Esperando su respuesta
                </span>
              </RequestRow>
            ))}
          </RequestGroup>

          <RequestGroup
            title="Confirmados"
            empty="Aún no hay jugadores confirmados."
          >
            {accepted.map((request) => (
              <RequestRow key={request.id} request={request}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRespond(request, "remove")}
                  disabled={busy}
                >
                  Sacar
                </Button>
              </RequestRow>
            ))}
          </RequestGroup>

          {match.status === "open" ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={onClose}
              disabled={busy}
            >
              Cerrar búsqueda
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </section>
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

function RequestRow({
  request,
  children,
}: {
  request: MatchRequest;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <PlayerSummary
        name={request.user.fullName}
        verified={request.user.emailVerified}
        gender={request.user.gender}
        category={request.user.category}
        tier={request.user.categoryTier}
        action={
          <div className="flex flex-col items-end gap-1.5">{children}</div>
        }
      />
    </div>
  );
}

function RoleCaption({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-brand-teal dark:text-brand-lime">
      {children}
    </p>
  );
}

function organizerMessage(match: Match): string {
  return [
    `Hola, te escribo por el partido de pádel del ${formatDateTime(match.startsAt)} en ${match.branch.name}, cancha ${match.courtNumber}.`,
    `${SITE_URL}/partidos/${match.code}`,
  ].join("\n");
}
