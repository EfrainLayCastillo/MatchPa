import { Clock, Flame, LandPlot, Trophy, User, VenusAndMars, type IconNode } from "lucide";
import { BRAND } from "@/lib/brand-colors";
import { courtLabel, formatCategory, STATUS_LABELS, TYPE_LABELS } from "@/lib/format";
import { startParts } from "@/lib/panamaFormatDate";
import { seatsOf, type Seat } from "@/lib/seats";
import type { Match } from "@/lib/types";
import { OgIcon } from "./icon";

interface MatchCardProps {
  match: Match | null;
  /** Multiplies the app card's sizes (its time is 48px). */
  scale: number;
}

/** The match card from the app: the shared image for link previews and stories. */
export function OgMatchCard({ match, scale }: MatchCardProps) {
  return (
    <div
      style={{
        display: "flex",
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        borderRadius: 32 * scale,
        background: BRAND.teal,
        color: BRAND.ivory,
        fontFamily: "Bricolage",
      }}
    >
      <div style={{ display: "flex", position: "relative", flex: 1, padding: 22 * scale }}>
        <CourtLines />
        {match ? <Face match={match} scale={scale} /> : <Generic scale={scale} />}
      </div>
    </div>
  );
}

function Face({ match, scale: s }: { match: Match; scale: number }) {
  const { day, time, period } = startParts(match.startsAt);
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, gap: 14 * s }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 * s }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 * s }}>
          {match.status === "open" ? null : <StatusPill status={STATUS_LABELS[match.status]} scale={s} />}
          <div style={{ display: "flex", fontSize: 15 * s, fontWeight: 700, color: BRAND.card }}>{day}</div>
          <div style={{ display: "flex", alignItems: "baseline", color: BRAND.lime, lineHeight: 1 }}>
            <span style={{ fontSize: 56 * s, fontWeight: 800, letterSpacing: -1.5 * s }}>{time}</span>
            <span style={{ marginLeft: 4 * s, fontSize: 20 * s, fontWeight: 700 }}>{period}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 * s }}>
          <Seats seats={seatsOf(match)} scale={s} />
          {match.status === "open" ? <Seal spots={match.spotsLeft} scale={s} /> : null}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 * s }}>
        <div style={{ display: "flex", fontSize: 30 * s, fontWeight: 800, lineHeight: 1.1 }}>{match.branch.name}</div>
        <Details match={match} scale={s} />
      </div>
    </div>
  );
}

function Details({ match, scale: s }: { match: Match; scale: number }) {
  const details: [IconNode, string][] = [
    [VenusAndMars, TYPE_LABELS[match.type]],
    [Trophy, formatCategory(match.category, match.categoryTier)],
    [LandPlot, courtLabel(match)],
    [Clock, `${match.durationMinutes} min`],
  ];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: `${4 * s}px ${12 * s}px`, fontSize: 14 * s, color: "rgba(245,240,240,0.85)" }}>
      {details.map(([icon, label]) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 * s }}>
          <OgIcon node={icon} size={14 * s} color={BRAND.lime} />
          {label}
        </div>
      ))}
    </div>
  );
}

function Seats({ seats, scale: s }: { seats: Seat[]; scale: number }) {
  const columns = seats.length > 4 ? 3 : 2;
  const chip = 30 * s;
  const gap = 4 * s;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", width: columns * chip + (columns - 1) * gap, gap }}>
      {seats.map((seat, index) =>
        seat.filled ? (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: chip,
              height: chip,
              borderRadius: 999,
              background: BRAND.ivory,
              color: BRAND.teal,
              fontSize: 11 * s,
              fontWeight: 800,
            }}
          >
            {seat.initials ?? <OgIcon node={User} size={14 * s} color={BRAND.teal} />}
          </div>
        ) : (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: chip,
              height: chip,
              borderRadius: 999,
              border: `${2 * s}px dashed ${BRAND.lime}`,
              color: BRAND.lime,
              fontSize: 16 * s,
              fontWeight: 800,
            }}
          >
            +
          </div>
        ),
      )}
    </div>
  );
}

function Seal({ spots, scale: s }: { spots: number; scale: number }) {
  const size = 58 * s;
  return (
    <div style={{ display: "flex", position: "relative", transform: "rotate(6deg)" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: size,
          height: size,
          borderRadius: 999,
          background: BRAND.lime,
          color: BRAND.teal,
          border: `${4 * s}px solid rgba(0,60,60,0.4)`,
        }}
      >
        <span style={{ fontSize: 24 * s, fontWeight: 800, lineHeight: 1 }}>{spots}</span>
        <span style={{ fontSize: 8 * s, fontWeight: 800, letterSpacing: 0.5 * s }}>{spots === 1 ? "FALTA" : "FALTAN"}</span>
      </div>
      {spots === 1 ? (
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: -4 * s,
            right: -4 * s,
            alignItems: "center",
            justifyContent: "center",
            width: 22 * s,
            height: 22 * s,
            borderRadius: 999,
            background: BRAND.teal,
            border: `${2 * s}px solid ${BRAND.lime}`,
          }}
        >
          <OgIcon node={Flame} size={12 * s} color={BRAND.lime} />
        </div>
      ) : null}
    </div>
  );
}

function StatusPill({ status, scale: s }: { status: string; scale: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignSelf: "flex-start",
        padding: `${3 * s}px ${10 * s}px`,
        borderRadius: 999,
        background: BRAND.lime,
        color: BRAND.teal,
        fontSize: 11 * s,
        fontWeight: 800,
      }}
    >
      {status}
    </div>
  );
}

function Generic({ scale: s }: { scale: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>
      <div style={{ display: "flex", fontSize: 40 * s, fontWeight: 800, lineHeight: 1 }}>Partido de pádel</div>
    </div>
  );
}

function CourtLines() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 200 100"
      preserveAspectRatio="none"
      style={{ position: "absolute", top: 0, left: 0 }}
      fill="none"
      stroke="rgba(245,240,240,0.12)"
      strokeWidth={0.6}
    >
      <rect x="1" y="1" width="198" height="98" />
      <path d="M30.5 1V99M169.5 1V99M30.5 50H169.5M100 1V99" />
    </svg>
  );
}
