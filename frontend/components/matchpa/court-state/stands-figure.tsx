"use client";

import { useRef } from "react";
import { Dots, Line, Solid } from "@/components/iso/draw";
import { useInView, useLoop, useStillness } from "@/components/iso/live";
import { STANDS, STANDS_HEIGHT, STANDS_WIDTH, spotlightAt, type SeatArt } from "./stands-view";
import "@/components/iso/iso.css";
import "./court-state.css";

function Seat({ seat }: { seat: SeatArt }) {
  return (
    <g className="cs-seat" data-lime={seat.lime ? "" : undefined}>
      <Solid paths={seat.bracket} tone="mid" crease="faint" className="cs-bracket" />
      {seat.faces.map(({ d, tone }, index) =>
        tone === "top" ? (
          <path key={index} className="iso-top cs-shell" d={d} />
        ) : (
          <path key={index} className="iso-shade cs-shell" data-shade={tone} d={d} />
        ),
      )}
      <path className="cs-cap" d={seat.cap} />
      <Dots points={[seat.drain]} size={0.7} tone="hi" />
    </g>
  );
}

const TIERS_ART = STANDS.tiers.map((tier, tierIndex) => {
  const posts = tier.legs.posts;
  const post = ({ foot, post }: (typeof posts)[number], index: number) => (
    <g key={index}>
      <Solid paths={foot} tone="mid" crease="faint" />
      <Solid paths={post} tone="mid" crease="faint" />
    </g>
  );
  return (
    <g key={tierIndex}>
      {posts.filter((_, index) => index % 2 === 0).map(post)}
      {tier.legs.braces.map((paths, index) => (
        <Solid key={index} paths={paths} tone="mid" crease="faint" />
      ))}
      <Solid paths={tier.legs.rail} tone="mid" crease="faint" />
      {posts.filter((_, index) => index % 2 === 1).map(post)}
      <Solid paths={tier.plank} tone="mid" crease="faint" />
      <Line d={tier.grooves} tone="faint" />
      <Dots points={tier.capScrews} size={0.5} tone="mid" />
      {tier.seats.map((seat, index) => (
        <Seat key={index} seat={seat} />
      ))}
    </g>
  );
});

const { ball } = STANDS;
const BALL_ART = (
  <g key="ball">
    <circle className="sw-edge" data-m="ball" cx={ball.at[0]} cy={ball.at[1]} r={ball.r + 0.75} />
    <circle className="sw-body" data-m="ball" cx={ball.at[0]} cy={ball.at[1]} r={ball.r} />
    <circle className="sw-shade" data-m="ball" cx={ball.at[0] + ball.r * 0.28} cy={ball.at[1] + ball.r * 0.18} r={ball.r * 0.62} />
    <circle className="sw-shine" data-m="ball" cx={ball.at[0] - ball.r * 0.4} cy={ball.at[1] - ball.r * 0.38} r={ball.r * 0.2} />
    <path className="sw-seam" d={ball.seam} />
  </g>
);

const FLOOR_ART = (
  <g key="floor">
    <path className="iso-halo" d={STANDS.halo} />
    {STANDS.feet.map((paths, index) => (
      <Solid key={index} paths={paths} tone="lo" crease="faint" />
    ))}
    <Solid paths={STANDS.base} tone="mid" crease="faint" />
    <Dots points={STANDS.screws} size={0.55} tone="mid" />
    <Solid paths={STANDS.tiles} tone="mid" crease="faint" />
    <Line d={STANDS.grid} tone="faint" />
  </g>
);

const REST_SPOT = spotlightAt(0);

export function StandsFigure() {
  const stage = useRef<SVGSVGElement>(null);
  const spot = useRef<SVGEllipseElement>(null);
  const seconds = useRef(0);
  const still = useStillness();
  const inView = useInView(stage);

  useLoop((dt) => {
    seconds.current += dt;
    const { x, y } = spotlightAt(seconds.current);
    spot.current?.setAttribute("cx", x.toFixed(1));
    spot.current?.setAttribute("cy", y.toFixed(1));
    return true;
  }, inView && !still);

  return (
    <svg
      ref={stage}
      className="iso-svg"
      viewBox={`0 0 ${STANDS_WIDTH} ${STANDS_HEIGHT}`}
      role="img"
      aria-label="Gradas de pádel con todas las butacas vacías, una pelota olvidada en un asiento y un reflector que las recorre"
      focusable="false"
    >
      <defs>
        <filter id="cs-spot-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      {FLOOR_ART}
      {TIERS_ART}
      {BALL_ART}
      <ellipse ref={spot} className="cs-spot" filter="url(#cs-spot-blur)" cx={REST_SPOT.x} cy={REST_SPOT.y} rx={REST_SPOT.rx} ry={REST_SPOT.ry} />
    </svg>
  );
}
