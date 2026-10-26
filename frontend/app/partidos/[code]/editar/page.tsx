import { Suspense } from "react";
import { MatchEdit } from "@/components/match/match-edit";
import { SessionGate } from "@/components/matchpa/session-gate";

interface EditMatchPageProps {
  params: Promise<{ code: string }>;
}

export default function EditMatchPage({ params }: EditMatchPageProps) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted-foreground">Cargando…</p>}>
      <EditContent params={params} />
    </Suspense>
  );
}

async function EditContent({ params }: EditMatchPageProps) {
  const { code } = await params;
  return (
    <SessionGate>
      <div className="mx-auto w-full max-w-xl px-4 pb-16 pt-6">
        <MatchEdit code={code} />
      </div>
    </SessionGate>
  );
}
