"use client";

import { useVerifiedAction } from "@/components/auth/verify-email-dialog";
import { useSession } from "@/lib/session";

export function VerifyEmailBanner() {
  const { user } = useSession();
  const { prompt } = useVerifiedAction();
  if (user?.emailVerified !== false) return null;

  return (
    <div role="status" className="bg-brand-lime text-brand-teal">
      <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3 px-4 py-1 text-sm">
        <p>Verifica tu correo para publicar y unirte a partidos.</p>
        <button
          type="button"
          onClick={prompt}
          className="min-h-11 shrink-0 px-1 font-bold underline underline-offset-4"
        >
          Verificar
        </button>
      </div>
    </div>
  );
}
