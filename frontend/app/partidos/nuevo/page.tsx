import { PageTitle } from "@/components/matchpa/page-title";
import { SessionGate } from "@/components/matchpa/session-gate";
import { MatchForm } from "@/components/match/match-form";

export default function NewMatchPage() {
  return (
    <SessionGate>
      <div className="mx-auto w-full max-w-xl space-y-8 px-4 pb-16 pt-6">
        <PageTitle hint="Ya tienes cancha? Publica los puestos que te faltan.">Publicar partido</PageTitle>
        <MatchForm />
      </div>
    </SessionGate>
  );
}
