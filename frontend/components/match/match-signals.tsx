"use client";

import { CheckIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PadelPattern } from "@/components/matchpa/padel-pattern";
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

function useScrollToEnd(count: number) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTo({ top: el.scrollHeight });
  }, [count]);
  return ref;
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
  const scrollRef = useScrollToEnd(signals.length);

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
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="relative isolate bg-brand-ivory dark:bg-brand-teal/40">
          <PadelPattern className="-z-10 text-brand-teal/[0.14] dark:text-brand-lime/[0.12]" />
          <div ref={scrollRef} className="max-h-64 overflow-y-auto overscroll-contain px-3 py-4">
            {signals.length > 0 ? (
              <ul className="space-y-2" aria-live="polite">
                {signals.map((signal) => (
                  <SignalBubble
                    key={`${signal.userId}-${signal.kind}`}
                    signal={signal}
                    own={signal.userId === user?.id}
                    organizer={signal.userId === match.organizer.id}
                    now={now}
                  />
                ))}
              </ul>
            ) : (
              <p className="py-2 text-center text-sm text-muted-foreground">
                Avisa al grupo cuando vayas para la cancha
              </p>
            )}
          </div>
        </div>
        {canSend ? (
          <div
            className="flex gap-2 overflow-x-auto border-t border-border p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-label="Avisar al grupo"
          >
            {kinds.map((kind) => (
              <SignalButton key={kind} kind={kind} used={sent.has(kind)} pending={send.isPending} onSend={onSend} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SignalButton({
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
        "inline-flex min-h-11 flex-1 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed",
        used
          ? "border-transparent bg-muted text-muted-foreground"
          : "border-border bg-card hover:bg-muted active:scale-95 motion-reduce:active:scale-100",
      )}
    >
      {used ? <CheckIcon aria-hidden className="size-4" /> : <Icon aria-hidden className="size-4" />}
      {label}
      {used ? <span className="sr-only">, ya enviada</span> : null}
    </button>
  );
}

function SignalBubble({
  signal,
  own,
  organizer,
  now,
}: {
  signal: Match["signals"][number];
  own: boolean;
  organizer: boolean;
  now: number;
}) {
  const { label, icon: Icon } = SIGNALS[signal.kind];
  return (
    <li
      className={cn(
        "flex motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-300",
        own ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3 py-2 shadow-sm",
          own ? "rounded-br-sm bg-brand-lime text-brand-teal" : "rounded-bl-sm bg-card text-foreground",
        )}
      >
        {own ? null : (
          <p className="text-xs font-bold text-brand-teal dark:text-brand-turquoise">
            {signal.fullName.split(" ")[0]}
            <span className="font-medium text-muted-foreground"> · {organizer ? "Organizador" : "Jugador"}</span>
          </p>
        )}
        <div className="flex items-end gap-3">
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <Icon aria-hidden className="size-4 shrink-0" />
            {label}
          </p>
          <time
            dateTime={signal.createdAt}
            className={cn(
              "ml-auto shrink-0 text-[11px] leading-4",
              own ? "text-brand-teal/70" : "text-muted-foreground",
            )}
          >
            {timeAgo(signal.createdAt, now)}
          </time>
        </div>
      </div>
    </li>
  );
}
