"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ONE_SHOT_PARAMS, setInternalTraffic, track } from "./analytics";
import { api, ApiError } from "./api";
import { syncPushSubscription } from "./push";
import type { User } from "./types";

interface SessionValue {
  user: User | null;
  loading: boolean;
  /** The session could not be checked (network, timeout, server down), as opposed to being logged out. */
  failed: boolean;
  refresh: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const SessionContext = createContext<SessionValue | null>(null);

const GOOGLE_AUTH_EVENTS = { google_signup: "sign_up", google_login: "login" } as const;

/** Team traffic flag: `?internal=1|0` is stored and stripped from the URL. */
function useUrlFlags() {
  const router = useRouter();
  useEffect(() => {
    const url = new URL(window.location.href);
    const internal = url.searchParams.get("internal");
    if (internal !== "1" && internal !== "0") return;
    setInternalTraffic(internal === "1");
    ONE_SHOT_PARAMS.forEach((name) => url.searchParams.delete(name));
    router.replace(`${url.pathname}${url.search}${url.hash}`);
  }, [router]);
}

function trackGoogleAuth(authEvent: string | undefined) {
  if (authEvent && Object.hasOwn(GOOGLE_AUTH_EVENTS, authEvent))
    track(GOOGLE_AUTH_EVENTS[authEvent as keyof typeof GOOGLE_AUTH_EVENTS], { method: "google" });
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  useUrlFlags();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const refresh = useCallback(() => {
    return api
      .me()
      .then(({ authEvent, ...me }) => {
        trackGoogleAuth(authEvent);
        setUser(me);
        setFailed(false);
      })
      .catch((err) => {
        const loggedOut = err instanceof ApiError && err.status === 401;
        if (loggedOut) setUser(null);
        setFailed(!loggedOut);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const userId = user?.id;
  useEffect(() => {
    if (userId !== undefined) syncPushSubscription().catch(() => {});
  }, [userId]);

  const value = useMemo(() => ({ user, loading, failed, refresh, setUser }), [user, loading, failed, refresh]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside SessionProvider");
  return value;
}

export function isProfileComplete(user: User): boolean {
  return user.category !== null && user.gender !== null;
}
