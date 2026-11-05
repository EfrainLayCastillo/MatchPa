"use client";

import { useState } from "react";
import { useVerifiedAction } from "@/components/auth/verify-email-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/lib/api";

interface SuggestBranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialName?: string;
}

export function SuggestBranchDialog({ open, onOpenChange, initialName = "" }: SuggestBranchDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <SuggestForm initialName={initialName} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function SuggestForm({ initialName, onClose }: { initialName: string; onClose: () => void }) {
  const { handleError } = useVerifiedAction();
  const [name, setName] = useState(initialName);
  const [locationLabel, setLocationLabel] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    event.stopPropagation();
    setBusy(true);
    setError("");
    try {
      await api.suggestBranch({
        name: name.trim(),
        locationLabel: locationLabel.trim(),
        ...(mapsUrl.trim() ? { mapsUrl: mapsUrl.trim() } : {}),
      });
      setSent(true);
    } catch (err) {
      if (handleError(err)) return;
      if (err instanceof ApiError && err.status === 409) setError("Ya tienes una sugerencia en revisión.");
      else if (err instanceof ApiError && err.status === 429) setError("Vas muy rápido. Intenta de nuevo en un rato.");
      else setError(err instanceof ApiError ? err.message : "No se pudo enviar la sugerencia");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
        <DialogHeader>
          <DialogTitle>Sugerir sucursal</DialogTitle>
          <DialogDescription>
            {sent ? "Gracias, la revisamos. Te avisamos cuando esté." : "Cuéntanos dónde juegas y la sumamos."}
          </DialogDescription>
        </DialogHeader>
        {sent ? (
          <DialogFooter>
            <Button className="h-11" onClick={() => onClose()}>Listo</Button>
          </DialogFooter>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="suggest-name">Nombre</Label>
              <Input id="suggest-name" className="h-11" value={name} onChange={(e) => setName(e.target.value)} minLength={2} maxLength={80} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="suggest-zone">Zona</Label>
              <Input id="suggest-zone" className="h-11" placeholder="Ej. Costa del Este" value={locationLabel} onChange={(e) => setLocationLabel(e.target.value)} minLength={2} maxLength={80} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="suggest-maps">Enlace de Google Maps (opcional)</Label>
              <Input id="suggest-maps" className="h-11" type="url" inputMode="url" placeholder="https://maps.app.goo.gl/…" value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} maxLength={500} />
            </div>
            {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
            <DialogFooter>
              <Button type="submit" className="h-11" disabled={busy}>{busy ? "Enviando…" : "Enviar sugerencia"}</Button>
              <Button type="button" variant="outline" className="h-11" onClick={() => onClose()}>Cancelar</Button>
            </DialogFooter>
          </form>
        )}
    </>
  );
}
