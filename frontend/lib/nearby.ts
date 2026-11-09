"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { Point, Zone } from "./distance";

export type NearbyStatus = "idle" | "locating" | "denied" | "unsupported";

export interface NearbyOrigin {
  point: Point;
  zone: string | null;
}

const ZONE_KEY = "matchpa:nearby-zone";
const POSITION_OPTIONS: PositionOptions = { enableHighAccuracy: false, maximumAge: 10 * 60_000, timeout: 15_000 };

export function useNearby() {
  const [position, setPosition] = useState<Point | null>(null);
  const [status, setStatus] = useState<NearbyStatus>("idle");
  const storedZone = useSyncExternalStore(subscribeZone, readZoneRaw, () => null);
  const zone = useMemo(() => parseZone(storedZone), [storedZone]);
  const origin: NearbyOrigin | null = zone
    ? { point: zone.point, zone: zone.label }
    : position && { point: position, zone: null };

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) return setStatus("unsupported");
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        writeZone(null);
        setPosition({ latitude: coords.latitude, longitude: coords.longitude });
        setStatus("idle");
      },
      (error) => setStatus(error.code === error.PERMISSION_DENIED ? "denied" : "unsupported"),
      POSITION_OPTIONS,
    );
  }, []);

  const chooseZone = useCallback((next: Zone) => writeZone(next), []);

  const clear = useCallback(() => {
    writeZone(null);
    setPosition(null);
  }, []);

  useEffect(() => {
    if (readZoneRaw()) return;
    navigator.permissions
      ?.query({ name: "geolocation" })
      .then((permission) => {
        if (permission.state === "granted") locate();
        if (permission.state === "denied") setStatus("denied");
      })
      .catch(() => {});
  }, [locate]);

  return { origin, status, locate, chooseZone, clear };
}

const zoneListeners = new Set<() => void>();

function subscribeZone(listener: () => void) {
  zoneListeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    zoneListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readZoneRaw(): string | null {
  return localStorage.getItem(ZONE_KEY);
}

function writeZone(zone: Zone | null) {
  if (zone) localStorage.setItem(ZONE_KEY, JSON.stringify(zone));
  else localStorage.removeItem(ZONE_KEY);
  zoneListeners.forEach((listener) => listener());
}

function parseZone(raw: string | null): Zone | null {
  try {
    const zone = JSON.parse(raw ?? "null") as Zone | null;
    return zone?.label && zone.point ? zone : null;
  } catch {
    return null;
  }
}
