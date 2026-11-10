"use client";

import Link from "next/link";
import { CircleHelpIcon, LocateFixedIcon, MapPinIcon } from "lucide-react";
import {
  InitialAvatar,
  LevelBadges,
} from "@/components/matchpa/player-identity";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Zone } from "@/lib/distance";
import type { NearbyOrigin, NearbyStatus } from "@/lib/nearby";
import type { User } from "@/lib/types";

const CURRENT_POSITION = "__current__";

interface ProfileCardProps {
  user: User;
  origin: NearbyOrigin | null;
  status: NearbyStatus;
  zones: Zone[];
  onLocate: () => void;
  onChooseZone: (zone: Zone) => void;
  locationHelp: React.ReactNode;
}

export function ProfileCard({ user, ...location }: ProfileCardProps) {
  const name = displayName(user);
  return (
    <Card className="relative flex-row items-center gap-3 px-4 has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/50">
      <InitialAvatar name={name} verified={user.emailVerified} />
      <div className="min-w-0 flex-1">
        <LocationSelect {...location} />
        <div className="flex items-center gap-1.5">
          <Link
            href="/perfil"
            className="min-w-0 truncate font-heading text-base font-bold outline-none after:absolute after:inset-0"
          >
            {name}
          </Link>
          <span className="shrink-0">
            <LevelBadges
              category={user.category}
              tier={user.categoryTier}
              gender={user.gender}
            />
          </span>
        </div>
      </div>
    </Card>
  );
}

function LocationSelect({
  origin,
  status,
  zones,
  onLocate,
  onChooseZone,
  locationHelp,
}: Omit<ProfileCardProps, "user">) {
  const value = origin ? (origin.zone ?? CURRENT_POSITION) : undefined;
  const canLocate = status !== "denied" && status !== "unsupported";

  function handleChange(next: string) {
    if (next === CURRENT_POSITION) return onLocate();
    onChooseZone(zones.find((zone) => zone.label === next)!);
  }

  const showLocate = canLocate && value !== CURRENT_POSITION;

  return (
    <div className="relative z-10 flex w-fit max-w-full min-w-0 items-center gap-2">
      <LocationOptions
        value={value}
        status={status}
        zones={zones}
        canLocate={canLocate}
        onChange={handleChange}
      />
      {showLocate ? (
        <Button
          size="xs"
          variant="ghost"
          onClick={onLocate}
          disabled={status === "locating"}
          className="relative shrink-0 font-semibold text-brand-teal after:absolute after:-inset-2.5 dark:text-brand-lime"
        >
          <LocateFixedIcon data-icon="inline-start" />
          <span className="sr-only sm:not-sr-only">
            {status === "locating" ? "Buscando…" : "Usar mi ubicación"}
          </span>
        </Button>
      ) : null}
      <LocationHelp>{locationHelp}</LocationHelp>
    </div>
  );
}

function LocationHelp({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="icon-xs"
          variant="ghost"
          aria-label="¿Para qué usamos tu ubicación?"
          className="relative shrink-0 text-muted-foreground after:absolute after:-inset-2.5"
        >
          <CircleHelpIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tu ubicación</DialogTitle>
          <DialogDescription>
            Elige cómo ordenar partidos y jugadores cerca de ti.
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

interface LocationOptionsProps {
  value: string | undefined;
  status: NearbyStatus;
  zones: Zone[];
  canLocate: boolean;
  onChange: (value: string) => void;
}

function LocationOptions({
  value,
  status,
  zones,
  canLocate,
  onChange,
}: LocationOptionsProps) {
  return (
    <Select value={value ?? ""} onValueChange={onChange}>
      <SelectTrigger
        aria-label="Tu ubicación"
        className="h-6! min-w-0 max-w-full justify-start gap-1.5 border-none bg-transparent px-0 text-sm text-muted-foreground shadow-none dark:bg-transparent"
      >
        <MapPinIcon className="size-4 shrink-0 text-brand-teal dark:text-brand-lime" />
        <SelectValue
          placeholder={
            status === "locating" ? "Buscando…" : "Elige tu ubicación"
          }
        />
      </SelectTrigger>
      <SelectContent>
        {canLocate ? (
          <>
            <SelectItem value={CURRENT_POSITION}>
              Mi ubicación actual
            </SelectItem>
            <SelectSeparator />
          </>
        ) : null}
        {zones.map((zone) => (
          <SelectItem key={zone.label} value={zone.label}>
            {zone.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function displayName(user: User): string {
  return user.fullName.trim() || user.email;
}
