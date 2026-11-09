import { formatDistance } from "@/lib/distance";

export function DistanceTag({ km }: { km: number }) {
  return <span className="font-semibold text-brand-teal dark:text-brand-lime"> · {formatDistance(km)}</span>;
}
