"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { api } from "@/lib/api";
import { lobbyKeys } from "@/lib/lobby-queries";
import { subscribe } from "@/lib/realtime";
import type { Match } from "@/lib/types";

export const matchKeys = {
  detail: (code: string) => ["match", code] as const,
};

/**
 * Public read: the page works signed out, and the server adds phone and requests when signed in.
 * `serverMatch` is the signed-out view rendered on the server; it paints immediately as placeholder
 * until the client fetch, with the session, replaces it.
 */
export function useMatch(code: string, serverMatch?: Match) {
  return useQuery({
    queryKey: matchKeys.detail(code),
    queryFn: () => api.match(code),
    placeholderData: serverMatch,
    refetchOnMount: "always",
  });
}

/** Refreshes this match and everything that lists it: lobby, my matches, my requests. */
export function useRefreshMatch(code: string) {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: matchKeys.detail(code) });
    queryClient.invalidateQueries({ queryKey: lobbyKeys.lobby });
    queryClient.invalidateQueries({ queryKey: ["me"] });
  }, [queryClient, code]);
}

export function useMatchRealtime(code: string) {
  const refresh = useRefreshMatch(code);
  useEffect(() => subscribe(`matches/${code}`, refresh), [code, refresh]);
}
