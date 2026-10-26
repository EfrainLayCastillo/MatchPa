"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { dismissPushPrompt, enablePush, isIosWithoutInstall } from "@/lib/push";

interface PushPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The moment that triggered the prompt, e.g. "Te avisamos cuando alguien pida unirse". */
  reason: string;
}

export function PushPrompt({ open, onOpenChange, reason }: PushPromptProps) {
  const [status, setStatus] = useState<"idle" | "busy" | "done">("idle");
  const iosNeedsInstall = typeof window !== "undefined" && isIosWithoutInstall();

  function close() {
    dismissPushPrompt();
    onOpenChange(false);
  }

  async function accept() {
    setStatus("busy");
    await enablePush().catch(() => "denied" as const);
    setStatus("done");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Te avisamos?</DialogTitle>
          <DialogDescription>{reason}</DialogDescription>
        </DialogHeader>
        {iosNeedsInstall ? (
          <p className="text-sm text-muted-foreground">
            En iPhone primero agrega MatchPa a tu pantalla de inicio: toca <strong>Compartir</strong> y luego{" "}
            <strong>Agregar a inicio</strong>.
          </p>
        ) : null}
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={close} disabled={status === "busy"}>
            Ahora no
          </Button>
          {iosNeedsInstall ? null : (
            <Button onClick={accept} disabled={status === "busy"}>
              Sí, avísame
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
