"use client";

import { CheckIcon, FlameIcon, XIcon } from "lucide-react";
import { useRef, useState } from "react";
import { PlayerSummary } from "@/components/matchpa/player-identity";
import { Button } from "@/components/ui/button";
import { levelFit } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Match, MatchRequest } from "@/lib/types";

const SWIPE_TO_DECIDE = 96;

interface RequestCardProps {
  match: Match;
  request: MatchRequest;
  busy: boolean;
  onAccept: () => void;
  onReject: () => void;
}

export function RequestCard({ match, request, busy, onAccept, onReject }: RequestCardProps) {
  const { offset, handlers } = useSwipe((direction) => (direction < 0 ? onReject() : match.spotsLeft > 0 ? onAccept() : undefined), busy);
  const fills = match.spotsLeft === 1;
  return (
    <div className="relative overflow-hidden rounded-xl">
      <SwipeHints offset={offset} />
      <div
        {...handlers}
        style={{ transform: `translateX(${offset}px)` }}
        className={cn(
          "relative touch-pan-y rounded-xl border border-border bg-card p-3",
          offset === 0 && "transition-transform duration-200",
        )}
      >
        <div className="mb-2 flex flex-wrap gap-1.5">
          <FitBadge request={request} match={match} />
          {fills ? (
            <span
              title="Te completa el partido"
              className="inline-flex size-5 items-center justify-center rounded-full bg-brand-teal text-brand-lime"
            >
              <FlameIcon aria-hidden className="size-3" />
              <span className="sr-only">Te completa el partido</span>
            </span>
          ) : null}
        </div>
        <PlayerSummary
          name={request.user.fullName}
          verified={request.user.emailVerified}
          gender={request.user.gender}
          category={request.user.category}
          tier={request.user.categoryTier}
          stackedBadges
          action={
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="size-11 rounded-full"
                aria-label={`Rechazar a ${request.user.fullName}`}
                onClick={onReject}
                disabled={busy}
              >
                <XIcon />
              </Button>
              <Button
                size="icon"
                className="size-11 rounded-full"
                aria-label={`Aceptar a ${request.user.fullName}`}
                onClick={onAccept}
                disabled={busy || match.spotsLeft === 0}
              >
                <CheckIcon />
              </Button>
            </div>
          }
        />
      </div>
    </div>
  );
}

function FitBadge({ request, match }: { request: MatchRequest; match: Match }) {
  const fit = levelFit(request.user, match);
  if (!fit) return null;
  const tone =
    fit.steps === 0
      ? "bg-brand-lime text-brand-teal"
      : Math.abs(fit.steps) === 1
        ? "bg-brand-turquoise/25 text-brand-teal dark:text-brand-ivory"
        : "bg-muted text-muted-foreground";
  return <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", tone)}>{fit.label}</span>;
}

function SwipeHints({ offset }: { offset: number }) {
  if (offset === 0) return null;
  const accepting = offset > 0;
  return (
    <div
      aria-hidden
      className={cn(
        "absolute inset-0 flex items-center px-5 text-sm font-bold",
        accepting ? "justify-start bg-brand-lime text-brand-teal" : "justify-end bg-muted text-muted-foreground",
      )}
      style={{ opacity: Math.min(Math.abs(offset) / SWIPE_TO_DECIDE, 1) }}
    >
      {accepting ? <CheckIcon className="size-5" /> : <XIcon className="size-5" />}
    </div>
  );
}

function useSwipe(onDecide: (direction: number) => void, disabled: boolean) {
  const [offset, setOffset] = useState(0);
  const start = useRef<number | null>(null);
  const release = () => {
    if (Math.abs(offset) >= SWIPE_TO_DECIDE) onDecide(Math.sign(offset));
    start.current = null;
    setOffset(0);
  };
  const handlers = {
    onPointerDown: (event: React.PointerEvent) => {
      if (disabled || event.pointerType === "mouse") return;
      start.current = event.clientX;
    },
    onPointerMove: (event: React.PointerEvent) => {
      if (start.current !== null) setOffset(event.clientX - start.current);
    },
    onPointerUp: release,
    onPointerCancel: () => {
      start.current = null;
      setOffset(0);
    },
  };
  return { offset, handlers };
}
