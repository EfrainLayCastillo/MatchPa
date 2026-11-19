"use client";

import { ClockIcon, PlusIcon, UserMinusIcon } from "lucide-react";
import { useState } from "react";
import { InitialAvatar, LevelBadges } from "@/components/matchpa/player-identity";
import { SectionHeading } from "@/components/matchpa/section-heading";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { firstName } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Category, CategoryTier, Gender, Match, MatchRequest } from "@/lib/types";

const BADGES_SMALL =
  "flex justify-center [&>span]:grid [&>span]:grid-cols-[repeat(2,auto)] [&>span]:justify-center [&>span]:gap-0.5 [&>span>*:last-child:nth-child(odd)]:col-span-2 [&>span>*:last-child:nth-child(odd)]:justify-self-center [&_[data-slot=badge]]:h-4 [&_[data-slot=badge]]:gap-0.5 [&_[data-slot=badge]]:px-1.5 [&_[data-slot=badge]]:text-[10px] [&_[data-slot=badge]_svg]:size-2.5";

interface Person {
  key: string;
  name: string;
  verified: boolean;
  gender: Gender | null;
  category: Category | null;
  tier: CategoryTier | null;
  /** The accepted request behind this seat, when the viewer can remove it. */
  seat?: MatchRequest;
}

interface PlayerRowProps {
  match: Match;
  busy?: boolean;
  onRemove?: (request: MatchRequest) => void;
}

function peopleOf(match: Match, canRemove: boolean): Person[] {
  const accepted = (match.requests ?? []).filter((request) => request.status === "accepted");
  const players = match.players.map((player, index) => ({
    key: `p-${player.id}`,
    name: player.fullName ? firstName(player.fullName) : index === 0 ? "Organizador" : `Jugador ${index}`,
    verified: player.emailVerified,
    gender: player.gender,
    category: player.category,
    tier: player.categoryTier,
    seat: canRemove ? accepted.find((request) => request.user.id === player.id) : undefined,
  }));
  const guests = match.guests.map((guest, index) => ({
    key: `g-${guest.id}`,
    name: guest.name ? firstName(guest.name) : `Invitado ${index + 1}`,
    verified: false,
    gender: guest.gender,
    category: guest.category,
    tier: guest.categoryTier,
  }));
  return [...players, ...guests];
}

function invitedOf(match: Match): Person[] {
  return (match.requests ?? [])
    .filter((request) => request.status === "pending" && request.kind === "invitation")
    .map((request) => ({
      key: `i-${request.id}`,
      name: firstName(request.user.fullName),
      verified: request.user.emailVerified,
      gender: request.user.gender,
      category: request.user.category,
      tier: request.user.categoryTier,
    }));
}

/** Keys rendered for the first time after mount, so newcomers can animate in. */
function useNewcomers(keys: string[]) {
  const signature = keys.join("|");
  const [state, setState] = useState({ signature, seen: new Set(keys), fresh: new Set<string>() });
  if (state.signature !== signature) {
    setState({ signature, seen: new Set(keys), fresh: new Set(keys.filter((key) => !state.seen.has(key))) });
  }
  return state.fresh;
}

