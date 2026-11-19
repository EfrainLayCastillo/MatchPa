import { FlagIcon, PartyPopperIcon, TimerOffIcon, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Match } from "@/lib/types";

interface Note {
  icon: LucideIcon;
  title: string;
  body: string;
  tone: string;
}

function noteOf(match: Match): Note | null {
  if (match.status === "full")
    return {
      icon: PartyPopperIcon,
      title: `¡Match! Ya están los ${match.maxPlayers}`,
      body: "Este partido está completo. Si alguien se baja, el puesto se vuelve a abrir.",
      tone: "bg-brand-lime text-brand-teal",
    };
  if (match.status === "closed")
    return {
      icon: FlagIcon,
      title: "Equipo armado",
      body: "El organizador cerró la búsqueda. En el lobby hay más partidos esperando su cuarto.",
      tone: "bg-secondary text-foreground",
    };
  if (match.status === "expired")
    return {
      icon: TimerOffIcon,
      title: "Este ya se jugó",
      body: "Llegó la hora del saque. Busca tu próximo partido en el lobby.",
      tone: "bg-secondary text-foreground",
    };
  return null;
}

/** Playful notice for a match that no longer takes players. */
export function StatusNote({ match }: { match: Match }) {
  const note = noteOf(match);
  if (!note) return null;
  const Icon = note.icon;
  return (
    <div role="status" className={cn("flex items-start gap-3 rounded-2xl p-4", note.tone)}>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-teal text-brand-lime">
        <Icon aria-hidden className="size-5" />
      </span>
      <div className="space-y-0.5">
        <p className="font-heading text-base font-extrabold leading-tight">{note.title}</p>
        <p className="text-sm opacity-80">{note.body}</p>
      </div>
    </div>
  );
}
