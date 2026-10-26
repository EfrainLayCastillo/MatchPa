"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageTitle } from "@/components/matchpa/page-title";
import { api } from "@/lib/api";
import { disablePush, enablePush, isPushEnabled, pushSupported } from "@/lib/push";
import { useSession } from "@/lib/session";
import { ProfileForm } from "./profile-form";

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
    <div className="mx-auto w-full max-w-md space-y-8 px-4 pb-16 pt-6">
      <PageTitle hint={user?.email}>{user?.fullName}</PageTitle>

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-bold">Mis datos</h2>
        <ProfileForm mode="profile" />
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold">Notificaciones</h2>
        <PushToggle />
      </section>

      <Button variant="outline" className="w-full" onClick={logout}>
        Cerrar sesión
      </Button>
    </div>
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
