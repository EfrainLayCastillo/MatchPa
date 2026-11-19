import { SessionGate } from "@/components/matchpa/session-gate";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export default function OnboardingPage() {
  return (
    <SessionGate requireProfile={false} verifyBanner={false}>
      <OnboardingFlow />
    </SessionGate>
  );
}
