import { MailIcon, MailOpenIcon, type LucideIcon } from "lucide-react";
import { PaddleIcon } from "@/components/matchpa/paddle-icon";
import { cn } from "@/lib/utils";

interface InviteSurfaceProps {
  title: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  role?: "status";
  className?: string;
  children: React.ReactNode;
}

/** Lime invitation card: envelope badge, script title, content and optional actions on the right. */
export function InviteSurface({
  title,
  icon,
  actions,
  role,
  className,
  children,
}: InviteSurfaceProps) {
  return (
    <div
      role={role}
      className={cn(
        "relative flex items-center gap-3 overflow-hidden rounded-xl bg-brand-lime p-3 text-brand-teal shadow-sm",
        className,
      )}
    >
      <MailIcon
        aria-hidden
        className="pointer-events-none absolute -right-4 -bottom-5 size-24 rotate-12 text-brand-teal/10"
      />
      <EnvelopeBadge icon={icon} />
      <div className="relative min-w-0 flex-1">
        <p className="font-script text-lg leading-none">{title}</p>
        <div className="mt-1 text-sm">{children}</div>
      </div>
      {actions ? (
        <div className="relative flex shrink-0 flex-col gap-1.5">{actions}</div>
      ) : null}
    </div>
  );
}

function EnvelopeBadge({ icon: Icon = MailOpenIcon }: { icon?: LucideIcon }) {
  return (
    <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-teal text-brand-lime">
      <Icon aria-hidden className="size-5" />
      <span aria-hidden className="absolute -top-1.5 -right-1.5 flex size-6">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-ivory opacity-60 motion-reduce:hidden" />
        <span className="relative flex size-6 items-center justify-center rounded-full bg-brand-ivory text-brand-teal ring-2 ring-brand-lime">
          <PaddleIcon className="size-3.5" />
        </span>
      </span>
    </span>
  );
}

export const INVITE_PRIMARY =
  "bg-brand-teal font-bold text-brand-ivory hover:bg-brand-teal/90";
export const INVITE_SECONDARY =
  "text-brand-teal hover:bg-brand-teal/10 hover:text-brand-teal";
