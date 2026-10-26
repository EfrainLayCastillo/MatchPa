"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { api, ApiError } from "@/lib/api";
import { dayLabel } from "@/lib/format";
import type { Availability, Company } from "@/lib/types";

const ANY_COMPANY = "any";

interface AvailabilitySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateKey: string;
  current: Availability | null;
  companies: Company[];
  onSaved: () => void;
}

export function AvailabilitySheet(props: AvailabilitySheetProps) {
  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-6">
        {props.open ? <AvailabilityForm {...props} /> : null}
      </SheetContent>
    </Sheet>
  );
}

function AvailabilityForm({ dateKey, current, companies, onOpenChange, onSaved }: AvailabilitySheetProps) {
  const [fromTime, setFromTime] = useState(current?.fromTime ?? "18:00");
  const [toTime, setToTime] = useState(current?.toTime ?? "21:00");
  const [companyId, setCompanyId] = useState(current?.companyId?.toString() ?? ANY_COMPANY);
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
        companyId: companyId === ANY_COMPANY ? null : Number(companyId),
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
      <SheetHeader className="px-0 text-left">
        <SheetTitle>Estoy disponible · {dayLabel(dateKey)}</SheetTitle>
        <SheetDescription>Aparecerás en el pool de jugadores para ese día.</SheetDescription>
      </SheetHeader>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="from">Desde</Label>
          <Input id="from" type="time" value={fromTime} onChange={(e) => setFromTime(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="to">Hasta</Label>
          <Input id="to" type="time" value={toTime} onChange={(e) => setToTime(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Empresa (opcional)</Label>
        <Select value={companyId} onValueChange={setCompanyId}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY_COMPANY}>Cualquiera</SelectItem>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id.toString()}>
                {company.name} · {company.locationLabel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}

      <SheetFooter className="px-0">
        {current ? (
          <Button variant="outline" onClick={leave} disabled={busy}>
            Salir del pool
          </Button>
        ) : null}
        <Button onClick={save} disabled={busy} className="w-full sm:w-auto">
          Guardar disponibilidad
        </Button>
      </SheetFooter>
    </>
  );
}
