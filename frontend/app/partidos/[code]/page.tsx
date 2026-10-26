import type { Metadata } from "next";
import { DetailSkeleton } from "@/components/matchpa/skeletons";
import { Suspense } from "react";
import { MatchDetail } from "@/components/match/match-detail";
import { SITE_URL } from "@/lib/config";
import { formatDateTime } from "@/lib/panamaFormatDate";
import { fetchPublicMatch } from "@/lib/public-match";

interface MatchPageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: MatchPageProps): Promise<Metadata> {
  const { code } = await params;
  const match = await fetchPublicMatch(code);
  if (!match) return { title: "Partido" };

  const title = `${match.company.name} · ${formatDateTime(match.startsAt)}`;
  const description = `Cancha ${match.courtNumber}, ${match.company.name}. Faltan ${match.spotsLeft} puestos.`;
  return {
    title,
    description,
    openGraph: { title, description, url: `${SITE_URL}/partidos/${code}`, siteName: "MatchPa", locale: "es_PA" },
  };
}

export default function MatchPage({ params }: MatchPageProps) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <MatchContent params={params} />
    </Suspense>
  );
}

async function MatchContent({ params }: MatchPageProps) {
  const { code } = await params;
  return <MatchDetail code={code} />;
}
