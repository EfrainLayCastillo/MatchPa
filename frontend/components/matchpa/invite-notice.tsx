import { MailCheckIcon, SendIcon } from "lucide-react";
import { InviteSurface } from "@/components/matchpa/invite-surface";

interface InviteNoticeProps {
  sent?: boolean;
  children: React.ReactNode;
}

export function InviteNotice({ sent = false, children }: InviteNoticeProps) {
  return (
    <InviteSurface
      title={sent ? "¡Invitación enviada!" : "Invitación lista"}
      icon={sent ? MailCheckIcon : SendIcon}
      role={sent ? "status" : undefined}
    >
      {children}
    </InviteSurface>
  );
}
