import { GlobeIcon, MapPinIcon, PhoneIcon, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Branch } from "@/lib/types";

export function directionsHref(branch: Branch): string | null {
  if (branch.latitude !== null && branch.longitude !== null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${branch.latitude},${branch.longitude}`;
  }
  return branch.mapsUrl || null;
}

function websiteLabel(url: string): string {
  return url.includes("instagram.com") ? "Instagram" : "Sitio web";
}

export function BranchDetails({ branch }: { branch: Branch }) {
  return (
    <Card className="gap-2 px-4">
      <p className="font-heading text-base font-bold leading-tight">{branch.name}</p>
      <DetailRow icon={MapPinIcon}>{branch.locationLabel}</DetailRow>
      {branch.phone ? (
        <DetailRow icon={PhoneIcon}>
          <a href={`tel:${branch.phone}`} className="underline-offset-4 hover:underline">
            {branch.phone}
          </a>
        </DetailRow>
      ) : null}
      {branch.website ? (
        <DetailRow icon={GlobeIcon}>
          <a
            href={branch.website}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand-teal underline-offset-4 hover:underline dark:text-brand-lime"
          >
            {websiteLabel(branch.website)}
          </a>
        </DetailRow>
      ) : null}
    </Card>
  );
}

function DetailRow({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <p className="flex min-h-6 items-center gap-2 text-sm text-muted-foreground">
      <Icon aria-hidden className="size-4 shrink-0 text-brand-teal dark:text-brand-lime" />
      <span className="min-w-0 truncate">{children}</span>
    </p>
  );
}
