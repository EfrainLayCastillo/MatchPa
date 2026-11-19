import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand-colors";
import { ogFonts, ogLogo } from "@/lib/og/assets";
import { OgMatchCard } from "@/lib/og/match-card";
import { fetchPublicMatch } from "@/lib/public-match";

export const alt = "Partido de pádel en MatchPa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Link preview: the match card from the app, . */
export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const [match, fonts, logo] = await Promise.all([fetchPublicMatch(code).catch(() => null), ogFonts(), ogLogo()]);
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", padding: 32, background: BRAND.ivory }}>
        <OgMatchCard match={match} logo={logo} scale={1.9} />
      </div>
    ),
    { ...size, fonts },
  );
}
