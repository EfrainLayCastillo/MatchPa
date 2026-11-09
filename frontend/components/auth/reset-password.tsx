"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CODE_LENGTH, CodeField, apiErrorMessage, useCountdown } from "@/components/auth/code-input";
import { PageTitle } from "@/components/matchpa/page-title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { isProfileComplete, useSession } from "@/lib/session";
import { FormAlert } from "@/components/matchpa/form-alert";

const RESEND_COOLDOWN_SECONDS = 60;
const RATE_LIMITED = "Ya pediste varios códigos. Intenta más tarde.";
const linkClass = "font-semibold text-brand-teal underline-offset-4 hover:underline disabled:no-underline disabled:opacity-60 dark:text-brand-lime";

export function ResetPassword() {
  const [email, setEmail] = useState(useSearchParams().get("email") ?? "");
  const [codeSent, setCodeSent] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-10">
      {codeSent ? (
        <NewPasswordStep email={email} onChangeEmail={() => setCodeSent(false)} />
      ) : (
        <EmailStep email={email} onEmailChange={setEmail} onSent={() => setCodeSent(true)} />
      )}
    </div>
  );
}

type EmailStepProps = { email: string; onEmailChange: (email: string) => void; onSent: () => void };

function EmailStep({ email, onEmailChange, onSent }: EmailStepProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.forgotPassword(email);
      onSent();
    } catch (err) {
      setError(apiErrorMessage(err, RATE_LIMITED));
      setBusy(false);
    }
  }

  return (
    <>
      <PageTitle hint="Escribe tu correo y te enviamos un código de 6 dígitos para crear una contraseña nueva.">
        Recuperar contraseña
      </PageTitle>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Correo</Label>
          <Input id="email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => onEmailChange(e.target.value)} required />
        </div>
        <FormAlert message={error} />
        <Button type="submit" size="lg" className="h-12 w-full text-base font-bold" disabled={busy}>
          {busy ? "Enviando…" : "Enviar código"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className={linkClass}>Volver a entrar</Link>
      </p>
    </>
  );
}

function NewPasswordStep({ email, onChangeEmail }: { email: string; onChangeEmail: () => void }) {
  const router = useRouter();
  const { setUser } = useSession();
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>("Si hay una cuenta con ese correo, te enviamos un código.");
  const { secondsLeft, restart } = useCountdown(RESEND_COOLDOWN_SECONDS);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const user = await api.resetPassword({ email, code, password });
      setUser(user);
      router.replace(isProfileComplete(user) ? "/lobby" : "/onboarding");
    } catch (err) {
      setError(apiErrorMessage(err, "Demasiados intentos. Espera un minuto y vuelve a intentar."));
      setBusy(false);
    }
  }

  async function resend() {
    if (resending || secondsLeft > 0) return;
    setResending(true);
    setError(null);
    try {
      await api.forgotPassword(email);
      setCode("");
      setNotice("Te enviamos un código nuevo");
      restart();
    } catch (err) {
      setError(apiErrorMessage(err, RATE_LIMITED));
    }
    setResending(false);
  }

  return (
    <>
      <PageTitle hint={`Escribe el código que enviamos a ${email} y elige tu contraseña nueva.`}>Revisa tu correo</PageTitle>
      <form onSubmit={submit} className="space-y-4">
        <CodeField value={code} onChange={setCode} error={error} />
        <div className="space-y-1.5">
          <Label htmlFor="password">Contraseña nueva</Label>
          <Input id="password" type="password" autoComplete="new-password" minLength={8} maxLength={72} value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <FormAlert id="code-error" message={error} />
        {notice ? <p role="status" className="text-sm text-brand-teal dark:text-brand-lime">{notice}</p> : null}
        <Button type="submit" size="lg" className="h-12 w-full text-base font-bold" disabled={busy || code.length < CODE_LENGTH || password.length < 8}>
          {busy ? "Cambiando…" : "Cambiar contraseña"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        ¿No te llegó?{" "}
        <button type="button" onClick={resend} disabled={resending || secondsLeft > 0} className={linkClass}>
          {secondsLeft > 0 ? `Reenviar código (${secondsLeft} s)` : "Reenviar código"}
        </button>
      </p>
      <p className="text-center text-sm">
        <button type="button" onClick={onChangeEmail} className={linkClass}>Usar otro correo</button>
      </p>
    </>
  );
}
