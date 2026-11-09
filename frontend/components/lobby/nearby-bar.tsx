"use client";

import { LocateFixedIcon, MapPinIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Zone } from "@/lib/distance";
import type { NearbyOrigin, NearbyStatus } from "@/lib/nearby";

export type LobbySort = "distance" | "level";

interface NearbyBarProps {
  origin: NearbyOrigin | null;
  status: NearbyStatus;
  zones: Zone[];
  sort: LobbySort;
  onSortChange: (sort: LobbySort) => void;
  onLocate: () => void;
  onChooseZone: (zone: Zone) => void;
  onClear: () => void;
}

export function NearbyBar(props: NearbyBarProps) {
  return props.origin ? <NearbyActive {...props} origin={props.origin} /> : <NearbyPrompt {...props} />;
}

const STATUS_HINT: Partial<Record<NearbyStatus, string>> = {
  denied: "Tu navegador bloqueó la ubicación. Actívala en los ajustes del sitio o elige tu zona.",
  unsupported: "No pudimos obtener tu ubicación. Elige tu zona.",
};

function NearbyPrompt({ status, zones, onLocate, onChooseZone }: NearbyBarProps) {
  const blocked = status === "denied" || status === "unsupported";
  return (
    <section className="space-y-3 rounded-xl border border-brand-turquoise/40 bg-accent p-4">
      <div className="flex items-start gap-3">
        <MapPinIcon className="mt-0.5 size-5 shrink-0 text-brand-teal dark:text-brand-lime" />
        <div className="space-y-1">
          <h2 className="font-heading text-base font-bold">Ver lo más cerca de ti</h2>
          <p className="text-sm text-muted-foreground">
            {STATUS_HINT[status] ?? "Ordenamos partidos y jugadores por distancia. Tu ubicación no sale de tu teléfono."}
          </p>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {blocked ? null : (
          <Button className="h-11 font-bold" onClick={onLocate} disabled={status === "locating"}>
            <LocateFixedIcon />
            {status === "locating" ? "Buscando…" : "Usar mi ubicación"}
          </Button>
        )}
        <ZoneSelect zones={zones} onChooseZone={onChooseZone} />
      </div>
    </section>
  );
}

function NearbyActive({ origin, sort, onSortChange, onClear }: NearbyBarProps & { origin: NearbyOrigin }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground">
        <MapPinIcon className="size-4 text-brand-teal dark:text-brand-lime" />
        Cerca de {origin.zone ?? "tu ubicación"} ·
        <button type="button" onClick={onClear} className="min-h-11 font-semibold text-brand-teal underline-offset-4 hover:underline dark:text-brand-lime">
          Cambiar
        </button>
      </p>
      <ToggleGroup
        type="single"
        variant="outline"
        value={sort}
        onValueChange={(value) => value && onSortChange(value as LobbySort)}
        aria-label="Ordenar por"
      >
        <ToggleGroupItem value="distance" className="h-11 px-4 data-[state=on]:bg-brand-lime/40">
          Cercanía
        </ToggleGroupItem>
        <ToggleGroupItem value="level" className="h-11 px-4 data-[state=on]:bg-brand-lime/40">
          Nivel
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}

function ZoneSelect({ zones, onChooseZone }: Pick<NearbyBarProps, "zones" | "onChooseZone">) {
  return (
    <Select onValueChange={(label) => onChooseZone(zones.find((zone) => zone.label === label)!)}>
      <SelectTrigger className="h-11! w-full bg-card" aria-label="Elegir mi zona">
        <SelectValue placeholder="Elegir mi zona" />
      </SelectTrigger>
      <SelectContent>
        {zones.map((zone) => (
          <SelectItem key={zone.label} value={zone.label}>
            {zone.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
