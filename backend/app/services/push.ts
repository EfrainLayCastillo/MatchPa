import webpush from 'web-push'
import logger from '@adonisjs/core/services/logger'
import PushSubscription from '#models/push_subscription'
import env from '#start/env'

export interface PushPayload {
  title: string
  body: string
  url: string
}

const PUSH_TIMEOUT_MS = 5000
const PUSH_TTL_SECONDS = 6 * 60 * 60
const GONE_STATUSES = [404, 410]

let configured: boolean | null = null

function configure(): boolean {
  if (configured !== null) return configured
  const publicKey = env.get('VAPID_PUBLIC_KEY')
  const privateKey = env.get('VAPID_PRIVATE_KEY')?.release()
  const subject = env.get('VAPID_SUBJECT')
  configured = Boolean(publicKey && privateKey && subject)
  if (configured) webpush.setVapidDetails(subject!, publicKey!, privateKey!)
  else
    logger.warn('web push disabled: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY or VAPID_SUBJECT missing')
  return configured
}

async function send(subscription: PushSubscription, payload: string): Promise<void> {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      payload,
      { timeout: PUSH_TIMEOUT_MS, TTL: PUSH_TTL_SECONDS, urgency: 'high' }
    )
  } catch (error) {
    const { statusCode, body, message } = error as {
      statusCode?: number
      body?: string
      message?: string
    }
    if (statusCode && GONE_STATUSES.includes(statusCode)) return subscription.delete()
    logger.warn(
      { statusCode, reason: body || message, subscriptionId: subscription.id },
      'web push failed'
    )
  }
}

/** Sends to every device of the users. Dead subscriptions (404/410) are removed. */
export async function notifyUsers(userIds: number[], payload: PushPayload): Promise<void> {
  if (userIds.length === 0 || !configure()) return

  const subscriptions = await PushSubscription.query().whereIn('user_id', userIds)
  const body = JSON.stringify(payload)
  await Promise.all(subscriptions.map((subscription) => send(subscription, body)))
}

/** Push never blocks or fails the request: the change is already committed and realtime already went out. */
export function pushInBackground(...pending: (Promise<void> | undefined)[]): void {
  Promise.all(pending).catch((error) => logger.error({ err: error }, 'web push batch failed'))
}
