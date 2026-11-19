"use client";

import { FLOOR_ART, TIERS_ART } from "@/components/matchpa/court-state/stands-figure";
import type { Material } from "@/components/matchpa/court-state/pose";
import { STANDS_WIDTH } from "@/components/matchpa/court-state/stands-view";
import { shortCategory } from "@/lib/format";
import type { Category, CategoryTier } from "@/lib/types";
import { seatedSvg } from "./seated";
import "@/components/iso/iso.css";
import "@/components/matchpa/court-state/court-state.css";
import "./onboarding.css";

const VIEW_TOP = -14;
const VIEW_HEIGHT = 244;
const TAG_CHAR = 4.5;
const TAG_HEIGHT = 12;
const TIER_TAG: Record<CategoryTier, string> = { high: "alta", entry: "entrada" };

interface Guest {
  tier: number;
  seat: number;
  top: Material;
  tag: string;
  you?: boolean;
}

const GUESTS: Guest[] = [
  { tier: 0, seat: 0, top: "tee-a", tag: "3ra · alta" },
  { tier: 0, seat: 3, top: "tee-c", tag: "4ta" },
  { tier: 0, seat: 6, top: "tee-b", tag: "5ta · entrada" },
  { tier: 1, seat: 0, top: "tee-b", tag: "2da" },
  { tier: 1, seat: 3, top: "shirt", tag: "", you: true },
  { tier: 1, seat: 6, top: "tee-a", tag: "5ta" },
];

const SEATED = GUESTS.map((guest, index) => ({ guest, ...seatedSvg(guest.tier, guest.seat, guest.top), delay: `${-(index * 0.7).toFixed(1)}s` }));

const CROWD = [0, 1].map((tier) => (
  <g key={`crowd-${tier}`}>
    {SEATED.filter(({ guest }) => guest.tier === tier).map(({ svg, delay }, index) => (
      <g key={index} className="ob-guest" style={{ animationDelay: delay }} dangerouslySetInnerHTML={{ __html: svg }} />
    ))}
  </g>
));

export function tagText(category: Category, tier: CategoryTier | null) {
  return tier ? `${shortCategory(category)} · ${TIER_TAG[tier]}` : shortCategory(category);
}

function Tag({ at, text, you }: { at: [number, number]; text: string; you?: boolean }) {
  const width = text.length * TAG_CHAR + 10;
  return (
    <g transform={`translate(${at[0].toFixed(1)} ${at[1].toFixed(1)})`} data-you={you ? "" : undefined}>
      <g key={text} className={you ? "ob-tag-pop" : undefined}>
        <rect className="ob-tag-box" x={-width / 2} y={-TAG_HEIGHT / 2} width={width} height={TAG_HEIGHT} rx={TAG_HEIGHT / 2} />
        <path className="ob-tag-box" d="M-2.6 5.6h5.2L0 9z" />
        <text className="ob-tag-text" textAnchor="middle" y={2.9}>
          {text}
        </text>
      </g>
    </g>
  );
}

interface WaitingStandsProps {
  category: Category;
  categoryTier: CategoryTier | null;
}

export function WaitingStands({ category, categoryTier }: WaitingStandsProps) {
  return (
    <svg
      className="iso-svg"
      viewBox={`0 ${VIEW_TOP} ${STANDS_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label="Gradas de pádel con seis jugadores sentados esperando, cada uno con su categoría. Tu butaca, en lima, muestra la que elijas."
      focusable="false"
    >
      {FLOOR_ART}
      {TIERS_ART[0]}
      {CROWD[0]}
      {TIERS_ART[1]}
      {CROWD[1]}
      {SEATED.map(({ guest, tag }, index) => (
        <Tag key={index} at={tag} text={guest.you ? tagText(category, categoryTier) : guest.tag} you={guest.you} />
      ))}
    </svg>
  );
}
