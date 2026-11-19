import { LandPlotIcon, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { courtLabel } from "@/lib/format";

export function CourtBadge({ match }: { match: { courtNumber: number | null } }) {
  return (
    <IconBadge
      icon={LandPlotIcon}
      className={match.courtNumber === null ? "bg-brand-lime text-brand-teal" : undefined}
    >
      {courtLabel(match)}
    </IconBadge>
  );
}

export function IconBadge({
  icon: Icon,
  children,
  className,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Badge variant="secondary" className={className}>
      <Icon data-icon="inline-start" />
      {children}
    </Badge>
  );
}

