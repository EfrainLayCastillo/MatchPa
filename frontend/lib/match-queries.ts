"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { api } from "@/lib/api";
import { ApiError } from "@/lib/errors";
import { lobbyKeys } from "@/lib/lobby-queries";
import { subscribe } from "@/lib/realtime";
import { useSession } from "@/lib/session";
import type { Match, SignalKind } from "@/lib/types";

const matchKeys = {
  detail: (code: string) => ["match", code] as const,
};

/**
 * Public read: the page works signed out, and the server adds requests and signals when signed in.
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
  const queryClient = useQueryClient();
  const refresh = useRefreshMatch(code);
  useEffect(
    () =>
      subscribe(`matches/${code}`, (message) => {
        const isSignal = (message as { type?: string } | null)?.type === "match.signal";
        if (isSignal) queryClient.invalidateQueries({ queryKey: matchKeys.detail(code) });
        else refresh();
      }),
    [code, queryClient, refresh],
  );
}

/** Adds the signal to the cached match right away and rolls back if the API refuses it. */
export function useSendSignal(code: string) {
  const queryClient = useQueryClient();
  const { user } = useSession();
  const key = matchKeys.detail(code);
  return useMutation({
    mutationFn: (kind: SignalKind) => api.sendSignal(code, kind),
    onMutate: async (kind) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Match>(key);
      if (previous && user) {
        const signal = { userId: user.id, fullName: user.fullName, kind, createdAt: new Date().toISOString() };
        queryClient.setQueryData<Match>(key, { ...previous, signals: [...(previous.signals ?? []), signal] });
      }
      return { previous };
    },
    onError: (err, _kind, context) => {
      const alreadySent = err instanceof ApiError && err.status === 409;
      if (!alreadySent && context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
