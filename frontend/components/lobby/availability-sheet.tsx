"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { api, ApiError } from "@/lib/api";
import { earliestSlotToday, formatClock12, formatDay, halfHourTimes, todayKey } from "@/lib/panamaFormatDate";
import type { Availability, Branch } from "@/lib/types";

const ANY_BRANCH = "any";

interface AvailabilitySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateKey: string;
  current: Availability | null;
  branches: Branch[];
  onSaved: () => void;
}

export function AvailabilitySheet(props: AvailabilitySheetProps) {
  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl px-5 pb-6">
        {props.open ? <AvailabilityForm {...props} /> : null}
      </SheetContent>
    </Sheet>
  );
}

function AvailabilityForm({ dateKey, current, branches, onOpenChange, onSaved }: AvailabilitySheetProps) {
  // Today, nothing before the next half hour is bookable.
  const earliest = dateKey === todayKey() ? earliestSlotToday() : "00:00";
  const noSlotsLeft = earliest === null;
  const initialFrom = laterOf(current?.fromTime.slice(0, 5) ?? "18:00", earliest ?? "23:30");
  const [fromTime, setFromTime] = useState(initialFrom);
  const [toTime, setToTime] = useState(laterOf(current?.toTime.slice(0, 5) ?? "21:00", endAfter(initialFrom)));
  const fromOptions = earliest ? halfHourTimes(fromTime).filter((t) => t >= earliest) : [];

  function changeFrom(next: string) {
    setFromTime(next);
    if (toTime <= next) setToTime(endAfter(next));
  }
  const [branchId, setBranchId] = useState(current?.branchId?.toString() ?? ANY_BRANCH);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (toTime <= fromTime) return setError("La hora de fin debe ser después de la de inicio");
    setBusy(true);
    setError(null);
    try {
      await api.setAvailability(dateKey, {
        fromTime,
        toTime,
        branchId: branchId === ANY_BRANCH ? null : Number(branchId),
      });
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar");
    } finally {
      setBusy(false);
    }
  }

  async function leave() {
    setBusy(true);
    await api.removeAvailability(dateKey).catch(() => {});
    setBusy(false);
    onSaved();
    onOpenChange(false);
  }

  return (
    <>
      <SheetHeader className="text-left">
        <SheetTitle>Estoy disponible · {formatDay(dateKey)}</SheetTitle>
        <SheetDescription>Aparecerás en el pool de jugadores para ese día.</SheetDescription>
      </SheetHeader>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="from">Desde</Label>
          <Select value={fromTime} onValueChange={changeFrom}>
            <SelectTrigger id="from" className="w-full" aria-label="Desde">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {fromOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {formatClock12(option)}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="to">Hasta</Label>
          <Select value={toTime} onValueChange={setToTime}>
            <SelectTrigger id="to" className="w-full" aria-label="Hasta">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {endTimes(toTime).filter((t) => t > fromTime).map((option) => (
                  <SelectItem key={option} value={option}>
                    {formatClock12(option)}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="branch">Sucursal (opcional)</Label>
        <Select value={branchId} onValueChange={setBranchId}>
          <SelectTrigger id="branch" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY_BRANCH}>Cualquiera</SelectItem>
            {branches.map((branch) => (
              <SelectItem key={branch.id} value={branch.id.toString()}>
                {branch.name} · {branch.locationLabel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {noSlotsLeft ? <p role="alert" className="text-sm font-medium text-destructive">Por hoy ya no puede haber disponibilidad. Elige otro día.</p> : null}
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}

      <SheetFooter>
        {current ? (
          <Button variant="outline" onClick={leave} disabled={busy}>
            Salir del pool
          </Button>
        ) : null}
        <Button onClick={save} disabled={busy || noSlotsLeft} className="w-full sm:w-auto">
          Guardar disponibilidad
        </Button>
      </SheetFooter>
    </>
  );
}

function laterOf(a: string, b: string): string {
  return a > b ? a : b;
}

/** The first half hour after `from`, used as a default end time. */
function endAfter(from: string): string {
  return endTimes().find((t) => t > from) ?? END_OF_DAY;
}

/** End-of-day is stored as 24:00 and shown as 12:00 a. m. */
const END_OF_DAY = "24:00";

function endTimes(current?: string): string[] {
  const grid = [...halfHourTimes(), END_OF_DAY];
  if (!current || grid.includes(current)) return grid;
  return [current, ...grid].sort();
}
