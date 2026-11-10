"use client";

import { LandPlotIcon, UsersIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { SectionHeading } from "@/components/matchpa/section-heading";
import { IconBadge, MatchSummaryCard } from "@/components/match/match-summary-card";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { Match } from "@/lib/types";
import { cn } from "@/lib/utils";

const MAX_DOTS = 6;

export function UpcomingMatches({ matches }: { matches: Match[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
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
      <SectionHeading
        trailing={
          many ? (
            <span className="text-xs text-muted-foreground" aria-live="polite">
              {current + 1} de {matches.length}
            </span>
          ) : null
        }
      >
        {many ? "Tus próximos partidos" : "Tu próximo partido"}
      </SectionHeading>

      <Carousel setApi={setApi} opts={{ align: "start" }} className="w-full">
        <CarouselContent>
          {matches.map((match) => (
            <CarouselItem key={match.code} className={cn(many && "basis-[88%] md:basis-1/2")}>
              <UpcomingMatchCard match={match} />
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

    </section>
  );
}

function UpcomingMatchCard({ match }: { match: Match }) {
  return (
    <MatchSummaryCard
      match={match}
      badges={[
        <IconBadge key="court" icon={LandPlotIcon}>Cancha {match.courtNumber}</IconBadge>,
        <IconBadge key="spots" icon={UsersIcon}>{match.spotsLeft > 0 ? `Faltan ${match.spotsLeft}` : "Completo"}</IconBadge>,
      ]}
    />
  );
}

function Dots({ count, current, onSelect }: { count: number; current: number; onSelect: (index: number) => void }) {
  return (
    <div className="-mt-3 flex justify-center">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Ir al partido ${i + 1}`}
          aria-current={i === current}
          onClick={() => onSelect(i)}
          className="flex h-8 w-6 items-center justify-center"
        >
          <span
            className={cn(
              "h-2 rounded-full transition-all",
              i === current ? "w-5 bg-brand-teal dark:bg-brand-lime" : "w-2 bg-muted-foreground/30",
            )}
          />
        </button>
      ))}
    </div>
  );
}
