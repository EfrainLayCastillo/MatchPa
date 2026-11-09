"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, ApiError } from "@/lib/api";
import { useSession } from "@/lib/session";
import { FormAlert } from "@/components/matchpa/form-alert";

interface VerifiedActionValue {
  guard: (fn: () => unknown) => Promise<void>;
  handleError: (err: unknown) => boolean;
  prompt: () => void;
}

const VerifiedActionContext = createContext<VerifiedActionValue | null>(null);

function isEmailNotVerified(err: unknown): boolean {
  return err instanceof ApiError && err.code === "EMAIL_NOT_VERIFIED";
}

export function VerifiedActionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const [open, setOpen] = useState(false);

  const handleError = useCallback((err: unknown) => {
    if (!isEmailNotVerified(err)) return false;
    setOpen(true);
    return true;
  }, []);

  const guard = useCallback<VerifiedActionValue["guard"]>(
    async (fn) => {
      if (user?.emailVerified === false) return setOpen(true);
      await fn();
    },
    [user?.emailVerified],
  );

  const prompt = useCallback(() => setOpen(true), []);
  const value = useMemo(() => ({ guard, handleError, prompt }), [guard, handleError, prompt]);
  return (
    <VerifiedActionContext.Provider value={value}>
      {children}
      <VerifyEmailDialog open={open} onOpenChange={setOpen} email={user?.email} />
    </VerifiedActionContext.Provider>
  );
}

export function useVerifiedAction(): VerifiedActionValue {
  const value = useContext(VerifiedActionContext);
  if (!value) throw new Error("useVerifiedAction must be used inside VerifiedActionProvider");
  return value;
}

interface VerifyEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email?: string;
}

export function VerifyEmailDialog({ open, onOpenChange, email }: VerifyEmailDialogProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function sendCode() {
    setBusy(true);
    setFailed(false);
    try {
      await api.resendEmailCode();
    } catch (err) {
      if (!(err instanceof ApiError && err.status === 429)) {
        setBusy(false);
        setFailed(true);
        return;
      }
    }
    const current = `${window.location.pathname}${window.location.search}`;
    router.push(`/verificar?next=${encodeURIComponent(current)}`);
    setBusy(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verifica tu correo para continuar</DialogTitle>
          <DialogDescription>Te enviaremos un código a {email}</DialogDescription>
        </DialogHeader>
        <FormAlert message={failed ? "No pudimos enviar el código. Intenta de nuevo." : null} />
        <DialogFooter>
          <Button className="h-11" onClick={sendCode} disabled={busy}>
            {busy ? "Enviando…" : "Enviar código"}
          </Button>
          <Button variant="outline" className="h-11" onClick={() => onOpenChange(false)}>
            Ahora no
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
