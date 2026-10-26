import { ApiError } from "./errors";
import { mockRequest } from "./mock-api";
import type {
  Availability,
  Category,
  Company,
  Gender,
  Match,
  MatchRequest,
  MatchType,
  NewMatchInput,
  Player,
  User,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333/api";
const USE_MOCKS = process.env.NEXT_PUBLIC_MOCK_API === "true";

export async function request<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> {
  if (USE_MOCKS) return mockRequest<T>(method, path, body);

  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      res.status,
      data.errors ?? [{ message: data.message ?? "Algo salió mal, intenta de nuevo" }],
    );
  }
  return data as T;
}

function query(params: object): string {
  const entries = Object.entries(params).filter(
    (entry): entry is [string, string | number] =>
      (typeof entry[1] === "string" || typeof entry[1] === "number") && entry[1] !== "",
  );
  return new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

export interface PlayerFilters {
  date: string;
  companyId?: number;
}

export interface MatchFilters {
  date: string;
  companyId?: number;
  type?: MatchType;
}

export interface ProfileInput {
  fullName?: string;
  category?: Category;
  gender?: Gender;
  phone?: string;
}

export const api = {
  me: () => request<User>("GET", "/me"),
  updateMe: (input: ProfileInput) => request<User>("PATCH", "/me", input),
  register: (input: { fullName: string; email: string; password: string }) =>
    request<User>("POST", "/auth/register", input),
  login: (input: { email: string; password: string }) =>
    request<User>("POST", "/auth/login", input),
  logout: () => request<void>("POST", "/auth/logout"),

  companies: () => request<Company[]>("GET", "/companies"),

  players: (filters: PlayerFilters) =>
    request<Player[]>("GET", `/players?${query(filters)}`),
  myAvailabilities: () => request<Availability[]>("GET", "/me/availabilities"),
  setAvailability: (date: string, input: Omit<Availability, "date">) =>
    request<Availability>("PUT", `/me/availabilities/${date}`, input),
  removeAvailability: (date: string) =>
    request<void>("DELETE", `/me/availabilities/${date}`),

  matches: (filters: MatchFilters) =>
    request<Match[]>("GET", `/matches?${query(filters)}`),
  match: (code: string) => request<Match>("GET", `/matches/${code}`),
  createMatch: (input: NewMatchInput) => request<Match>("POST", "/matches", input),
  updateMatch: (code: string, input: NewMatchInput) =>
    request<Match>("PATCH", `/matches/${code}`, input),
  closeMatch: (code: string) => request<Match>("POST", `/matches/${code}/close`),
  requestToJoin: (code: string) =>
    request<MatchRequest>("POST", `/matches/${code}/join-requests`),
  invite: (code: string, userId: number) =>
    request<MatchRequest>("POST", `/matches/${code}/invitations`, { userId }),
  respondToRequest: (requestId: number, action: "accept" | "reject" | "leave" | "remove") =>
    request<MatchRequest>("PATCH", `/match-requests/${requestId}`, { action }),
  myMatches: () => request<Match[]>("GET", "/me/matches"),

  savePushSubscription: (subscription: PushSubscriptionJSON) =>
    request<void>("POST", "/push-subscriptions", subscription),
  removePushSubscription: (endpoint: string) =>
    request<void>("DELETE", "/push-subscriptions", { endpoint }),
};

export { ApiError };

export const API_BASE = API_URL;
export const API_ORIGIN = API_URL.replace(/\/api$/, "");
export const USING_MOCKS = USE_MOCKS;
