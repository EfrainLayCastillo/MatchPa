import {
  BanIcon,
  CalendarCheckIcon,
  CheckCircle2Icon,
  LockIcon,
  MailIcon,
  UserMinusIcon,
  UserPlusIcon,
  UsersIcon,
  XCircleIcon,
  type LucideIcon,
} from "lucide-react";
import type { InboxNotification, NotificationType } from "./types";

type Match = InboxNotification["match"];

interface Copy {
  title: string;
  body: (match: Match) => string;
  icon: LucideIcon;
}

const fixed = (text: string) => () => text;

export const NOTIFICATION_COPY: Record<NotificationType, Copy> = {
  join_requested: { title: "Nueva solicitud", body: fixed("Alguien quiere unirse a tu partido"), icon: UserPlusIcon },
  invited: { title: "Ey Pa, ¿juegas?", body: fixed("Te invitaron a un partido"), icon: MailIcon },
  request_accepted: { title: "¡Match!", body: fixed("Ya estás en el partido"), icon: CheckCircle2Icon },
  invitation_accepted: { title: "¡Match!", body: fixed("Aceptaron tu invitación"), icon: CheckCircle2Icon },
  request_rejected: { title: "Solicitud rechazada", body: fixed("Esta vez no hubo lugar"), icon: XCircleIcon },
  invitation_rejected: { title: "Invitación rechazada", body: fixed("No pudo esta vez"), icon: XCircleIcon },
  player_left: { title: "Se salió un jugador", body: fixed("Hay un puesto libre"), icon: UserMinusIcon },
  player_removed: { title: "Te sacaron del partido", body: fixed("El organizador te quitó del partido"), icon: UserMinusIcon },
  match_filled: { title: "¡Match!", body: (m) => `Ya están los ${m.maxPlayers}`, icon: UsersIcon },
  court_booked: { title: "Cancha confirmada", body: courtBody, icon: CalendarCheckIcon },
  court_changed: { title: "Cambio de cancha", body: courtBody, icon: CalendarCheckIcon },
  court_unbooked: { title: "Cancha por reservar", body: fixed("La cancha volvió a quedar por reservar"), icon: CalendarCheckIcon },
  match_closed: { title: "Partido cerrado", body: fixed("El organizador cerró la búsqueda"), icon: LockIcon },
  match_cancelled: { title: "Partido cancelado", body: fixed("El organizador eliminó su cuenta"), icon: BanIcon },
  player_deleted: { title: "Se liberó un puesto", body: fixed("Un jugador eliminó su cuenta"), icon: UserMinusIcon },
};

function courtBody(match: Match): string {
  return match.courtNumber === null ? match.branchName : `${match.branchName}, cancha ${match.courtNumber}`;
}
