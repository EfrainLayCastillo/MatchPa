"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, ApiError } from "./api";
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

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const refresh = useCallback(() => {
    return api
      .me()
      .then((me) => {
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

  const value = useMemo(() => ({ user, loading, failed, refresh, setUser }), [user, loading, failed, refresh]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside SessionProvider");
  return value;
}

export function isProfileComplete(user: User): boolean {
  return user.category !== null && user.gender !== null && user.phone !== null;
}
