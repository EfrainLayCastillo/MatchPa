import { SessionGate } from "@/components/matchpa/session-gate";
import { ProfileView } from "@/components/profile/profile-view";

export default function ProfilePage() {
  return (
    <SessionGate verifyBanner={false}>
      <ProfileView />
    </SessionGate>
  );
}
