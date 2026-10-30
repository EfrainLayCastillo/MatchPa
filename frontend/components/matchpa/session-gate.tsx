"use client";

import { LoadFailed } from "@/components/matchpa/load-failed";
import { DetailSkeleton } from "@/components/matchpa/skeletons";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { isProfileComplete, useSession } from "@/lib/session";

interface SessionGateProps {
  children: React.ReactNode;
  /** Pages that need a complete profile (category, gender, phone) redirect to onboarding. */
  requireProfile?: boolean;
}

export function SessionGate({ children, requireProfile = true }: SessionGateProps) {
  const { user, loading, failed, refresh } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const profileMissing = user !== null && requireProfile && !isProfileComplete(user);

  useEffect(() => {
    if (loading || failed) return;
    if (!user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    else if (profileMissing) router.replace("/onboarding");
  }, [loading, failed, user, profileMissing, pathname, router]);

  if (!loading && failed && !user) {
    return (
      <div className="mx-auto w-full max-w-md px-4 pt-10">
        <LoadFailed onRetry={refresh} />
      </div>
    );
  }
  if (loading || !user || profileMissing) {
    return (
      <div className="flex flex-1 flex-col">
        <DetailSkeleton />
      </div>
    );
  }
  return children;
}
