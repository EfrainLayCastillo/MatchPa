"use client";

import { useState } from "react";
import { BranchPicker } from "@/components/branch/branch-picker";
import { SuggestBranchDialog } from "@/components/branch/suggest-branch-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FieldError } from "@/components/ui/field";
import { api } from "@/lib/api";
import { notifyError } from "@/lib/notify";
import { InfoIcon } from "lucide-react";
import { earliestSlotToday, formatClock12, formatDay, halfHourTimes, todayKey } from "@/lib/panamaFormatDate";
import type { Availability, Branch } from "@/lib/types";

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
  const initialFrom = laterOf(current?.fromTime?.slice(0, 5) ?? "18:00", earliest ?? "23:30");
  const [fromTime, setFromTime] = useState(initialFrom);
  const [toTime, setToTime] = useState(laterOf(current?.toTime?.slice(0, 5) ?? "21:00", endAfter(initialFrom)));
  const [hasWindow, setHasWindow] = useState(current?.fromTime != null && !noSlotsLeft);
  const fromOptions = earliest ? halfHourTimes(fromTime).filter((t) => t >= earliest) : [];

  function toggleWindow(on: boolean) {
    setHasWindow(on);
    if (on && earliest && fromTime < earliest) changeFrom(earliest);
  }

  function changeFrom(next: string) {
    setFromTime(next);
    if (toTime <= next) setToTime(endAfter(next));
  }
  const [branchId, setBranchId] = useState(current?.branchId.toString() ?? "");
  const [branchError, setBranchError] = useState<string | null>(null);
  const [suggestQuery, setSuggestQuery] = useState<string | null>(null);
  const [toError, setToError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!branchId) return setBranchError("Elige la sucursal donde quieres jugar");
    if (hasWindow && toTime <= fromTime) return setToError("La hora de fin debe ser después de la de inicio");
    setBusy(true);
    setToError(null);
    try {
      await api.setAvailability(dateKey, {
        fromTime: hasWindow ? fromTime : null,
        toTime: hasWindow ? toTime : null,
        branchId: Number(branchId),
      });
      onSaved();
      onOpenChange(false);
    } catch (err) {
      notifyError(err, "No se pudo guardar");
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

      <div className="flex min-h-11 items-center gap-3">
        <Checkbox
          id="has-window"
          checked={hasWindow}
          onCheckedChange={(checked) => toggleWindow(checked === true)}
          disabled={noSlotsLeft}
          className="size-5"
        />
        <Label htmlFor="has-window" className="min-h-11 flex-1 items-center">
          Tengo horario
        </Label>
      </div>

      {hasWindow ? (
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
          <Select value={toTime} onValueChange={(next) => { setToTime(next); setToError(null); }}>
            <SelectTrigger id="to" className="w-full" aria-label="Hasta" aria-invalid={toError ? true : undefined} aria-describedby={toError ? "to-error" : undefined}>
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
          <FieldError id="to-error">{toError}</FieldError>
        </div>
      </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="branch">Sucursal</Label>
        <BranchPicker
          id="branch"
          branches={branches}
          value={branchId}
          onChange={(value) => { setBranchId(value); setBranchError(null); }}
          onSuggest={setSuggestQuery}
          aria-invalid={branchError ? true : undefined}
          aria-describedby={branchError ? "branch-error" : undefined}
        />
        <FieldError id="branch-error">{branchError}</FieldError>
      </div>
      <SuggestBranchDialog
        open={suggestQuery !== null}
        onOpenChange={(open) => !open && setSuggestQuery(null)}
        initialName={suggestQuery ?? ""}
      />

      {noSlotsLeft ? (
        <Alert variant="info">
          <InfoIcon />
          <AlertDescription>Por hoy ya no puede haber disponibilidad. Elige otro día.</AlertDescription>
        </Alert>
      ) : null}

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
