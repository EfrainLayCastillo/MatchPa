"use client";

import { LandPlotIcon } from "lucide-react";
import { useState } from "react";
import { useVerifiedAction } from "@/components/auth/verify-email-dialog";
import { FormAlert } from "@/components/matchpa/form-alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { track } from "@/lib/analytics";
import { api } from "@/lib/api";
import { refreshMatchPage } from "@/app/partidos/[code]/actions";
import { invalidProps, toFormErrors, useFormErrors } from "@/lib/form-errors";
import { cn } from "@/lib/utils";
import type { Match } from "@/lib/types";
import { BranchDetails } from "./branch-contact";

export function BookingBanner({ match, onBooked }: { match: Match; onBooked: () => void }) {
  const [open, setOpen] = useState(false);
  const urgent = match.status === "full";

  return (
    <section
      aria-label="Reserva de la cancha"
      className={cn(
        "space-y-3 rounded-xl p-4",
        urgent ? "bg-brand-lime text-brand-teal" : "bg-muted",
      )}
    >
      <div className="flex items-start gap-3">
        <LandPlotIcon aria-hidden className="mt-0.5 size-5 shrink-0" />
        <div className="space-y-1">
          <p className="font-heading text-base font-bold leading-tight">
            {headline(match)}
          </p>
          <p className="text-sm">
            {urgent
              ? "Cuando la tengas, dinos el número para avisarle a los jugadores."
              : "Cuando tengas el número de cancha, confírmalo aquí y avisamos a los jugadores."}
          </p>
        </div>
      </div>
      {urgent ? <BranchDetails branch={match.branch} /> : null}
      <Button
        variant={urgent ? "default" : "outline"}
        className="h-11 w-full font-semibold"
        onClick={() => setOpen(true)}
      >
        Ya reservé
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <BookingForm
            match={match}
            onClose={() => setOpen(false)}
            onBooked={() => {
              setOpen(false);
              onBooked();
            }}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
}

function headline(match: Match): string {
  if (match.status === "full") return `¡Match! Ahora reserva la cancha en ${match.branch.name}`;
  return "Reserva la cancha cuando se complete";
}

function BookingForm({
  match,
  onClose,
  onBooked,
}: {
  match: Match;
  onClose: () => void;
  onBooked: () => void;
}) {
  const { handleError } = useVerifiedAction();
  const [courtNumber, setCourtNumber] = useState("");
  const [busy, setBusy] = useState(false);
  const { errors, formRef, fail, reset, clearField } = useFormErrors();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!courtNumber) return fail({ fields: { courtNumber: "Indica el número de cancha" }, form: null });
    setBusy(true);
    reset();
    try {
      await api.confirmBooking(match.code, Number(courtNumber));
      track("confirm_booking", { branch: match.branch.slug, match_status: match.status });
      await refreshMatchPage(match.code).catch(() => {});
      onBooked();
    } catch (err) {
      if (handleError(err)) return;
      fail(toFormErrors(err, "No se pudo confirmar la cancha"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Confirmar cancha</DialogTitle>
        <DialogDescription>Dinos qué cancha reservaste en {match.branch.name}.</DialogDescription>
      </DialogHeader>
      <form ref={formRef} onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="booking-court">Cancha</Label>
          <Input
            id="booking-court"
            className="h-11"
            type="number"
            inputMode="numeric"
            min={1}
            max={50}
            placeholder="Ej. 3"
            value={courtNumber}
            onChange={(e) => {
              setCourtNumber(e.target.value);
              clearField("courtNumber");
            }}
            required
            {...invalidProps("booking-court", errors.fields.courtNumber)}
          />
          <FieldError id="booking-court-error">{errors.fields.courtNumber}</FieldError>
        </div>
        <FormAlert message={errors.form} />
        <DialogFooter>
          <Button type="submit" className="h-11" disabled={busy}>
            {busy ? "Confirmando…" : "Confirmar cancha"}
          </Button>
          <Button type="button" variant="outline" className="h-11" onClick={onClose}>
            Cancelar
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
