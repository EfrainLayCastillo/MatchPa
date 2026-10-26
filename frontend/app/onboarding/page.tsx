import { PageTitle } from "@/components/matchpa/page-title";
import { SessionGate } from "@/components/matchpa/session-gate";
import { ProfileForm } from "@/components/profile/profile-form";

export default function OnboardingPage() {
  return (
    <SessionGate requireProfile={false}>
      <div className="mx-auto w-full max-w-md space-y-8 px-4 py-10">
        <PageTitle hint="Solo te lo pedimos una vez. Así los organizadores saben con quién juegan.">
          Cuéntanos de ti
        </PageTitle>
        <ProfileForm mode="onboarding" />
      </div>
    </SessionGate>
  );
}
