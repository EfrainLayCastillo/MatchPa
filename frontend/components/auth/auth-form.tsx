"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, API_BASE, ApiError, USING_MOCKS } from "@/lib/api";
import { safeNextPath } from "@/lib/next-path";
import { isProfileComplete, useSession } from "@/lib/session";

type Mode = "login" | "register";

const COPY = {
  login: {
    title: "Entrar",
    submit: "Entrar",
    switchText: "¿Aún no tienes cuenta?",
    switchLink: "/registro",
    switchLabel: "Regístrate",
  },
  register: {
    title: "Crear cuenta",
    submit: "Crear cuenta",
    switchText: "¿Ya tienes cuenta?",
    switchLink: "/login",
    switchLabel: "Entra",
  },
} satisfies Record<Mode, Record<string, string>>;

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const { setUser } = useSession();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(() => accountErrorMessage(params.get("error")));
  const [busy, setBusy] = useState(false);
  const copy = COPY[mode];
  const next = safeNextPath(params.get("next"));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const user =
        mode === "login"
          ? await api.login({ email, password })
          : await api.register({ fullName, email, password });
      setUser(user);
      router.replace(isProfileComplete(user) ? next : "/onboarding");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-10">
      <h1 className="font-heading text-3xl font-extrabold">{copy.title}</h1>

      {USING_MOCKS ? null : (
        <Button asChild variant="outline" size="lg" className="h-12 w-full">
          <a href={`${API_BASE}/auth/google/redirect?next=${encodeURIComponent(next)}`}>Continuar con Google</a>
        </Button>
      )}

      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
        <span className="h-px flex-1 bg-border" />o<span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={submit} className="space-y-4">
        {mode === "register" ? (
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Nombre completo</Label>
            <Input id="fullName" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
        ) : null}
        <div className="space-y-1.5">
          <Label htmlFor="email">Correo</Label>
          <Input id="email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={mode === "register" ? 8 : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}

        <Button type="submit" size="lg" className="h-12 w-full text-base font-bold" disabled={busy}>
          {busy ? "Un momento…" : copy.submit}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {copy.switchText}{" "}
        <Link href={`${copy.switchLink}${next === "/lobby" ? "" : `?next=${encodeURIComponent(next)}`}`} className="font-semibold text-brand-teal underline-offset-4 hover:underline dark:text-brand-lime">
          {copy.switchLabel}
        </Link>
      </p>
    </div>
  );
}

/** Friendly text for auth failures. Server details (SQL, stack traces) never reach the screen. */
function authErrorMessage(err: unknown): string {
  if (!(err instanceof ApiError)) return "No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.";
  if (err.status === 429) return "Demasiados intentos. Espera un minuto y vuelve a intentar.";
  if (err.status >= 500) return "Algo salió mal en nuestro lado. Intenta de nuevo en un momento.";
  return err.message;
}

function accountErrorMessage(code: string | null): string | null {
  if (code === "email_registrado") return "Ya tienes una cuenta con ese correo. Entra con tu contraseña.";
  return null;
}
