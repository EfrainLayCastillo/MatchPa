// In-memory stand-in for the AdonisJS API, enabled with NEXT_PUBLIC_MOCK_API=true.
// It mirrors the README contract so screens can be built before the backend exists.
import { ApiError } from "./errors";
import { dateKey } from "./panamaFormatDate";

import type {
  Availability,
  Category,
  Company,
  Gender,
  Match,
  MatchRequest,
  MatchStatus,
  MatchType,
  Player,
  RequestStatus,
  User,
} from "./types";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface StoredMatch {
  id: number;
  updatedAt: string;
  code: string;
  organizerId: number;
  companyId: number;
  courtNumber: number;
  startsAt: string;
  durationMinutes: 90 | 120;
  category: Match["category"];
  type: MatchType;
  maxPlayers: number;
  closed: boolean;
  guests: Match["guests"];
  requests: { id: number; userId: number; kind: MatchRequest["kind"]; status: RequestStatus }[];
}

const companies: Company[] = [
  {
    id: 1,
    name: "WePadel",
    slug: "wepadel",
    phone: "+507 200-0001",
    locationLabel: "Centennial",
    mapsUrl: "https://maps.google.com/?q=WePadel+Centennial",
    website: "https://wepadel.com",
  },
  {
    id: 2,
    name: "XForce",
    slug: "xforce",
    phone: "+507 200-0002",
    locationLabel: "Costa del Este",
    mapsUrl: "https://maps.google.com/?q=XForce+Costa+del+Este",
    website: "https://xforce.com",
  },
];

const users: (User & { password: string })[] = [
  {
    id: 1,
    fullName: "Efrain Lay",
    email: "efrain@matchpa.net",
    password: "demo",
    avatarUrl: null,
    phone: "+507 6000-0001",
    category: 4,
    gender: "male",
  },
  seedPlayer(2, "Sacha Ortega", 4, "male"),
  seedPlayer(3, "Esteban Mora", 5, "male"),
  seedPlayer(4, "Mariana Ruiz", 3, "female"),
  seedPlayer(5, "Lucía Ponce", 4, "female"),
  seedPlayer(6, "Andrés Vega", 2, "male"),
];

const availabilities = new Map<number, Availability[]>();
const today = dateKey(new Date());
availabilities.set(2, [{ date: today, fromTime: "17:00", toTime: "21:00", companyId: 1 }]);
availabilities.set(3, [{ date: today, fromTime: "18:00", toTime: "22:00", companyId: null }]);
availabilities.set(4, [{ date: today, fromTime: "16:00", toTime: "20:00", companyId: 2 }]);
availabilities.set(6, [{ date: today, fromTime: "19:00", toTime: "23:00", companyId: null }]);

const matches: StoredMatch[] = [
  {
    id: 1,
    code: "k3p9xw2m",
    organizerId: 2,
    companyId: 1,
    courtNumber: 3,
    startsAt: at(dateKey(new Date(Date.now() + 86_400_000)), "18:00"),
    durationMinutes: 90,
    category: 4,
    type: "mixed",
    maxPlayers: 4,
    updatedAt: new Date().toISOString(),
    closed: false,
    guests: [{ id: 1, name: "Efrain Lay", category: 4, gender: "male" }],
    requests: [],
  },
];

let me: number | null = 1;
let nextId = 100;

function seedPlayer(id: number, fullName: string, category: Category, gender: Gender): User & { password: string } {
  return {
    id,
    fullName,
    email: `${fullName.split(" ")[0]?.toLowerCase()}@matchpa.net`,
    password: "demo",
    avatarUrl: null,
    phone: `+507 6000-000`,
    category,
    gender,
  };
}

function at(dateKey: string, time: string): string {
  return new Date(`${dateKey}T${time}:00-05:00`).toISOString();
}

function fail(status: number, message: string): never {
  throw new ApiError(status, [{ message }]);
}

