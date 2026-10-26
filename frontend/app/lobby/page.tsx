import { LobbyView } from "@/components/lobby/lobby-view";
import { SessionGate } from "@/components/matchpa/session-gate";

export default function LobbyPage() {
  return (
    <SessionGate>
      <LobbyView />
    </SessionGate>
  );
}
