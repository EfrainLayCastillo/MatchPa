"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { formatDateTime } from "@/lib/panamaFormatDate";
import type { Match } from "@/lib/types";
import { cn } from "@/lib/utils";

const MAX_DOTS = 6;

interface UpcomingMatchesProps {
  matches: Match[];
  cancelling: boolean;
  onCancel: (match: Match) => void;
}

export function UpcomingMatches({ matches, cancelling, onCancel }: UpcomingMatchesProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [toCancel, setToCancel] = useState<Match | null>(null);
  const many = matches.length > 1;

  useEffect(() => {
    if (!api) return;
    const sync = () => setCurrent(api.selectedScrollSnap());
    sync();
    api.on("select", sync).on("reInit", sync);
    return () => {
      api.off("select", sync).off("reInit", sync);
    };
  }, [api]);

  return (
    <section aria-label="Tus próximos partidos" className="space-y-2">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {many ? "Tus próximos partidos" : "Tu próximo partido"}
        </h2>
        {many ? (
          <span className="text-xs text-muted-foreground" aria-live="polite">
            {current + 1} de {matches.length}
          </span>
        ) : null}
      </div>

      <Carousel setApi={setApi} opts={{ align: "start" }} className="w-full">
        <CarouselContent>
          {matches.map((match) => (
            <CarouselItem key={match.code} className={cn(many && "basis-[88%] md:basis-1/2")}>
              <UpcomingMatchCard match={match} cancelling={cancelling} onCancel={() => setToCancel(match)} />
            </CarouselItem>
          ))}
        </CarouselContent>
        {many ? (
          <>
            <CarouselPrevious className="-left-4 hidden md:flex" />
            <CarouselNext className="-right-4 hidden md:flex" />
          </>
        ) : null}
      </Carousel>

      {many && matches.length <= MAX_DOTS ? <Dots count={matches.length} current={current} onSelect={(i) => api?.scrollTo(i)} /> : null}

      <AlertDialog open={toCancel !== null} onOpenChange={(open) => !open && setToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar este partido?</AlertDialogTitle>
            <AlertDialogDescription>
              Dejará de aparecer en el lobby y no se podrán sumar más jugadores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={() => toCancel && onCancel(toCancel)} disabled={cancelling}>
              Sí, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function UpcomingMatchCard({ match, cancelling, onCancel }: { match: Match; cancelling: boolean; onCancel: () => void }) {
  return (
    <article className="flex h-full flex-col justify-between gap-3 rounded-xl border border-brand-teal bg-card p-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {match.isOrganizer ? "Organizas" : "Juegas"}
        </p>
        <p className="font-heading text-lg font-bold leading-tight">{formatDateTime(match.startsAt)}</p>
        <p className="text-sm text-muted-foreground">
          {match.branch.name} · Cancha {match.courtNumber} · Faltan {match.spotsLeft}
        </p>
      </div>
      <div className="flex gap-2">
        <Button asChild size="sm">
          <Link href={`/partidos/${match.code}`}>Ver partido</Link>
        </Button>
        {match.isOrganizer ? (
          <Button size="sm" variant="outline" onClick={onCancel} disabled={cancelling}>
            Cancelar partido
          </Button>
        ) : null}
      </div>
    </article>
  );
}

function Dots({ count, current, onSelect }: { count: number; current: number; onSelect: (index: number) => void }) {
  return (
    <div className="flex justify-center">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Ir al partido ${i + 1}`}
          aria-current={i === current}
          onClick={() => onSelect(i)}
          className="flex size-11 items-center justify-center"
        >
          <span
            className={cn(
              "h-2 rounded-full transition-all",
              i === current ? "w-5 bg-brand-teal" : "w-2 bg-muted-foreground/30",
            )}
          />
        </button>
      ))}
    </div>
  );
}
