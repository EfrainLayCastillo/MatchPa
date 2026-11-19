import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand-colors";
import { ogFonts, ogLogo } from "@/lib/og/assets";
import { OgTicket } from "@/lib/og/ticket";
import { fetchPublicMatch } from "@/lib/public-match";

const SIZE = { width: 1080, height: 1920 };

/** Vertical 9:16 image for Instagram stories: the match ticket. */
export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const [match, fonts, logo] = await Promise.all([fetchPublicMatch(code).catch(() => null), ogFonts(), ogLogo()]);
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", padding: 72, background: BRAND.ivory }}>
        <OgTicket match={match} logo={logo} orientation="portrait" scale={2.7} page={BRAND.ivory} />
      </div>
    ),
    { ...SIZE, fonts },
  );
}
