import { GlobeIcon, MapPinIcon, MessageCircleIcon, PhoneIcon } from "lucide-react";
import { isPanamaMobile, whatsappUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import type { Branch } from "@/lib/types";

function directionsHref(branch: Branch): string | null {
  if (branch.latitude !== null && branch.longitude !== null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${branch.latitude},${branch.longitude}`;
  }
  return branch.mapsUrl || null;
}

function websiteLabel(url: string): string {
  return url.includes("instagram.com") ? "Instagram" : "Sitio web";
}

export function BranchContact({ branch }: { branch: Branch }) {
  const directions = directionsHref(branch);
  const links = [
    directions && { label: "Cómo llegar", href: directions, icon: MapPinIcon, external: true },
    branch.phone && isPanamaMobile(branch.phone) && { label: "WhatsApp", href: whatsappUrl(branch.phone), icon: MessageCircleIcon, external: true },
    branch.phone && { label: "Llamar", href: `tel:${branch.phone}`, icon: PhoneIcon, external: false },
    branch.website && { label: websiteLabel(branch.website), href: branch.website, icon: GlobeIcon, external: true },
  ].filter((link) => !!link);

  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {links.map(({ label, href, icon: Icon, external }) => (
        <Button key={label} asChild variant="outline" size="sm" className="h-11">
          <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            <Icon className="size-4" />
            {label}
          </a>
        </Button>
      ))}
    </div>
  );
}
