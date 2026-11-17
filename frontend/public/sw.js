// Minimal service worker: Web Push and notification clicks only. No offline cache.
const API_URL = new URL(self.location.href).searchParams.get("api") ?? "/api";
const DEFAULT_URL = "/lobby";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

function readPayload(event) {
  if (!event.data) return {};
  try {
    return event.data.json();
  } catch {
    return { body: event.data.text() };
  }
}

self.addEventListener("push", (event) => {
  const data = readPayload(event);
  const url = data.url ?? DEFAULT_URL;
  event.waitUntil(
    self.registration.showNotification(data.title ?? "MatchPa", {
      body: data.body ?? "",
      icon: "/icon.svg",
      badge: "/icon.svg",
      tag: url,
      renotify: true,
      data: { url },
    }),
  );
});

function sameOriginUrl(url) {
  const parsed = new URL(url, self.location.origin);
  return parsed.origin === self.location.origin ? parsed.href : new URL(DEFAULT_URL, self.location.origin).href;
}

async function focusOrOpen(url) {
  const target = sameOriginUrl(url);
  const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  const exact = windows.find((client) => client.url === target);
  if (exact) return exact.focus();
  const [any] = windows;
  if (any) return any.navigate(target).then((client) => (client ?? any).focus());
  return self.clients.openWindow(target);
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(focusOrOpen(event.notification.data?.url ?? DEFAULT_URL));
});

async function resubscribe(event) {
  const subscription =
    event.newSubscription ??
    (await self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: event.oldSubscription?.options.applicationServerKey,
    }));
  await fetch(`${API_URL}/push-subscriptions`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(subscription.toJSON()),
  });
}

self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(resubscribe(event).catch(() => {}));
});