function requireMe(): User {
  const user = users.find((u) => u.id === me);
  if (!user) fail(401, "Inicia sesión para continuar");
  return publicUser(user);
}

function publicUser(user: User & { password?: string }): User {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    avatarUrl: user.avatarUrl,
    phone: user.phone,
    category: user.category,
    gender: user.gender,
  };
}

function acceptedRequests(match: StoredMatch) {
  return match.requests.filter((r) => r.status === "accepted");
}

function statusOf(match: StoredMatch): MatchStatus {
  if (match.closed) return "closed";
  if (new Date(match.startsAt) <= new Date()) return "expired";
  const spots = spotsLeft(match);
  return spots === 0 ? "full" : "open";
}

function spotsLeft(match: StoredMatch): number {
  return match.maxPlayers - 1 - match.guests.length - acceptedRequests(match).length;
}

function playerOf(userId: number) {
  const user = users.find((u) => u.id === userId);
  if (!user) fail(404, "Jugador no encontrado");
  return { id: user.id, fullName: user.fullName, category: user.category ?? 4, gender: user.gender ?? "male" };
}

function viewOf(match: StoredMatch): Match {
  const organizer = users.find((u) => u.id === match.organizerId)!;
  const mine = me === null ? undefined : match.requests.find((r) => r.userId === me && ["pending", "accepted"].includes(r.status));
  const isOrganizer = me === match.organizerId;
  const requests = isOrganizer
    ? match.requests.map((r) => ({
        id: r.id,
        kind: r.kind,
        status: r.status,
        user: playerOf(r.userId),
      }))
    : undefined;

  return {
    id: match.id,
    code: match.code,
    organizer: { id: organizer.id, fullName: organizer.fullName, phone: isOrganizer || me ? organizer.phone : null },
    company: companies.find((c) => c.id === match.companyId)!,
    courtNumber: match.courtNumber,
    startsAt: match.startsAt,
    updatedAt: match.updatedAt,
    durationMinutes: match.durationMinutes,
    category: match.category,
    type: match.type,
    maxPlayers: match.maxPlayers,
    status: statusOf(match),
    spotsLeft: Math.max(spotsLeft(match), 0),
    guests: match.guests,
    players: [playerOf(match.organizerId), ...acceptedRequests(match).map((r) => playerOf(r.userId))],
    isOrganizer,
    myRequest: mine ? { id: mine.id, kind: mine.kind, status: mine.status } : null,
    requests,
  };
}

function findMatch(code: string): StoredMatch {
  const match = matches.find((m) => m.code === code);
  if (!match) fail(404, "Partido no encontrado");
  return match;
}

function requireOrganizer(match: StoredMatch) {
  if (me !== match.organizerId) fail(403, "Solo el organizador puede hacer esto");
}

function openMatchesFor(date: string, companyId?: number, type?: MatchType) {
  return matches
    .filter((m) => dateKey(new Date(m.startsAt)) === date)
    .filter((m) => companyId === undefined || m.companyId === companyId)
    .filter((m) => type === undefined || m.type === type)
    .map(viewOf)
    .filter((m) => m.status === "open");
}

function playersFor(date: string, companyId?: number): Player[] {
  return users
    .filter((u) => u.id !== me && u.category && u.gender)
    .flatMap((u) => {
      const slot = (availabilities.get(u.id) ?? []).find((a) => a.date === date);
      if (!slot || (companyId !== undefined && slot.companyId !== null && slot.companyId !== companyId)) return [];
      return [{ id: u.id, fullName: u.fullName, category: u.category!, gender: u.gender!, avatarUrl: null, availability: slot }];
    });
}

