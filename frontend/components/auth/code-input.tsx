"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";

export const CODE_LENGTH = 6;

export function useCountdown(seconds: number) {
  const [secondsLeft, setSecondsLeft] = useState(seconds);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  return { secondsLeft, restart: () => setSecondsLeft(seconds) };
}

type CodeFieldProps = {
  value: string;
  onChange: (digits: string) => void;
  error?: string | null;
  autoFocus?: boolean;
};

export function CodeField({ value, onChange, error, autoFocus = true }: CodeFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="code">Código</Label>
      <Input
        id="code"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={CODE_LENGTH}
        pattern="\d{6}"
        placeholder="123456"
        className="h-14 text-center font-heading text-2xl tracking-[0.4em]"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "code-error" : undefined}
        autoFocus={autoFocus}
        required
      />
    </div>
  );
}

export function apiErrorMessage(err: unknown, rateLimited: string): string {
  if (!(err instanceof ApiError)) return "No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.";
  if (err.status === 429) return rateLimited;
  if (err.status >= 500) return "Algo salió mal en nuestro lado. Intenta de nuevo en un momento.";
  return err.message;
}
