import type { Match } from "./types";

export interface Seat {
  initials: string | null;
  filled: boolean;
}

const initialsOf = (name: string | null) =>
  name
    ? name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]!.toUpperCase())
        .join("")
    : null;

/** Every seat of the match in order: organizer, accepted players, guests, then the free ones. */
export function seatsOf(match: Pick<Match, "players" | "guests" | "maxPlayers">): Seat[] {
  const taken = [...match.players.map((player) => player.fullName), ...match.guests.map((guest) => guest.name)].map(initialsOf);
  return Array.from({ length: match.maxPlayers }, (_, index) => ({
    initials: taken[index] ?? null,
    filled: index < taken.length,
  }));
}