export async function mockRequest<T>(method: Method, fullPath: string, body?: unknown): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, 120));
  const [path, search = ""] = fullPath.split("?");
  const params = new URLSearchParams(search);
  const input = (body ?? {}) as Record<string, unknown>;
  const route = `${method} ${path}`;

  const handlers: [RegExp, () => unknown][] = [];
  const on = (pattern: RegExp, handler: (m: RegExpMatchArray) => unknown) => handlers.push([pattern, () => handler(pattern.exec(route)!)]);

  on(/^GET \/me$/, () => requireMe());
  on(/^PATCH \/me$/, () => {
    const user = users.find((u) => u.id === me);
    if (!user) fail(401, "Inicia sesión para continuar");
    Object.assign(user, input);
    return publicUser(user);
  });
  on(/^POST \/auth\/login$/, () => {
    const user = users.find((u) => u.email === input.email && u.password === input.password);
    if (!user) fail(422, "Correo o contraseña incorrectos");
    me = user.id;
    return publicUser(user);
  });
  on(/^POST \/auth\/register$/, () => {
    const user = seedPlayer(nextId++, String(input.fullName), 4, "male");
    Object.assign(user, { email: String(input.email), password: String(input.password), category: null, gender: null });
    users.push(user);
    me = user.id;
    return publicUser(user);
  });
  on(/^POST \/auth\/logout$/, () => {
    me = null;
  });

  on(/^GET \/companies$/, () => companies);

  on(/^GET \/players$/, () => {
    requireMe();
    return playersFor(params.get("date") ?? today, numberOrUndefined(params.get("companyId")));
  });
  on(/^GET \/me\/availabilities$/, () => availabilities.get(requireMe().id) ?? []);
  on(/^PUT \/me\/availabilities\/(.+)$/, (m) => {
    const id = requireMe().id;
    const date = m[1];
    const rest = (availabilities.get(id) ?? []).filter((a) => a.date !== date);
    const slot: Availability = { date, fromTime: String(input.fromTime), toTime: String(input.toTime), companyId: (input.companyId as number | null) ?? null };
    availabilities.set(id, [...rest, slot]);
    return slot;
  });
  on(/^DELETE \/me\/availabilities\/(.+)$/, (m) => {
    const id = requireMe().id;
    availabilities.set(id, (availabilities.get(id) ?? []).filter((a) => a.date !== m[1]));
  });

  on(/^GET \/matches$/, () =>
    openMatchesFor(params.get("date") ?? today, numberOrUndefined(params.get("companyId")), (params.get("type") as MatchType) || undefined),
  );
  on(/^POST \/matches$/, () => {
    const user = requireMe();
    const match: StoredMatch = {
      id: nextId++,
      code: Math.random().toString(36).slice(2, 10).padEnd(8, "x"),
      organizerId: user.id,
      companyId: Number(input.companyId),
      courtNumber: Number(input.courtNumber),
      startsAt: String(input.startsAt),
      durationMinutes: input.durationMinutes as 90 | 120,
      category: input.category as Match["category"],
      type: input.type as MatchType,
      maxPlayers: Number(input.maxPlayers),
      updatedAt: new Date().toISOString(),
      closed: false,
      guests: (input.guests as Omit<Match["guests"][number], "id">[]).map((g, i) => ({ id: i + 1, ...g })),
      requests: [],
    };
    matches.push(match);
    return viewOf(match);
  });
  on(/^GET \/matches\/([^/]+)$/, (m) => viewOf(findMatch(m[1])));
  on(/^PATCH \/matches\/([^/]+)$/, (m) => {
    const match = findMatch(m[1]);
    requireOrganizer(match);
    if (statusOf(match) !== "open") fail(422, "Solo puedes editar un partido abierto");
    Object.assign(match, {
      companyId: Number(input.companyId),
      courtNumber: Number(input.courtNumber),
      startsAt: String(input.startsAt),
      updatedAt: new Date().toISOString(),
      durationMinutes: input.durationMinutes as 90 | 120,
      category: input.category as Match["category"],
      type: input.type as MatchType,
      maxPlayers: Number(input.maxPlayers),
      guests: (input.guests as Omit<Match["guests"][number], "id">[]).map((g, i) => ({ id: i + 1, ...g })),
    });
    return viewOf(match);
  });
  on(/^POST \/matches\/([^/]+)\/close$/, (m) => {
    const match = findMatch(m[1]);
    requireOrganizer(match);
    match.closed = true;
    match.updatedAt = new Date().toISOString();
    match.requests.forEach((r) => r.status === "pending" && (r.status = "cancelled"));
    return viewOf(match);
  });
  on(/^POST \/matches\/([^/]+)\/join-requests$/, (m) => {
    const match = findMatch(m[1]);
    const user = requireMe();
    if (match.organizerId === user.id) fail(422, "No puedes unirte a tu propio partido");
    if (match.requests.some((r) => r.userId === user.id && ["pending", "accepted"].includes(r.status))) {
      fail(422, "Ya tienes una solicitud activa en este partido");
    }
    const request = { id: nextId++, userId: user.id, kind: "join_request" as const, status: "pending" as const };
    match.requests.push(request);
    return { id: request.id, kind: request.kind, status: request.status, user: playerOf(user.id) };
  });
  on(/^POST \/matches\/([^/]+)\/invitations$/, (m) => {
    const match = findMatch(m[1]);
    requireOrganizer(match);
    const request = { id: nextId++, userId: Number(input.userId), kind: "invitation" as const, status: "pending" as const };
    match.requests.push(request);
    return { id: request.id, kind: request.kind, status: request.status, user: playerOf(request.userId) };
  });
  on(/^PATCH \/match-requests\/(\d+)$/, (m) => {
    const owner = me;
    const request = matches.flatMap((match) => match.requests.map((r) => ({ match, r }))).find((x) => x.r.id === Number(m[1]));
    if (!request) fail(404, "Solicitud no encontrada");
    const { match, r } = request;
    const action = String(input.action);
    const isOrganizer = owner === match.organizerId;
    const rules: Record<string, { from: RequestStatus; to: RequestStatus; allowed: boolean }> = {
      accept: { from: "pending", to: "accepted", allowed: r.kind === "join_request" ? isOrganizer : owner === r.userId },
      reject: { from: "pending", to: "rejected", allowed: r.kind === "join_request" ? isOrganizer : owner === r.userId },
      leave: { from: "accepted", to: "left", allowed: owner === r.userId },
      remove: { from: "accepted", to: "removed", allowed: isOrganizer },
    };
    const rule = rules[action];
    if (!rule) fail(422, "Acción no válida");
    if (!rule.allowed) fail(403, "No tienes permiso para esta acción");
    if (r.status !== rule.from) fail(422, "La solicitud ya no se puede cambiar");
    r.status = rule.to;
    if (action === "accept" && spotsLeft(match) < 0) {
      r.status = "pending";
      fail(422, "No quedan puestos disponibles");
    }
    return { id: r.id, kind: r.kind, status: r.status, user: playerOf(r.userId) };
  });
  on(/^GET \/me\/match-requests$/, () => {
    const user = requireMe();
    return matches.flatMap((match) =>
      match.requests
        .filter((r) => r.userId === user.id && r.status === "pending")
        .map((r) => ({
          id: r.id,
          kind: r.kind,
          status: r.status,
          match: {
            code: match.code,
            startsAt: match.startsAt,
            courtNumber: match.courtNumber,
            companyName: companies.find((c) => c.id === match.companyId)!.name,
          },
        })),
    );
  });
  on(/^GET \/me\/matches$/, () => {
    const user = requireMe();
    return matches
      .filter((m) => m.organizerId === user.id || m.requests.some((r) => r.userId === user.id && r.status === "accepted"))
      .map(viewOf);
  });
  on(/^POST \/push-subscriptions$/, () => undefined);
  on(/^DELETE \/push-subscriptions$/, () => undefined);

  const match = handlers.find(([pattern]) => pattern.test(route));
  if (!match) fail(404, `Ruta no simulada: ${route}`);
  return match[1]() as T;
}

function numberOrUndefined(value: string | null): number | undefined {
  return value ? Number(value) : undefined;
}
