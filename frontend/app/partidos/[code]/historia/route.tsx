import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand-colors";
import { ogFonts, ogLogo } from "@/lib/og/assets";
import { OgMatchCard } from "@/lib/og/match-card";
import { fetchPublicMatch } from "@/lib/public-match";

const SIZE = { width: 1080, height: 1920 };

/** Vertical 9:16 image for Instagram stories: the match card centred on the page. */
export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const [match, fonts, logo] = await Promise.all([fetchPublicMatch(code).catch(() => null), ogFonts(), ogLogo()]);
  return new ImageResponse(
    (
      <div style={{ display: "flex", alignItems: "center", width: "100%", height: "100%", padding: 72, background: BRAND.ivory }}>
        <div style={{ display: "flex", width: "100%", height: 760 }}>
          <OgMatchCard match={match} logo={logo} scale={2.7} />
        </div>
      </div>
    ),
    { ...SIZE, fonts },
  );
}
