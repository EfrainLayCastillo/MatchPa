import type { Metadata } from "next";
import { Suspense } from "react";
import { MatchDetail } from "@/components/match/match-detail";
import { SITE_URL } from "@/lib/config";
import { formatMatchTime } from "@/lib/format";
import { fetchPublicMatch } from "@/lib/public-match";

interface MatchPageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: MatchPageProps): Promise<Metadata> {
  const { code } = await params;
  const match = await fetchPublicMatch(code);
  if (!match) return { title: "Partido" };

  const title = `${match.company.name} · ${formatMatchTime(match.startsAt)}`;
  const description = `Cancha ${match.courtNumber}, ${match.company.name}. Faltan ${match.spotsLeft} puestos.`;
  return {
    title,
    description,
    openGraph: { title, description, url: `${SITE_URL}/partidos/${code}`, siteName: "MatchPa", locale: "es_PA" },
  };
}

export default function MatchPage({ params }: MatchPageProps) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted-foreground">Cargando partido…</p>}>
      <MatchContent params={params} />
    </Suspense>
  );
}

async function MatchContent({ params }: MatchPageProps) {
  const { code } = await params;
  return <MatchDetail code={code} />;
}
