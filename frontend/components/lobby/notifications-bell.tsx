"use client";

import Link from "next/link";
import { BellIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/lib/lobby-queries";

export function NotificationsBell() {
  const { data } = useNotifications();
  const count = data?.unreadCount ?? 0;
  const label = count > 0 ? `Notificaciones, ${count} sin leer` : "Notificaciones";
  return (
    <Button asChild variant="ghost" size="icon" className="relative ml-1 size-12 shrink-0">
      <Link href="/notificaciones" aria-label={label}>
        <BellIcon className="size-6 fill-brand-teal" />
        {count > 0 ? (
          <span
            aria-hidden
            className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-0.5 text-[10px] font-bold leading-none text-primary-foreground ring-2 ring-background"
          >
            {count > 9 ? "9+" : count}
          </span>
        ) : null}
      </Link>
    </Button>
  );
}
