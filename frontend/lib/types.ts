export type Gender = "male" | "female";
export type MatchType = "male" | "female" | "mixed";
export type MatchStatus = "open" | "full" | "closed" | "expired";
export type RequestKind = "join_request" | "invitation";
export type RequestStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "left"
  | "removed";

export type Category = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface Company {
  id: number;
  name: string;
  slug: string;
  phone: string;
  locationLabel: string;
  mapsUrl: string;
  website: string;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  phone: string | null;
  category: Category | null;
  gender: Gender | null;
}

export interface Availability {
  date: string;
  fromTime: string;
  toTime: string;
  companyId: number | null;
}

export interface Player {
  id: number;
  fullName: string;
  category: Category;
  gender: Gender;
  avatarUrl: string | null;
  availability: Availability;
}

export interface Guest {
  id: number;
  name: string;
  category: Category;
  gender: Gender;
}

export interface MatchPlayer {
  id: number;
  fullName: string;
  category: Category;
  gender: Gender;
}

export interface MatchRequest {
  id: number;
  kind: RequestKind;
  status: RequestStatus;
  user: MatchPlayer;
}

export interface MyRequest {
  id: number;
  kind: RequestKind;
  status: RequestStatus;
  match: { code: string; startsAt: string; courtNumber: number; companyName: string };
}

export interface Match {
  id: number;
  code: string;
  organizer: { id: number; fullName: string; phone: string | null };
  company: Company;
  courtNumber: number;
  startsAt: string;
  updatedAt: string | null;
  durationMinutes: 90 | 120;
  category: Category;
  type: MatchType;
  maxPlayers: number;
  status: MatchStatus;
  spotsLeft: number;
  guests: Guest[];
  players: MatchPlayer[];
  isOrganizer: boolean;
  myRequest: { id: number; kind: RequestKind; status: RequestStatus } | null;
  requests?: MatchRequest[];
}

export interface NewMatchInput {
  companyId: number;
  courtNumber: number;
  startsAt: string;
  durationMinutes: 90 | 120;
  category: Category;
  type: MatchType;
  maxPlayers: number;
  guests: Omit<Guest, "id">[];
}

export interface ApiFieldError {
  field?: string;
  message: string;
}
