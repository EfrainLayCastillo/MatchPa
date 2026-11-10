import { Clock, LandPlot, MapPin, Trophy, Users, VenusAndMars } from "lucide";
import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand-colors";
import { formatCategory, STATUS_LABELS, TYPE_LABELS } from "@/lib/format";
import { ogFonts, ogLogo, ogPhoto } from "@/lib/og/assets";
import { OgIcon } from "@/lib/og/icon";
import { OgPhoto, OgPill } from "@/lib/og/parts";
import { formatDateTime } from "@/lib/panamaFormatDate";
import { fetchPublicMatch } from "@/lib/public-match";
import type { Match } from "@/lib/types";

export const alt = "Partido de pádel en MatchPa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PHOTO_WIDTH = 360;

/** Link preview laid out like the lobby match card: details on white, photo column on the right. */
export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const [match, fonts, logo, photo] = await Promise.all([
    fetchPublicMatch(code).catch(() => null),
    ogFonts(),
    ogLogo(),
    ogPhoto("bg2"),
  ]);
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", padding: 40, background: BRAND.teal, fontFamily: "Bricolage" }}>
        <div style={{ display: "flex", flex: 1, overflow: "hidden", borderRadius: 40, background: BRAND.card, color: BRAND.teal }}>
          {match ? <Details match={match} /> : <Generic />}
          <div style={{ display: "flex", position: "relative" }}>
            <OgPhoto src={photo} width={PHOTO_WIDTH} height={size.height - 80} />
            { }
            <img src={logo} alt="MatchPa" width={220} height={60} style={{ position: "absolute", bottom: 36, left: 70 }} />
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}

function Details({ match }: { match: Match }) {
  const [day, time] = formatDateTime(match.startsAt).split(" · ");
  return (
    <Column>
      <div style={{ display: "flex", gap: 12 }}>
        <OgPill background={BRAND.lime} scale={0.8}>{STATUS_LABELS[match.status]}</OgPill>
        <OgPill icon={Trophy} scale={0.8}>{formatCategory(match.category, match.categoryTier)}</OgPill>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: 44, fontWeight: 800, textTransform: "capitalize" }}>{day}</div>
        <div style={{ display: "flex", fontSize: 108, fontWeight: 800, lineHeight: 1, letterSpacing: -3 }}>{time}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, fontSize: 30, fontWeight: 500, color: BRAND.mutedText }}>
          <OgIcon node={MapPin} size={32} color={BRAND.teal} />
          {`${match.branch.name} · ${match.branch.locationLabel}`}
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <OgPill icon={LandPlot} scale={0.8}>{`Cancha ${match.courtNumber}`}</OgPill>
        <OgPill icon={Clock} scale={0.8}>{`${match.durationMinutes} min`}</OgPill>
        <OgPill icon={VenusAndMars} scale={0.8}>{TYPE_LABELS[match.type]}</OgPill>
        <OgPill icon={Users} scale={0.8}>{match.spotsLeft > 0 ? `Faltan ${match.spotsLeft}` : "Completo"}</OgPill>
      </div>
    </Column>
  );
}

function Generic() {
  return (
    <Column>
      <div style={{ display: "flex", fontSize: 84, fontWeight: 800, lineHeight: 1 }}>Partido de pádel</div>
      <div style={{ display: "flex", fontFamily: "Yellowtail", fontSize: 72, color: BRAND.teal }}>Ey Pa, ¿juegas?</div>
    </Column>
  );
}

function Column({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, padding: "44px 48px" }}>
      {children}
    </div>
  );
}
