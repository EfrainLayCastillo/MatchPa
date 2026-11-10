"use client";

import { SlidersHorizontalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type LobbySort = "distance" | "level";

interface SortMenuProps {
  sort: LobbySort;
  onSortChange: (sort: LobbySort) => void;
  distanceAvailable: boolean;
}

export function SortMenu({ sort, onSortChange, distanceAvailable }: SortMenuProps) {
  const effective = distanceAvailable ? sort : "level";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-11 shrink-0 bg-card font-semibold">
          <SlidersHorizontalIcon data-icon="inline-start" />
          Filtros
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={effective} onValueChange={(value) => onSortChange(value as LobbySort)}>
          <DropdownMenuRadioItem value="distance" disabled={!distanceAvailable} className="min-h-11">
            <span className="flex flex-col">
              Cercanía
              {distanceAvailable ? null : (
                <span className="text-xs text-muted-foreground">Activa tu ubicación para usarlo</span>
              )}
            </span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="level" className="min-h-11">
            Nivel
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
