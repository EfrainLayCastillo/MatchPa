import { Suspense } from "react";
import { PageTitle } from "@/components/matchpa/page-title";
import { SessionGate } from "@/components/matchpa/session-gate";
import { MatchForm } from "@/components/match/match-form";

export default function NewMatchPage() {
  return (
    <SessionGate>
      <div className="mx-auto w-full max-w-xl space-y-8 px-4 pb-16 pt-6">
        <PageTitle>Crear nuevo partido</PageTitle>
        <Suspense>
          <MatchForm />
        </Suspense>
      </div>
    </SessionGate>
  );
}
