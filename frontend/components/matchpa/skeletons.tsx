import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder for a list of match or player cards. */
export function CardListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <ul className="grid gap-3 md:grid-cols-2" aria-busy="true" aria-label="Cargando">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="space-y-3 rounded-xl border border-border bg-card p-4">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Placeholder for a match page: header, players and the action area. */
export function DetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 pb-16 pt-6" aria-busy="true" aria-label="Cargando">
      <div className="space-y-3">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <Skeleton className="h-12 w-full" />
    </div>
  );
}
