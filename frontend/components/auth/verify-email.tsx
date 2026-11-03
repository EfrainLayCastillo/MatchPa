"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageTitle } from "@/components/matchpa/page-title";
import { SessionGate } from "@/components/matchpa/session-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/lib/api";
import { safeNextPath } from "@/lib/next-path";
import { useSession } from "@/lib/session";

const CODE_LENGTH = 6;

export function VerifyEmail() {
  return (
    <SessionGate requireProfile={false}>
      <VerifyEmailForm />
    </SessionGate>
  );
}

function VerifyEmailForm() {
  const router = useRouter();
  const next = safeNextPath(useSearchParams().get("next"));
  const { user, setUser } = useSession();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const alreadyVerified = user?.emailVerified === true && !busy;

  useEffect(() => {
    if (alreadyVerified) router.replace(next);
  }, [alreadyVerified, next, router]);

  async function verify(value: string) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      setUser(await api.verifyEmail(value));
      router.replace(next);
    } catch (err) {
      setError(verifyErrorMessage(err));
      setBusy(false);
    }
  }

  function change(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(digits);
    if (digits.length === CODE_LENGTH) void verify(digits);
  }

  if (alreadyVerified) return null;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-10">
      <PageTitle hint={`Te enviamos un código de 6 dígitos a ${user?.email}. Escríbelo aquí para confirmar tu cuenta.`}>
        Revisa tu correo
      </PageTitle>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void verify(code);
        }}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <Label htmlFor="code">Código</Label>
          <Input
            id="code"
            value={code}
            onChange={(e) => change(e.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={CODE_LENGTH}
            pattern="\d{6}"
            placeholder="123456"
            className="h-14 text-center font-heading text-2xl tracking-[0.4em]"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "code-error" : undefined}
            autoFocus
            required
          />
        </div>

        {error ? <p id="code-error" role="alert" className="text-sm text-destructive">{error}</p> : null}

        <Button type="submit" size="lg" className="h-12 w-full text-base font-bold" disabled={busy || code.length < CODE_LENGTH}>
          {busy ? "Verificando…" : "Verificar"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href={next} className="font-semibold text-brand-teal underline-offset-4 hover:underline dark:text-brand-lime">
          Hacerlo después
        </Link>
      </p>
    </div>
  );
}

function verifyErrorMessage(err: unknown): string {
  if (!(err instanceof ApiError)) return "No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.";
  if (err.status === 429) return "Demasiados intentos. Espera un minuto y vuelve a intentar.";
  if (err.status >= 500) return "Algo salió mal en nuestro lado. Intenta de nuevo en un momento.";
  return err.message;
}
