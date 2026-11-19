"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { CardListSkeleton } from "@/components/matchpa/skeletons";
import { LoadFailed } from "@/components/matchpa/load-failed";
import { PageTitle } from "@/components/matchpa/page-title";
import { lobbyKeys, useMarkNotificationsRead, useNotifications } from "@/lib/lobby-queries";
import { NOTIFICATION_COPY } from "@/lib/notification-copy";
import { formatDateTime } from "@/lib/panamaFormatDate";
import { subscribe } from "@/lib/realtime";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import type { InboxNotification } from "@/lib/types";
import { BackLink } from "@/components/matchpa/back-link";

export function NotificationsView() {
  const { user } = useSession();
  const query = useNotifications();
  const markRead = useMarkNotificationsRead();
  const queryClient = useQueryClient();
  const userId = user?.id;

  useEffect(
    () =>
      userId === undefined
        ? undefined
        : subscribe(`users/${userId}`, () =>
            queryClient.invalidateQueries({ queryKey: lobbyKeys.notifications }),
          ),
    [userId, queryClient],
  );

  const unreadCount = query.data?.unreadCount ?? 0;
  const fresh = query.isFetchedAfterMount && !query.isFetching;
  const { mutate, isPending } = markRead;
  useEffect(() => {
    if (unreadCount > 0 && fresh && !isPending) mutate();
  }, [unreadCount, fresh, isPending, mutate]);

  return (
    <>
      <BackLink />
      <PageTitle className="text-2xl sm:text-3xl">Notificaciones</PageTitle>
      <Content query={query} />
    </>
  );
}

function Content({ query }: { query: ReturnType<typeof useNotifications> }) {
  if (query.isPending) return <CardListSkeleton />;
  if (query.isError) return <LoadFailed onRetry={() => query.refetch()} />;
  if (query.data.items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
        Aquí verás tus solicitudes, invitaciones y avisos de tus partidos.
      </p>
    );
  }
  return (
    <ul className="grid grid-cols-1 gap-2">
      {query.data.items.map((item) => (
        <li key={item.id}>
          <NotificationCard item={item} />
        </li>
      ))}
    </ul>
  );
}

function NotificationCard({ item }: { item: InboxNotification }) {
  const copy = NOTIFICATION_COPY[item.type];
  const Icon = copy.icon;
  return (
    <Link
      href={`/partidos/${item.match.code}`}
      className={cn(
        "flex min-h-11 items-start gap-3 rounded-xl border p-3 transition-colors hover:bg-secondary",
        item.unread ? "border-primary bg-accent" : "bg-card",
      )}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-heading font-semibold">
            {copy.title}
            {item.unread ? <span className="sr-only"> (nueva)</span> : null}
          </p>
          <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(item.createdAt)}</span>
        </div>
        <p className="text-sm">{copy.body(item.match)}</p>
        <p className="truncate text-xs text-muted-foreground">
          {item.match.branchName} · {formatDateTime(item.match.startsAt)}
        </p>
      </div>
      {item.unread ? <span className="mt-2 size-2.5 shrink-0 rounded-full bg-brand-teal" aria-hidden /> : null}
    </Link>
  );
}

function timeAgo(iso: string): string {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  return `Hace ${Math.round(hours / 24)} d`;
}
