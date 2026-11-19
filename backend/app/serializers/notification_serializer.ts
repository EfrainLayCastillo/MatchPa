import type { Inbox } from '#services/notification_inbox'

export function serializeInbox({ unreadCount, items }: Inbox) {
  return {
    unreadCount,
    items: items.map(({ notification, unread }) => ({
      id: notification.id,
      type: notification.type,
      createdAt: notification.createdAt.toUTC().toISO(),
      unread,
      match: {
        code: notification.match.code,
        branchName: notification.match.branch.name,
        startsAt: notification.match.startsAt.toUTC().toISO(),
        maxPlayers: notification.match.maxPlayers,
        courtNumber: notification.match.courtNumber,
      },
    })),
  }
}
