import Link from "next/link";
import { SessionGate } from "@/components/matchpa/session-gate";
import { ProfileView } from "@/components/profile/profile-view";

export default function ProfilePage() {
  return (
    <SessionGate verifyBanner={false}>
      <ProfileView />
      <nav aria-label="Legal" className="mx-auto flex w-full max-w-3xl gap-4 px-4 pb-10 text-sm text-muted-foreground">
        <Link href="/terminos" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">Términos</Link>
        <Link href="/privacidad" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">Privacidad</Link>
      </nav>
    </SessionGate>
  );
}
