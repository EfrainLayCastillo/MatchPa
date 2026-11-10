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
export type CategoryTier = "high" | "entry";
export type MatchDuration = 60 | 90 | 120;

export interface Branch {
  id: number;
  name: string;
  slug: string;
  phone: string | null;
  locationLabel: string;
  mapsUrl: string;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface BranchSuggestionInput {
  name: string;
  locationLabel: string;
  mapsUrl?: string;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  emailVerified: boolean;
  avatarUrl: string | null;
  phone: string | null;
  category: Category | null;
  categoryTier: CategoryTier | null;
  gender: Gender | null;
}

export interface Availability {
  date: string;
  fromTime: string | null;
  toTime: string | null;
  branchId: number;
}

export interface Player {
  id: number;
  fullName: string;
  category: Category;
  categoryTier: CategoryTier | null;
  gender: Gender;
  avatarUrl: string | null;
  emailVerified: boolean;
  availability: Availability;
}

export interface Guest {
  id: number;
  name: string;
  category: Category;
  categoryTier: CategoryTier | null;
  gender: Gender;
}

export interface MatchPlayer {
  id: number;
  fullName: string;
  category: Category;
  categoryTier: CategoryTier | null;
  gender: Gender;
  emailVerified: boolean;
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
  match: {
    code: string;
    startsAt: string;
    courtNumber: number;
    branchName: string;
    status: MatchStatus;
    category: Category;
    categoryTier: CategoryTier | null;
    durationMinutes: MatchDuration;
    type: MatchType;
  };
}

export interface Match {
  id: number;
  code: string;
  organizer: { id: number; fullName: string; phone: string | null };
  branch: Branch;
  courtNumber: number;
  startsAt: string;
  updatedAt: string | null;
  durationMinutes: MatchDuration;
  category: Category;
  categoryTier: CategoryTier | null;
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
  branchId: number;
  courtNumber: number;
  startsAt: string;
  durationMinutes: MatchDuration;
  category: Category;
  categoryTier?: CategoryTier | null;
  type: MatchType;
  maxPlayers: number;
  guests: Omit<Guest, "id">[];
}

export interface ApiFieldError {
  field?: string;
  message: string;
}
