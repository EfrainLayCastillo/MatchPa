import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand-colors";
import { ogFonts, ogLogo } from "@/lib/og/assets";

export const alt = "MatchPa: encuentra jugadores y completa tu partido de pádel";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COURT_WIDTH = 460;

export default async function Image() {
  const [fonts, logo] = await Promise.all([ogFonts(), ogLogo()]);
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: BRAND.teal, color: BRAND.ivory, fontFamily: "Bricolage" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, padding: 72 }}>
          <img src={logo} alt="MatchPa" width={300} height={82} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>¿Te falta una pala?</div>
            <div style={{ display: "flex", fontFamily: "Yellowtail", fontSize: 92, lineHeight: 1.1, color: BRAND.lime }}>
              Encuéntrala aquí.
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 500, opacity: 0.85 }}>
            Partidos y jugadores de pádel por categoría, sucursal y horario
          </div>
        </div>
        <CourtArt />
      </div>
    ),
    { ...size, fonts },
  );
}

/** A court seen from above with a ball on it, in place of a photo. */
function CourtArt() {
  return (
    <svg width={COURT_WIDTH} height={size.height} viewBox="0 0 460 630" style={{ display: "flex" }}>
      <rect width="460" height="630" fill={BRAND.turquoise} opacity={0.18} />
      <g fill="none" stroke={BRAND.ivory} strokeWidth={4} opacity={0.55}>
        <rect x="70" y="40" width="320" height="550" />
        <path d="M70 190H390M70 440H390M230 190V440" />
      </g>
      <path d="M50 315H410" stroke={BRAND.ivory} strokeWidth={8} />
      <circle cx="290" cy="380" r="46" fill={BRAND.lime} stroke={BRAND.teal} strokeWidth={4} />
      <path d="M256 352C276 368 276 392 256 408M324 352C304 368 304 392 324 408" fill="none" stroke={BRAND.ivory} strokeWidth={5} strokeLinecap="round" />
    </svg>
  );
}
