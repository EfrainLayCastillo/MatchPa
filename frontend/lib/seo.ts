import { SITE_URL } from "./config";
import type { Match } from "./types";

/** Pages that define `openGraph` replace the layout's object instead of merging it, so they spread this. */
export const SITE_OPEN_GRAPH = { type: "website", siteName: "MatchPa", locale: "es_PA" } as const;

export const SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "MatchPa",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "MatchPa",
      url: SITE_URL,
      inLanguage: "es",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export function matchJsonLd(match: Match) {
  const endsAt = new Date(new Date(match.startsAt).getTime() + match.durationMinutes * 60_000);
  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `Partido de pádel en ${match.company.name}`,
    sport: "Padel",
    url: `${SITE_URL}/partidos/${match.code}`,
    startDate: match.startsAt,
    endDate: endsAt.toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "Place", name: match.company.name, address: match.company.locationLabel },
    organizer: { "@id": `${SITE_URL}/#organization` },
  };
}

export function jsonLdHtml(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
