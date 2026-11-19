import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackLinkProps {
  href?: string;
  label?: string;
  className?: string;
}

export function BackLink({ href = "/lobby", label = "Lobby", className }: BackLinkProps) {
  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className={cn(
        "relative -mb-4 -ml-2 h-8 px-2 text-xs after:absolute after:-inset-y-1.5 after:inset-x-0 after:content-['']",
        className,
      )}
    >
      <Link href={href}>
        <ArrowLeftIcon data-icon="inline-start" />
        {label}
      </Link>
    </Button>
  );
}
