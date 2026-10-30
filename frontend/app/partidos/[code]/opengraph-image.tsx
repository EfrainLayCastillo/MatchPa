import { ImageResponse } from "next/og";
import { shortCategory, TYPE_LABELS } from "@/lib/format";
import { formatDateTime } from "@/lib/panamaFormatDate";
import { fetchPublicMatch } from "@/lib/public-match";

export const alt = "Partido de pádel en MatchPa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const match = await fetchPublicMatch(code).catch(() => null);

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
        {match ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", fontSize: 72, fontWeight: 800 }}>
              {formatDateTime(match.startsAt)}
            </div>
            <div style={{ display: "flex", fontSize: 36 }}>
              {`${match.branch.name} · Cancha ${match.courtNumber} · ${TYPE_LABELS[match.type]} · ${shortCategory(match.category)} categoría`}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", fontSize: 56, fontWeight: 800 }}>Partido de pádel</div>
        )}
        {match ? (
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "16px 32px",
              borderRadius: 999,
              background: "#e6fa50",
              color: "#003c3c",
              fontSize: 36,
              fontWeight: 800,
            }}
          >
            {match.spotsLeft > 0 ? `Faltan ${match.spotsLeft} puestos` : "Partido completo"}
          </div>
        ) : null}
      </div>
    ),
    { ...size },
  );
}
