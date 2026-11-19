"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { readoutOf } from "./model";
import { ServeFigure } from "./serve-figure";
import { StandsFigure } from "./stands-figure";

export type CourtStateVariant = "waking" | "failed" | "empty" | "noMatches" | "signedOut";

interface Copy {
  title: string;
  body: string;
  role: "status" | "alert";
  retry?: string;
  figure: "serve" | "stands";
  link?: { label: string; href: string };
}

const STANDS_READOUT = "Buscando Pa's…";

const VARIANTS: Record<CourtStateVariant, Copy> = {
  waking: {
    title: "El servidor está calentando",
    body: "Se estaba echando una siesta. En unos segundos sale a la cancha.",
    retry: "Sacar ya",
    role: "status",
    figure: "serve",
  },
  failed: {
    title: "El servidor está esperando el saque",
    body: "Ni la vio pasar, el servidor sigue medio dormido. Dale otro saque, Pa.",
    role: "alert",
    figure: "serve",
  },
  empty: {
    title: "Las gradas siguen vacías",
    body: "Nadie está disponible para este día todavía. La primera butaca es tuya.",
    role: "status",
    figure: "stands",
  },
  noMatches: {
    title: "La cancha está sola",
    body: "No hay partidos buscando pala para este día. Publica uno y llena las gradas.",
    role: "status",
    figure: "stands",
  },
  signedOut: {
    title: "Las gradas te esperan",
    body: "Entra para ver quién está disponible para jugar.",
    role: "status",
    figure: "stands",
    link: { label: "Entrar", href: "/login" },
  },
};

interface CourtStateProps {
  variant: CourtStateVariant;
  onRetry?: () => Promise<unknown>;
}

export function CourtState({ variant, onRetry }: CourtStateProps) {
  const copy = VARIANTS[variant];
  const [readout, setReadout] = useState(readoutOf(0));
  const [retrying, setRetrying] = useState(false);
  const [serves, setServes] = useState(0);

  async function retry() {
    if (!onRetry) return;
    setRetrying(true);
    setServes((count) => count + 1);
    await onRetry().finally(() => setRetrying(false));
  }

  return (
    <div
      role={copy.role}
      className="court-state mx-auto flex w-full max-w-3xl flex-col items-center gap-4 rounded-xl border border-border bg-card px-4 py-6 text-center sm:flex-row sm:gap-8 sm:px-8 sm:py-8 sm:text-left"
    >
      <div className="w-full max-w-[300px] shrink-0 sm:w-1/2 sm:max-w-[360px] lg:max-w-[420px]">
        {copy.figure === "serve" ? (
          <ServeFigure serves={serves} waiting={retrying} onReadout={setReadout} />
        ) : (
          <StandsFigure />
        )}
        <p
          className="mt-1 text-center font-mono text-[11px] tabular-nums text-muted-foreground"
          aria-hidden
        >
          {copy.figure === "serve" ? readout : STANDS_READOUT}
        </p>
      </div>
      <div className="flex flex-col items-center gap-2 sm:flex-1 sm:items-start">
        <p className="font-heading text-lg font-semibold text-balance text-foreground sm:text-xl lg:text-2xl">
          {copy.title}
        </p>
        <p className="text-sm text-pretty text-muted-foreground lg:text-base">
          {copy.body}
        </p>
        {onRetry ? (
          <Button
            variant="outline"
            className="mt-2 h-11 w-full sm:w-auto"
            onClick={retry}
            disabled={retrying}
          >
            {retrying ? "Sacando…" : (copy.retry ?? "Sacar otra vez")}
          </Button>
        ) : null}
        {copy.link ? (
          <Button asChild className="mt-2 h-11 w-full sm:w-auto">
            <Link href={copy.link.href}>{copy.link.label}</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
