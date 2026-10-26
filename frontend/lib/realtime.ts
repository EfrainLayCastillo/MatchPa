import { Transmit } from "@adonisjs/transmit-client";
import { API_ORIGIN, USING_MOCKS } from "./api";

let client: Transmit | null = null;

function transmit(): Transmit {
  client ??= new Transmit({
    baseUrl: API_ORIGIN,
    eventSourceFactory: (url) => new EventSource(url, { withCredentials: true }),
  });
  return client;
}

/** Calls `onMessage` for every event on the channel. Returns the cleanup function. */
export function subscribe(channel: string, onMessage: () => void): () => void {
  if (USING_MOCKS) return () => {};

  const subscription = transmit().subscription(channel);
  subscription.create().catch(() => {});
  const stopListening = subscription.onMessage(onMessage);
  return () => {
    stopListening();
    subscription.delete().catch(() => {});
  };
}
