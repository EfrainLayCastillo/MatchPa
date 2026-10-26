import webpush from 'web-push'
import PushSubscription from '#models/push_subscription'
import env from '#start/env'

export interface PushPayload {
  title: string
  body: string
  url: string
}

let configured = false

function configure(): boolean {
  if (configured) return true
  const publicKey = env.get('VAPID_PUBLIC_KEY')
  const privateKey = env.get('VAPID_PRIVATE_KEY')?.release()
  const subject = env.get('VAPID_SUBJECT')
  if (!publicKey || !privateKey || !subject) return false

  webpush.setVapidDetails(subject, publicKey, privateKey)
  configured = true
  return true
}

/** Sends to every device of the users. Dead subscriptions (404/410) are removed. */
export async function notifyUsers(userIds: number[], payload: PushPayload): Promise<void> {
  if (userIds.length === 0 || !configure()) return

  const subscriptions = await PushSubscription.query().whereIn('user_id', userIds)
  await Promise.all(
    subscriptions.map((subscription) =>
      webpush
        .sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          JSON.stringify(payload)
        )
        .catch(async (error: { statusCode?: number }) => {
          if (error.statusCode === 404 || error.statusCode === 410) await subscription.delete()
        })
    )
  )
}
