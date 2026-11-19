import { DateTime } from 'luxon'
import Notification from '#models/notification'
import type User from '#models/user'

const WINDOW_DAYS = 30
const MAX_ITEMS = 50

export interface Inbox {
  unreadCount: number
  items: { notification: Notification; unread: boolean }[]
}

export async function listFor(user: User): Promise<Inbox> {
  const since = DateTime.now().minus({ days: WINDOW_DAYS })
  const readAt = user.notificationsReadAt
  const inWindow = () =>
    Notification.query().where('user_id', user.id).where('created_at', '>=', since.toSQL()!)

  const notifications = await inWindow()
    .preload('match', (query) => query.preload('branch'))
    .orderBy('created_at', 'desc')
    .orderBy('id', 'desc')
    .limit(MAX_ITEMS)
  const unreadQuery = inWindow()
  if (readAt) unreadQuery.where('created_at', '>', readAt.toSQL()!)
  const [{ $extras }] = await unreadQuery.count('* as total')

  return {
    unreadCount: Number($extras.total),
    items: notifications.map((notification) => ({
      notification,
      unread: readAt === null || notification.createdAt > readAt,
    })),
  }
}

export async function markRead(user: User): Promise<void> {
  user.notificationsReadAt = DateTime.now()
  await user.save()
}
