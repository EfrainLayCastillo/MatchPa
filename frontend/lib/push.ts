import { api } from "./api";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const DISMISSED_KEY = "matchpa.push-dismissed";

export type PushResult = "enabled" | "denied" | "unsupported";

export function pushSupported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export function isIosWithoutInstall(): boolean {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
  return ios && !window.matchMedia("(display-mode: standalone)").matches;
}

export function shouldAskForPush(): boolean {
  if (!pushSupported() || Notification.permission !== "default") return false;
  try {
    return localStorage.getItem(DISMISSED_KEY) === null;
  } catch {
    return true;
  }
}

export function dismissPushPrompt(): void {
  try {
    localStorage.setItem(DISMISSED_KEY, "1");
  } catch {
    // Storage can be blocked; the prompt will simply show again next time.
  }
}

export async function enablePush(): Promise<PushResult> {
  if (!pushSupported()) return "unsupported";
  if ((await Notification.requestPermission()) !== "granted") return "denied";

  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToBytes(VAPID_PUBLIC_KEY),
  });
  await api.savePushSubscription(subscription.toJSON());
  return "enabled";
}

export async function disablePush(): Promise<void> {
  const registration = await navigator.serviceWorker.getRegistration("/sw.js");
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;
  await api.removePushSubscription(subscription.endpoint);
  await subscription.unsubscribe();
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
