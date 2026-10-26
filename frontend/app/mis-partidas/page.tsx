import { MyMatchesView } from "@/components/matches/my-matches-view";
import { SessionGate } from "@/components/matchpa/session-gate";

export default function MyMatchesPage() {
  return (
    <SessionGate>
      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 pb-16 pt-6">
        <MyMatchesView />
      </div>
    </SessionGate>
  );
}
