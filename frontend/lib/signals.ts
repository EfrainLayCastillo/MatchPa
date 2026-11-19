import { CarIcon, ClockIcon, MapPinCheckIcon, type LucideIcon } from "lucide-react";
import type { SignalKind } from "./types";

export const SIGNALS: Record<SignalKind, { label: string; icon: LucideIcon }> = {
  on_the_way: { label: "Voy en camino", icon: CarIcon },
  arrived: { label: "Ya llegué", icon: MapPinCheckIcon },
  running_late: { label: "Llego tarde", icon: ClockIcon },
};
