import { api } from "./api";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const DISMISSED_KEY = "matchpa.push-dismissed";
const RESUBSCRIBE_KEY = "matchpa.push-resubscribe";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333/api";
const WORKER_URL = `/sw.js?api=${encodeURIComponent(API_URL)}`;

export type PushResult = "enabled" | "denied" | "unsupported";

export function pushSupported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export function isIosWithoutInstall(): boolean {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
  return ios && !window.matchMedia("(display-mode: standalone)").matches;
}

export function shouldAskForPush(): boolean {
  if (!pushSupported()) return false;
  if (Notification.permission === "granted") return readFlag(RESUBSCRIBE_KEY);
  if (Notification.permission !== "default") return false;
  return !readFlag(DISMISSED_KEY);
}

function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}

function writeFlag(key: string, on: boolean): void {
  try {
    if (on) localStorage.setItem(key, "1");
    else localStorage.removeItem(key);
  } catch {
    // Storage can be blocked; the prompt will simply show again next time.
  }
}

export function dismissPushPrompt(): void {
  writeFlag(DISMISSED_KEY, true);
  writeFlag(RESUBSCRIBE_KEY, false);
}

export async function enablePush(): Promise<PushResult> {
  if (!pushSupported()) return "unsupported";
  if ((await Notification.requestPermission()) !== "granted") return "denied";

  const registration = await navigator.serviceWorker.register(WORKER_URL);
  await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToBytes(VAPID_PUBLIC_KEY),
  });
  await api.savePushSubscription(subscription.toJSON());
  writeFlag(RESUBSCRIBE_KEY, false);
  return "enabled";
}

export async function disablePush(): Promise<void> {
  const registration = await navigator.serviceWorker.getRegistration("/sw.js");
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;
  try {
    await api.removePushSubscription(subscription.endpoint);
  } finally {
    await subscription.unsubscribe();
  }
}

export async function forgetPushOnLogout(): Promise<void> {
  if (!pushSupported()) return;
  await disablePush().catch(() => {});
  // The browser permission survives logout, so the opt-in modal re-offers it (no native prompt) at the next publish or join.
  if (Notification.permission === "granted") writeFlag(RESUBSCRIBE_KEY, true);
}

/** Re-sends the device's subscription so the backend recovers one it dropped or never got after a rotation. */
export async function syncPushSubscription(): Promise<void> {
  if (!pushSupported() || Notification.permission !== "granted") return;
  const registration = await navigator.serviceWorker.getRegistration("/sw.js");
  await registration?.update();
  const subscription = await registration?.pushManager.getSubscription();
  if (subscription) await api.savePushSubscription(subscription.toJSON());
}

export async function isPushEnabled(): Promise<boolean> {
  if (!pushSupported() || Notification.permission !== "granted") return false;
  const registration = await navigator.serviceWorker.getRegistration("/sw.js");
  return Boolean(await registration?.pushManager.getSubscription());
}

function urlBase64ToBytes(base64: string): BufferSource {
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const raw = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}
