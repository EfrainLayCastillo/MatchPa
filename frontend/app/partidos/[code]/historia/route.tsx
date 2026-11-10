import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand-colors";
import { formatCategory, TYPE_LABELS } from "@/lib/format";
import { formatDateTime } from "@/lib/panamaFormatDate";
import { fetchPublicMatch } from "@/lib/public-match";
import type { Match } from "@/lib/types";

const SIZE = { width: 1080, height: 1920 };

/** Vertical 9:16 image for Instagram stories and reels, shared as a file from the match page. */
export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const match = await fetchPublicMatch(code).catch(() => null);
  return new ImageResponse(match ? <StoryCard match={match} /> : <FallbackCard />, SIZE);
}

function StoryCard({ match }: { match: Match }) {
  const [day, time] = formatDateTime(match.startsAt).split(" · ");
  return (
    <Frame>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <Pill>{match.spotsLeft > 0 ? `Faltan ${match.spotsLeft} puestos` : "Partido completo"}</Pill>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 700, textTransform: "capitalize" }}>{day}</div>
        <div style={{ display: "flex", fontSize: 170, fontWeight: 800, lineHeight: 1, color: BRAND.lime }}>{time}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <Detail label="Dónde">{`${match.branch.name} · ${match.branch.locationLabel}`}</Detail>
        <Detail label="Cancha">{String(match.courtNumber)}</Detail>
        <div style={{ display: "flex", gap: 20 }}>
          <Pill outline>{`${formatCategory(match.category, match.categoryTier)} categoría`}</Pill>
          <Pill outline>{TYPE_LABELS[match.type]}</Pill>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", fontSize: 52, fontWeight: 800 }}>Ey Pa, ¿juegas?</div>
        <div style={{ display: "flex", fontSize: 34, opacity: 0.8 }}>Únete desde el link en MatchPa</div>
      </div>
    </Frame>
  );
}

function FallbackCard() {
  return (
    <Frame>
      <div style={{ display: "flex", fontSize: 120, fontWeight: 800, color: BRAND.lime }}>Partido de pádel</div>
      <div style={{ display: "flex", fontSize: 52, fontWeight: 800 }}>Ey Pa, ¿juegas?</div>
    </Frame>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "140px 96px",
        background: `linear-gradient(160deg, ${BRAND.teal} 55%, #00605a 100%)`,
        color: BRAND.ivory,
        position: "relative",
      }}
    >
      <Glow />
      <div style={{ display: "flex", fontSize: 56, fontWeight: 800 }}>MatchPa</div>
      {children}
    </div>
  );
}

function Glow() {
  return (
    <div
      style={{
        position: "absolute",
        top: -260,
        right: -260,
        width: 760,
        height: 760,
        borderRadius: 999,
        background: BRAND.lime,
        opacity: 0.12,
      }}
    />
  );
}

function Detail({ label, children }: { label: string; children: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", fontSize: 30, textTransform: "uppercase", letterSpacing: 4, color: BRAND.turquoise }}>
        {label}
      </div>
      <div style={{ display: "flex", fontSize: 50, fontWeight: 700 }}>{children}</div>
    </div>
  );
}

function Pill({ outline = false, children }: { outline?: boolean; children: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignSelf: "flex-start",
        padding: "18px 36px",
        borderRadius: 999,
        fontSize: 38,
        fontWeight: 800,
        background: outline ? "transparent" : BRAND.lime,
        color: outline ? BRAND.ivory : BRAND.teal,
        border: outline ? `3px solid ${BRAND.ivory}` : "none",
      }}
    >
      {children}
    </div>
  );
}