export function PlayerRow({ match, busy = false, onRemove }: PlayerRowProps) {
  const canRemove = Boolean(onRemove) && (match.status === "open" || match.status === "full");
  const people = peopleOf(match, canRemove);
  const invited = invitedOf(match).slice(0, Math.max(match.maxPlayers - people.length, 0));
  const free = Math.max(match.maxPlayers - people.length - invited.length, 0);
  const missing = match.maxPlayers - people.length;
  const newcomers = useNewcomers(people.map((person) => person.key));
  const items = [
    ...people.map((person) => (
      <PersonItem key={person.key} person={person} arriving={newcomers.has(person.key)} busy={busy} onRemove={onRemove} />
    )),
    ...invited.map((person) => <InvitedItem key={person.key} person={person} />),
    ...Array.from({ length: free }, (_, index) => <FreeItem key={`free-${index}`} />),
  ];
  return (
    <section className="space-y-2">
      <SectionHeading
        trailing={
          <span className="shrink-0 text-xs text-muted-foreground">
            {missing <= 0 ? "Completo" : missing === 1 ? "Falta 1" : `Faltan ${missing}`}
          </span>
        }
      >
        Jugadores ({people.length}/{match.maxPlayers})
      </SectionHeading>
      <div className="relative mx-[calc(50%-50vw)] border-y border-border bg-card">
        <ul className="relative mx-auto flex max-w-2xl snap-x gap-0.5 overflow-x-auto overscroll-x-contain px-4 pt-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.flatMap((item, index) => (index === 0 ? [item] : [<Separator key={`sep-${index}`} />, item]))}
        </ul>
      </div>
    </section>
  );
}

interface PersonItemProps {
  person: Person;
  arriving: boolean;
  busy: boolean;
  onRemove?: (request: MatchRequest) => void;
}

function PersonItem({ person, arriving, busy, onRemove }: PersonItemProps) {
  const avatar = <InitialAvatar name={person.name} verified={person.verified} />;
  return (
    <li
      className={cn(
        "flex min-w-20 shrink-0 snap-start flex-col items-center gap-1 text-center",
        arriving && "motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:fade-in motion-safe:duration-500",
      )}
    >
      {person.seat && onRemove ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            className="relative rounded-full ring-3 ring-brand-teal ring-offset-2 ring-offset-background outline-none before:pointer-events-none before:absolute before:-inset-1 before:rounded-full before:border-2 before:border-brand-teal before:opacity-0 after:pointer-events-none after:absolute after:-inset-1 after:rounded-full after:border-2 after:border-brand-teal after:opacity-0 motion-safe:before:animate-radar motion-safe:after:animate-radar motion-safe:after:[animation-delay:1.2s] focus-visible:ring-3 focus-visible:ring-ring/50 dark:ring-brand-lime dark:before:border-brand-lime dark:after:border-brand-lime"
            aria-label={`Opciones de ${person.name}`}
          >
            {avatar}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuItem variant="destructive" disabled={busy} onSelect={() => onRemove(person.seat!)}>
              <UserMinusIcon />
              Sacar del partido
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        avatar
      )}
      <p className="max-w-32 truncate text-sm font-semibold leading-tight">{person.name}</p>
      <div className={BADGES_SMALL}>
        <LevelBadges category={person.category} tier={person.tier} gender={person.gender} />
      </div>
    </li>
  );
}

function InvitedItem({ person }: { person: Person }) {
  return (
    <li className="flex min-w-20 shrink-0 snap-start flex-col items-center gap-1 text-center">
      <span className="relative">
        <span className="block rounded-full opacity-45 ring-2 ring-brand-lime ring-offset-2 ring-offset-background">
          <InitialAvatar name={person.name} />
        </span>
        <span className="absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full bg-brand-lime text-brand-teal ring-2 ring-background">
          <ClockIcon aria-hidden className="size-3" />
        </span>
      </span>
      <p className="max-w-32 truncate text-sm font-semibold leading-tight text-muted-foreground">{person.name}</p>
      <p className="text-[10px] leading-none text-muted-foreground">Esperando</p>
    </li>
  );
}

function FreeItem() {
  return (
    <li className="flex w-20 shrink-0 snap-start flex-col items-center gap-1 text-center">
      <span
        aria-hidden
        className="flex size-12 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/50 text-muted-foreground"
      >
        <PlusIcon className="size-5" />
      </span>
      <p className="text-sm text-muted-foreground">Libre</p>
    </li>
  );
}

function Separator() {
  return (
    <li aria-hidden className="flex h-12 shrink-0 items-center font-heading text-xl font-extrabold text-brand-teal dark:text-brand-lime">
      +
    </li>
  );
}
