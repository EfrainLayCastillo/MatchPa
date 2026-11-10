"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageTitle } from "@/components/matchpa/page-title";
import { PlayerSummary } from "@/components/matchpa/player-identity";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, ApiError } from "@/lib/api";
import { disablePush, enablePush, isPushEnabled, pushSupported } from "@/lib/push";
import { useSession } from "@/lib/session";
import type { User } from "@/lib/types";
import { DeleteAccount } from "./delete-account";
import { ProfileForm } from "./profile-form";
import { FormAlert } from "@/components/matchpa/form-alert";

type PushState = "loading" | "unsupported" | "on" | "off" | "denied";

export function ProfileView() {
  const { user, setUser } = useSession();
  const router = useRouter();

  async function logout() {
    await api.logout().catch(() => {});
    setUser(null);
    router.replace("/");
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 px-4 pb-16 pt-6">
      <PageTitle className="text-2xl sm:text-3xl">Mi perfil</PageTitle>

      {user ? <ProfileSummary user={user} /> : null}

      {user?.emailVerified === false ? <VerifyEmailNotice /> : null}

      <Tabs defaultValue="data">
        <TabsList className="w-full">
          <TabsTrigger value="data">Mis datos</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        </TabsList>
        <TabsContent value="data" className="mt-4">
          <ProfileForm mode="profile" />
        </TabsContent>
        <TabsContent value="notifications" className="mt-4">
          <PushToggle />
        </TabsContent>
      </Tabs>

      <Button variant="outline" className="w-full" onClick={logout}>
        Cerrar sesión
      </Button>

      <DeleteAccount />
    </div>
  );
}

function ProfileSummary({ user }: { user: User }) {
  return (
    <Card className="px-4">
      <PlayerSummary
        name={user.fullName.trim() || user.email}
        verified={user.emailVerified}
        gender={user.gender}
        category={user.category}
        tier={user.categoryTier}
        caption={<p className="truncate text-xs text-muted-foreground">{user.email}</p>}
      />
    </Card>
  );
}

function VerifyEmailNotice() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function startVerification() {
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
    router.push("/verificar?next=/perfil");
  }

  return (
    <Card role="status" className="gap-3 border-brand-lime/60 bg-brand-lime/10 py-4">
      <CardContent className="space-y-3">
        <p className="text-sm">Tu correo no está verificado. Verifícalo para publicar y unirte a partidos.</p>
        <FormAlert message={failed ? "No pudimos enviar el código. Intenta de nuevo." : null} />
        <Button className="h-11 w-full" onClick={startVerification} disabled={busy}>
          {busy ? "Enviando…" : "Verificar correo"}
        </Button>
      </CardContent>
    </Card>
  );
}

async function readPushState(): Promise<PushState> {
  if (!pushSupported()) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  return (await isPushEnabled()) ? "on" : "off";
}

function PushToggle() {
  const [state, setState] = useState<PushState>("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    readPushState().then((next) => active && setState(next));
    return () => {
      active = false;
    };
  }, []);

  async function toggle() {
    setBusy(true);
    if (state === "on") {
      await disablePush().catch(() => {});
      setState("off");
    } else {
      const result = await enablePush().catch(() => "denied" as const);
      setState(result === "enabled" ? "on" : result === "unsupported" ? "unsupported" : "denied");
    }
    setBusy(false);
  }

  const copy: Record<PushState, string> = {
    loading: "Revisando…",
    unsupported: "Tu navegador no admite notificaciones. Instala MatchPa en la pantalla de inicio para activarlas.",
    on: "Te avisamos cuando alguien pida unirse, te inviten o cambie tu partido.",
    off: "Activa las notificaciones para no perderte una invitación.",
    denied: "Las notificaciones están bloqueadas en tu navegador. Puedes activarlas desde los ajustes.",
  };

  return (
    <Card className="gap-3 py-4">
      <CardContent className="space-y-3">
        <p className="text-sm">{copy[state]}</p>
        {state === "off" || state === "on" ? (
          <Button variant={state === "on" ? "outline" : "default"} onClick={toggle} disabled={busy}>
            {state === "on" ? "Desactivar notificaciones" : "Activar notificaciones"}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
