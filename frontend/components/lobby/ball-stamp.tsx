import { useId } from "react";
import { dateParts } from "@/lib/panamaFormatDate";
import "./ball-stamp.css";

const SIZE = 120;
const CENTER = SIZE / 2;
const BALL_R = 40;
const RING_R = 52;

/** A padel ball with the match date printed on it and the branch name running around it like a stamp. */
export function BallStamp({ startsAt, place }: { startsAt: string; place: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const { weekday, day, month } = dateParts(startsAt);
  const ring = `M ${CENTER} ${CENTER - RING_R} a ${RING_R} ${RING_R} 0 1 1 -0.01 0`;
  const label = `${place} · `.toUpperCase().repeat(place.length > 18 ? 1 : 2);
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="ball-stamp block size-full" role="img" aria-label={`${weekday} ${day} de ${month}, ${place}`}>
      <defs>
        <clipPath id={`ball-${id}`}>
          <circle cx={CENTER} cy={CENTER} r={BALL_R} />
        </clipPath>
        <path id={`ring-${id}`} d={ring} />
      </defs>
      <g className="ball-stamp-ring" aria-hidden>
        <text className="ball-stamp-place" textLength={2 * Math.PI * RING_R - 4} lengthAdjust="spacing">
          <textPath href={`#ring-${id}`}>{label}</textPath>
        </text>
      </g>
      <circle className="ball-stamp-edge" cx={CENTER} cy={CENTER} r={BALL_R + 1.2} />
      <g clipPath={`url(#ball-${id})`} aria-hidden>
        <circle className="ball-stamp-body" cx={CENTER} cy={CENTER} r={BALL_R} />
        <circle className="ball-stamp-shade-far" cx={CENTER + 14} cy={CENTER + 12} r={BALL_R * 0.95} />
        <circle className="ball-stamp-shade" cx={CENTER + 20} cy={CENTER + 18} r={BALL_R * 0.72} />
        <circle className="ball-stamp-shine" cx={CENTER - 16} cy={CENTER - 18} r={BALL_R * 0.24} />
        <path
          className="ball-stamp-seam"
          d={`M ${CENTER - 34} ${CENTER - 26} C ${CENTER - 12} ${CENTER - 10}, ${CENTER - 12} ${CENTER + 10}, ${CENTER - 34} ${CENTER + 26}`}
        />
        <path
          className="ball-stamp-seam"
          d={`M ${CENTER + 34} ${CENTER - 26} C ${CENTER + 12} ${CENTER - 10}, ${CENTER + 12} ${CENTER + 10}, ${CENTER + 34} ${CENTER + 26}`}
        />
      </g>
      <g aria-hidden className="ball-stamp-date">
        <text x={CENTER} y={CENTER - 15} textAnchor="middle" className="ball-stamp-weekday">
          {weekday.toUpperCase()}
        </text>
        <text x={CENTER} y={CENTER + 9} textAnchor="middle" className="ball-stamp-day">
          {day}
        </text>
        <text x={CENTER} y={CENTER + 22} textAnchor="middle" className="ball-stamp-month">
          {month.toUpperCase()}
        </text>
      </g>
    </svg>
  );
}
