"use client";

import { CheckIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { SectionHeading } from "@/components/matchpa/section-heading";
import { matchRole, track } from "@/lib/analytics";
import { useSendSignal } from "@/lib/match-queries";
import { ApiError } from "@/lib/errors";
import { notifyError } from "@/lib/notify";
import { useSession } from "@/lib/session";
import { SIGNALS } from "@/lib/signals";
import type { Match, SignalKind } from "@/lib/types";
import { cn } from "@/lib/utils";

const MINUTE = 60_000;
const WINDOW_BEFORE = 60 * MINUTE;
const WINDOW_AFTER = 15 * MINUTE;

function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function isInWindow(match: Match, now: number): boolean {
  if (match.status === "closed") return false;
  const start = new Date(match.startsAt).getTime();
  return now >= start - WINDOW_BEFORE && now <= start + WINDOW_AFTER;
}

function timeAgo(iso: string, now: number): string {
  const minutes = Math.max(0, Math.floor((now - new Date(iso).getTime()) / MINUTE));
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  return `hace ${Math.floor(minutes / 60)} h`;
}

export function MatchSignals({ match }: { match: Match }) {
  const { user } = useSession();
  const now = useNow(30_000);
  const send = useSendSignal(match.code);
  const role = matchRole(match);
  const isMember = role === "organizer" || role === "player";
  const canSend = isMember && isInWindow(match, now);
  const signals = match.signals ?? [];

  if (!isMember || (!canSend && signals.length === 0)) return null;

  const sent = new Set(signals.filter((s) => s.userId === user?.id).map((s) => s.kind));
  const kinds = (Object.keys(SIGNALS) as SignalKind[]).filter((k) => !(role === "organizer" && k === "on_the_way"));

  function onSend(kind: SignalKind) {
    if (role === "visitor") return;
    track("send_signal", { kind, viewer_role: role });
    send.mutate(kind, {
      onError: (err) => {
        if (!(err instanceof ApiError && err.status === 409)) notifyError(err, "No se pudo mandar el aviso");
      },
    });
  }

  return (
    <section className="space-y-3">
      <SectionHeading>Actividad</SectionHeading>
      {canSend ? (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Avisar al grupo">
          {kinds.map((kind) => (
            <SignalChip key={kind} kind={kind} used={sent.has(kind)} pending={send.isPending} onSend={onSend} />
          ))}
        </div>
      ) : null}
      {signals.length > 0 ? (
        <ul className="space-y-2">
          {signals.map((signal) => (
            <SignalItem key={`${signal.userId}-${signal.kind}`} signal={signal} now={now} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function SignalChip({
  kind,
  used,
  pending,
  onSend,
}: {
  kind: SignalKind;
  used: boolean;
  pending: boolean;
  onSend: (kind: SignalKind) => void;
}) {
  const { label, icon: Icon } = SIGNALS[kind];
  return (
    <button
      type="button"
      disabled={used || pending}
      onClick={() => onSend(kind)}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        used
          ? "border-brand-teal bg-brand-lime/40 text-foreground dark:border-brand-lime"
          : "border-border bg-card hover:bg-muted",
      )}
    >
      {used ? <CheckIcon aria-hidden className="size-4" /> : <Icon aria-hidden className="size-4" />}
      {label}
      {used ? <span className="sr-only">, ya enviada</span> : null}
    </button>
  );
}

function SignalItem({ signal, now }: { signal: Match["signals"][number]; now: number }) {
  const { label, icon: Icon } = SIGNALS[signal.kind];
  return (
    <li className="flex items-center gap-3 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <span
        aria-hidden
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-teal font-heading text-sm font-extrabold text-brand-lime"
      >
        {signal.fullName.charAt(0).toUpperCase()}
      </span>
      <p className="min-w-0 flex-1 text-sm">
        <span className="font-semibold">{signal.fullName.split(" ")[0]}</span>
        <span className="text-muted-foreground"> · </span>
        <Icon aria-hidden className="mr-1 inline size-3.5 align-[-2px]" />
        {label}
        <span className="text-muted-foreground"> · {timeAgo(signal.createdAt, now)}</span>
      </p>
    </li>
  );
}
