"use client";

import { usePathname } from "next/navigation";
import { TermsDialog } from "@/components/legal/terms-dialog";
import { useSession } from "@/lib/session";

const LEGAL_PATHS = ["/privacidad", "/terminos"];

export function TermsGate() {
  const { user } = useSession();
  const pathname = usePathname();
  if (!user || user.termsAccepted || LEGAL_PATHS.includes(pathname)) return null;
  return <TermsDialog />;
}
