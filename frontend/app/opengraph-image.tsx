import { ImageResponse } from "next/og";

export const alt = "MatchPa: encuentra jugadores y completa tu partido de pádel";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: 72,
          background: "#003c3c",
          color: "#f5f0f0",
        }}
      >
        <div style={{ display: "flex", fontSize: 40, fontWeight: 800 }}>MatchPa</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 800, lineHeight: 1 }}>¿Te falta una pala?</div>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 800, lineHeight: 1, color: "#e6fa50" }}>
            Encuéntrala aquí.
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 34 }}>Partidos y jugadores de pádel por categoría, sucursal y horario</div>
      </div>
    ),
    { ...size },
  );
}
