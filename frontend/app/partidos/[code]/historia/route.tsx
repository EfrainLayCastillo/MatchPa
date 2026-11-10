import { Clock, LandPlot, MapPin, Trophy, Users, VenusAndMars, type IconNode } from "lucide";
import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand-colors";
import { formatCategory, STATUS_LABELS, TYPE_LABELS } from "@/lib/format";
import { toMatchImage } from "@/lib/match-images";
import { ogFonts, ogLogo, ogPhoto } from "@/lib/og/assets";
import { OgIcon } from "@/lib/og/icon";
import { formatDateTime } from "@/lib/panamaFormatDate";
import { fetchPublicMatch } from "@/lib/public-match";
import type { Match } from "@/lib/types";

const SIZE = { width: 1080, height: 1920 };
const PHOTO_HEIGHT = 820;

/** Vertical 9:16 image for Instagram stories and reels, laid out like the lobby match card. */
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const image = toMatchImage(new URL(request.url).searchParams.get("img"));
  const [match, fonts, logo, photo] = await Promise.all([
    fetchPublicMatch(code).catch(() => null),
    ogFonts(),
    ogLogo(),
    ogPhoto(image),
  ]);
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: BRAND.ivory, fontFamily: "Bricolage" }}>
        <Hero photo={photo} logo={logo} />
        <Sheet>{match ? <MatchSummary match={match} /> : <Fallback />}</Sheet>
      </div>
    ),
    { ...SIZE, fonts },
  );
}

function Hero({ photo, logo }: { photo: string; logo: string }) {
  return (
    <div style={{ display: "flex", position: "relative", width: "100%", height: PHOTO_HEIGHT }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- rendered by ImageResponse, not the browser */}
      <img src={photo} alt="" width={SIZE.width} height={PHOTO_HEIGHT} style={{ objectFit: "cover" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          background: `linear-gradient(180deg, ${BRAND.teal}e6 0%, ${BRAND.teal}33 45%, ${BRAND.lime}26 100%)`,
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- rendered by ImageResponse, not the browser */}
      <img src={logo} alt="MatchPa" width={400} height={109} style={{ position: "absolute", top: 110, left: 80 }} />
    </div>
  );
}

function Sheet({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        flex: 1,
        marginTop: -96,
        padding: "72px 80px 120px",
        borderRadius: "64px 64px 0 0",
        background: BRAND.card,
        color: BRAND.teal,
      }}
    >
      {children}
    </div>
  );
}

function MatchSummary({ match }: { match: Match }) {
  const [day, time] = formatDateTime(match.startsAt).split(" · ");
  return (
    <Column>
      <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
        <div style={{ display: "flex", gap: 16 }}>
          <Pill background={BRAND.lime}>{STATUS_LABELS[match.status]}</Pill>
          <Pill icon={Trophy}>{formatCategory(match.category, match.categoryTier)}</Pill>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 800, textTransform: "capitalize" }}>{day}</div>
          <div style={{ display: "flex", fontSize: 150, fontWeight: 800, lineHeight: 1, letterSpacing: -4 }}>{time}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 40, fontWeight: 500, color: BRAND.mutedText }}>
          <OgIcon node={MapPin} size={44} color={BRAND.teal} />
          {`${match.branch.name} · ${match.branch.locationLabel}`}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          <Pill icon={LandPlot}>{`Cancha ${match.courtNumber}`}</Pill>
          <Pill icon={Clock}>{`${match.durationMinutes} min`}</Pill>
          <Pill icon={VenusAndMars}>{TYPE_LABELS[match.type]}</Pill>
          <Pill icon={Users}>{match.spotsLeft > 0 ? `Faltan ${match.spotsLeft}` : "Completo"}</Pill>
        </div>
      </div>
      <CallToAction />
    </Column>
  );
}

function Fallback() {
  return (
    <Column>
      <div style={{ display: "flex", fontSize: 110, fontWeight: 800, lineHeight: 1 }}>Partido de pádel</div>
      <CallToAction />
    </Column>
  );
}

function Column({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
      {children}
    </div>
  );
}

function CallToAction() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "40px 48px",
        borderRadius: 40,
        background: BRAND.teal,
        color: BRAND.ivory,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", fontFamily: "Yellowtail", fontSize: 88, lineHeight: 1, color: BRAND.lime }}>Ey Pa, ¿juegas?</div>
        <div style={{ display: "flex", fontSize: 34, fontWeight: 500 }}>Únete desde el link en MatchPa</div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 120,
          height: 120,
          borderRadius: 999,
          background: BRAND.lime,
        }}
      >
        <OgIcon node={Users} size={56} color={BRAND.teal} />
      </div>
    </div>
  );
}

function Pill({ icon, background = BRAND.secondary, children }: { icon?: IconNode; background?: string; children: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "16px 28px",
        borderRadius: 999,
        background,
        fontSize: 36,
        fontWeight: 800,
      }}
    >
      {icon ? <OgIcon node={icon} size={36} color={BRAND.teal} /> : null}
      {children}
    </div>
  );
}
