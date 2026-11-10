import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand-colors";
import { ogFonts, ogLogo, ogPhoto } from "@/lib/og/assets";
import { OgPhoto } from "@/lib/og/parts";

export const alt = "MatchPa: encuentra jugadores y completa tu partido de pádel";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PHOTO_WIDTH = 460;

export default async function Image() {
  const [fonts, logo, photo] = await Promise.all([ogFonts(), ogLogo(), ogPhoto("bg1")]);
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: BRAND.teal, color: BRAND.ivory, fontFamily: "Bricolage" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, padding: 72 }}>
          { }
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
        <OgPhoto src={photo} width={PHOTO_WIDTH} height={size.height} />
      </div>
    ),
    { ...size, fonts },
  );
}
