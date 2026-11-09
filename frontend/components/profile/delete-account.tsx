"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Copy } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { FormAlert } from "@/components/matchpa/form-alert";
import { useSession } from "@/lib/session";

const CONFIRM_WORD = "ELIMINAR";

const EFFECTS = [
  "Se borran tu nombre, correo, WhatsApp y disponibilidad.",
  "Los partidos futuros que organizas se cancelan.",
  "Sales de los partidos en los que estás.",
  "Los partidos pasados quedan como \"Jugador eliminado\".",
  "No se puede deshacer.",
];

export function DeleteAccount() {
  const { setUser } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    if (busy) return;
    setOpen(next);
    setText("");
    setError(null);
  }

  async function confirmDeletion() {
    setBusy(true);
    setError(null);
    try {
      await api.deleteAccount(text);
    } catch (err) {
      setBusy(false);
      setError(deleteErrorMessage(err));
      return;
    }
    setUser(null);
    queryClient.clear();
    router.replace("/");
  }

  return (
    <section className="space-y-3 border-t pt-8">
      <h2 className="font-heading text-lg font-bold">Eliminar cuenta</h2>
      <p className="text-sm text-muted-foreground">
        Borra tus datos personales y te saca de tus partidos. No se puede deshacer.
      </p>
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="h-11 w-full">
            Eliminar cuenta
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tu cuenta?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <ul className="list-disc space-y-1 pl-4 text-left">
                {EFFECTS.map((effect) => (
                  <li key={effect}>{effect}</li>
                ))}
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Label htmlFor="delete-confirm">Escribe para confirmar</Label>
              <CopyableWord word={CONFIRM_WORD} />
            </div>
            <Input
              id="delete-confirm"
              className="h-11"
              autoComplete="off"
              autoCapitalize="characters"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={busy}
            />
            <FormAlert message={error} />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11" disabled={busy}>
              Cancelar
            </AlertDialogCancel>
            <Button
              variant="destructive"
              className="h-11"
              onClick={confirmDeletion}
              disabled={busy || text !== CONFIRM_WORD}
            >
              {busy ? "Eliminando…" : "Eliminar cuenta"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function deleteErrorMessage(err: unknown): string {
  if (err instanceof ApiError && err.status === 401) return "Tu sesión expiró. Vuelve a entrar e inténtalo de nuevo.";
  if (err instanceof ApiError && err.status < 500) return err.message;
  return "No pudimos eliminar tu cuenta. Intenta de nuevo.";
}

function CopyableWord({ word }: { word: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(word).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <span className="inline-flex items-center rounded-md border bg-muted pl-3 font-mono text-sm font-bold tracking-wide">
      {word}
      <Button type="button" variant="ghost" size="icon" className="size-11" onClick={copy} aria-label={`Copiar ${word}`}>
        {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
      </Button>
    </span>
  );
}
