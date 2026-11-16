"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FormAlert } from "@/components/matchpa/form-alert";
import { Button } from "@/components/ui/button";
import { LegalLink } from "@/components/legal/legal-link";
import { api, ApiError } from "@/lib/api";
import { PRIVACY_EMAIL } from "@/lib/legal";
import { useSession } from "@/lib/session";
import { forgetPushOnLogout } from "@/lib/push";

export function TermsDialog() {
  const { setUser } = useSession();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    setBusy(true);
    setError(null);
    try {
      setUser(await api.acceptTerms());
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setUser(null);
        return;
      }
      setError("No pudimos guardar tu aceptación. Intenta de nuevo.");
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    await forgetPushOnLogout();
    await api.logout().catch(() => {});
    setUser(null);
    router.replace("/");
  }

  return (
    <AlertDialog open>
      <AlertDialogContent onEscapeKeyDown={(event) => event.preventDefault()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Ey Pa, antes de seguir</AlertDialogTitle>
          <AlertDialogDescription>
            Tenemos Términos de uso y Política de privacidad nuevos o que aún no habías aceptado. Para seguir usando
            MatchPa confirma que tienes 18 años o más y que los aceptas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <p className="text-sm">
          Léelos aquí:{" "}
          <LegalLink href="/terminos">Términos</LegalLink>
          {" y "}
          <LegalLink href="/privacidad">Privacidad</LegalLink>.
        </p>
        <p className="text-sm text-muted-foreground">
          ¿Prefieres eliminar tu cuenta? Escríbenos a <a href={`mailto:${PRIVACY_EMAIL}`} className="font-semibold underline underline-offset-4">{PRIVACY_EMAIL}</a>.
        </p>
        <FormAlert message={error} />
        <AlertDialogFooter>
          <Button variant="outline" size="lg" className="h-12" onClick={logout} disabled={busy}>
            Cerrar sesión
          </Button>
          <Button size="lg" className="h-12 font-bold" onClick={accept} disabled={busy}>
            {busy ? "Un momento…" : "Acepto"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
