// Minimal service worker: Web Push and notification clicks only. No offline cache.
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? "MatchPa", {
      body: data.body ?? "",
      icon: "/icon.svg",
      badge: "/icon.svg",
      data: { url: data.url ?? "/lobby" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/lobby";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const open = clients.find((client) => client.url.includes(url));
      return open ? open.focus() : self.clients.openWindow(url);
    }),
  );
});
