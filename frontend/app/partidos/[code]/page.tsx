import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { jsonLdHtml, matchJsonLd, SITE_OPEN_GRAPH } from "@/lib/seo";
import { DetailSkeleton } from "@/components/matchpa/skeletons";
import { Suspense } from "react";
import { MatchDetail } from "@/components/match/match-detail";
import { SITE_URL } from "@/lib/config";
import { formatDateTime } from "@/lib/panamaFormatDate";
import { fetchPublicMatch, isIndexable } from "@/lib/public-match";

interface MatchPageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: MatchPageProps): Promise<Metadata> {
  const { code } = await params;
  const match = await fetchPublicMatch(code).catch(() => undefined);
  if (match === null) notFound();
  if (!match) return { title: "Partido" };

  const title = `${match.company.name} · ${formatDateTime(match.startsAt)}`;
  const description = `Cancha ${match.courtNumber}, ${match.company.name}. Faltan ${match.spotsLeft} puestos.`;
  return {
    title,
    description,
    alternates: { canonical: `/partidos/${code}` },
    robots: isIndexable(match) ? undefined : { index: false },
    openGraph: { ...SITE_OPEN_GRAPH, title, description, url: `${SITE_URL}/partidos/${code}` },
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
  const match = await fetchPublicMatch(code).catch(() => undefined);
  return (
    <>
      {match && isIndexable(match) ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(matchJsonLd(match)) }} />
      ) : null}
      <MatchDetail code={code} />
    </>
  );
}
