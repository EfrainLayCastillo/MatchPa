import type { Branch } from "./types";

export interface Point {
  latitude: number;
  longitude: number;
}

export interface Zone {
  label: string;
  point: Point;
}

const EARTH_RADIUS_KM = 6371;
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export function distanceKm(from: Point, to: Point): number {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLng = toRadians(to.longitude - from.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function branchPoint(branch: Branch | undefined): Point | null {
  if (branch?.latitude == null || branch.longitude == null) return null;
  return { latitude: branch.latitude, longitude: branch.longitude };
}

export function distanceToBranch(origin: Point | null, branch: Branch | undefined): number | null {
  const point = branchPoint(branch);
  return origin && point ? distanceKm(origin, point) : null;
}

export function formatDistance(km: number): string {
  return km < 1 ? `a ${Math.round(km * 1000)} m` : `a ${Math.round(km)} km`;
}

export function zonesFrom(branches: Branch[]): Zone[] {
  const groups = new Map<string, Point[]>();
  for (const branch of branches) {
    const point = branchPoint(branch);
    if (point) groups.set(branch.locationLabel, [...(groups.get(branch.locationLabel) ?? []), point]);
  }
  return [...groups]
    .map(([label, points]) => ({ label, point: average(points) }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));
}

function average(points: Point[]): Point {
  const sum = points.reduce((acc, p) => ({ latitude: acc.latitude + p.latitude, longitude: acc.longitude + p.longitude }));
  return { latitude: sum.latitude / points.length, longitude: sum.longitude / points.length };
}

/** Closest first by whole kilometres; unknown distances last; ties fall back to `tieBreak`. */
export function byDistance<T>(distanceOf: (item: T) => number | null, tieBreak: (a: T, b: T) => number) {
  return (a: T, b: T) => rank(distanceOf(a)) - rank(distanceOf(b)) || tieBreak(a, b);
}

const rank = (km: number | null) => (km === null ? Number.POSITIVE_INFINITY : Math.round(km));
