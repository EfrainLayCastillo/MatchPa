import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/format";
import type { MatchStatus } from "@/lib/types";

const STYLES: Record<MatchStatus, string> = {
  open: "bg-brand-lime text-brand-teal",
  full: "bg-brand-teal text-brand-ivory dark:bg-brand-ivory dark:text-brand-teal",
  closed: "bg-muted text-muted-foreground",
  expired: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status, className }: { status: MatchStatus; className?: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", STYLES[status], className)}>
      {STATUS_LABELS[status]}
    </span>
  );
}
