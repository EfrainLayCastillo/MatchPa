"use client";

import { VerifyEmailBanner } from "@/components/auth/verify-email-banner";
import { LoadFailed } from "@/components/matchpa/load-failed";
import { SlowLoad } from "@/components/matchpa/slow-load";
import { DetailSkeleton } from "@/components/matchpa/skeletons";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { isProfileComplete, useSession } from "@/lib/session";

interface SessionGateProps {
  children: React.ReactNode;
  /** Pages that need a complete profile (category, gender) redirect to onboarding. */
  requireProfile?: boolean;
  verifyBanner?: boolean;
  allowAnonymous?: boolean;
}

export function SessionGate({
  children,
  requireProfile = true,
  verifyBanner = true,
  allowAnonymous = false,
}: SessionGateProps) {
  const { user, loading, failed, refresh } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const profileMissing = user !== null && requireProfile && !isProfileComplete(user);

  useEffect(() => {
    if (loading || failed) return;
    if (!user && !allowAnonymous) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    else if (profileMissing) router.replace("/onboarding");
  }, [loading, failed, user, allowAnonymous, profileMissing, pathname, router]);

  if (!loading && failed && !user) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 pt-10">
        <LoadFailed onRetry={refresh} />
      </div>
    );
  }
  if (loading || (!user && !allowAnonymous) || profileMissing) {
    return (
      <div className="flex flex-1 flex-col">
        <SlowLoad><DetailSkeleton /></SlowLoad>
      </div>
    );
  }
  return (
    <>
      {verifyBanner ? <VerifyEmailBanner /> : null}
      {children}
    </>
  );
}
