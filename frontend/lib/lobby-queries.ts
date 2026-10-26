"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { api } from "@/lib/api";
import { subscribe } from "@/lib/realtime";
import type { Match } from "@/lib/types";

/** Keys are hierarchical so one invalidation can refresh every lobby query at once. */
export const lobbyKeys = {
  lobby: ["lobby"] as const,
  companies: ["companies"] as const,
  matches: (date: string | null, companyId?: number) => ["lobby", "matches", date, companyId] as const,
  players: (date: string, companyId?: number) => ["lobby", "players", date, companyId] as const,
  availabilities: ["me", "availabilities"] as const,
  requests: ["me", "match-requests"] as const,
  owned: ["me", "matches"] as const,
};

/** Re-fetch on every visit: the cached data shows instantly, then updates in the background. */
const ON_VISIT = { refetchOnMount: "always" } as const;

export function useCompanies() {
  return useQuery({
    queryKey: lobbyKeys.companies,
    queryFn: () => api.companies(),
    staleTime: 10 * 60_000,
  });
}

export function useLobbyMatches(date: string | null, companyId?: number) {
  return useQuery({
    queryKey: lobbyKeys.matches(date, companyId),
    queryFn: () => api.matches({ date: date ?? undefined, companyId }),
    ...ON_VISIT,
  });
}

export function useLobbyPlayers(date: string, companyId?: number) {
  return useQuery({
    queryKey: lobbyKeys.players(date, companyId),
    queryFn: () => api.players({ date, companyId }),
    ...ON_VISIT,
  });
}

export function useAvailabilities() {
  return useQuery({
    queryKey: lobbyKeys.availabilities,
    queryFn: () => api.myAvailabilities(),
    ...ON_VISIT,
  });
}

export function useInvitations() {
  return useQuery({
    queryKey: lobbyKeys.requests,
    queryFn: () => api.myRequests(),
    select: (requests) => requests.filter((r) => r.kind === "invitation"),
    ...ON_VISIT,
  });
}

export function useOwnMatch() {
  return useQuery({
    queryKey: lobbyKeys.owned,
    queryFn: () => api.myMatches(),
    select: nextMatch,
    ...ON_VISIT,
  });
}

/** Marks every lobby query stale and refetches the active ones. */
export function useRefreshLobby() {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: lobbyKeys.lobby });
    queryClient.invalidateQueries({ queryKey: ["me"] });
  }, [queryClient]);
}

/** Live updates: any lobby or personal event refreshes the cache. */
export function useLobbyRealtime(userId: number | undefined) {
  const refresh = useRefreshLobby();
  useEffect(() => subscribe("lobby", refresh), [refresh]);
  useEffect(
    () => (userId === undefined ? undefined : subscribe(`users/${userId}`, refresh)),
    [userId, refresh],
  );
}

/** The soonest open or full match the user organizes or plays in. */
export function nextMatch(matches: Match[]): Match | null {
  const open = matches.filter((m) => m.status === "open" || m.status === "full");
  return open.sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0] ?? null;
}
