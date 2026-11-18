"use client";

import { useId, useRef } from "react";
import { Dots, Line, Solid } from "@/components/iso/draw";
import { useInView, useLoop, useStillness } from "@/components/iso/live";
import { readoutOf } from "./model";
import { DRIBBLE_REST, advance, dribblePose, sceneText, startScene } from "./motion";
import { playerSvg } from "./pose";
import { COURT, HEIGHT, WALLS, WIDTH } from "./view";
import "@/components/iso/iso.css";
import "./court-state.css";

const REST_POSE = dribblePose(DRIBBLE_REST);

const COURT_ART = (
  <g key="court">
    <path className="iso-halo" d={COURT.halo} />
    {COURT.feet.map((paths, index) => (
      <Solid key={index} paths={paths} tone="lo" crease="faint" />
    ))}
    <Solid paths={COURT.plinth} tone="mid" crease="faint" />
    <Dots points={COURT.screws} size={0.55} tone="mid" />
    <Solid paths={COURT.label} tone="lo" crease="none" />
    <Line d={COURT.labelRules.join("")} tone="lo" free />
    <Dots points={COURT.labelScrews} size={0.4} tone="mid" />
    <Solid paths={COURT.turf} tone="mid" crease="faint" />
    <Line d={COURT.groove} tone="faint" />
    <Dots points={COURT.turfDots} size={0.35} tone="faint" />
    {COURT.lines.map((paths, index) => (
      <Solid key={index} paths={paths} tone="lo" crease="none" flat className="sw-court-line" />
    ))}
  </g>
);

const WALL_ART = (
  <g key="walls">
    <defs>
      <linearGradient id="sw-glass-fill" x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0" className="sw-glass-stop-top" />
        <stop offset="1" className="sw-glass-stop-bottom" />
      </linearGradient>
      <clipPath id="sw-glass-clip">
        <path d={WALLS.panes.join("")} />
      </clipPath>
      <filter id="sw-frost" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="9" />
      </filter>
    </defs>
    <g clipPath="url(#sw-glass-clip)">
      <g filter="url(#sw-frost)">
        {WALLS.glows.map(({ x, y, r }, index) => (
          <circle key={index} className="sw-glow" data-glow={index} cx={x} cy={y} r={r} />
        ))}
      </g>
    </g>
    {WALLS.panes.map((d, index) => (
      <path key={index} className="sw-glass" d={d} />
    ))}
    <path className="sw-glare" d={WALLS.glare.join("")} />
    <Line d={WALLS.mesh} tone="lo" />
    <Line d={WALLS.rims.join("")} tone="hi" />
    {WALLS.rails.map((paths, index) => (
      <Solid key={index} paths={paths} tone="mid" crease="faint" />
    ))}
    {WALLS.posts.map((paths, index) => (
      <Solid key={index} paths={paths} tone="mid" crease="faint" />
    ))}
  </g>
);

interface ServeFigureProps {
  serves?: number;
  waiting?: boolean;
  onReadout?: (text: string) => void;
}

export function ServeFigure({ serves = 0, waiting = false, onReadout }: ServeFigureProps) {
  const clip = `sw-head-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const stage = useRef<SVGSVGElement>(null);
  const player = useRef<SVGGElement>(null);
  const scene = useRef(startScene());
  const spoken = useRef("");
  const seconds = useRef(0);
  const served = useRef(serves);
  const still = useStillness();
  const inView = useInView(stage);

  useLoop((dt) => {
    seconds.current += dt;
    const serve = served.current !== serves;
    served.current = serves;
    const pose = advance(scene.current, dt, { serve, waiting });
    if (player.current) player.current.innerHTML = playerSvg(pose, seconds.current, clip);
    const text = sceneText(scene.current, readoutOf);
    if (text !== spoken.current) {
      spoken.current = text;
      onReadout?.(text);
    }
    return true;
  }, inView && !still);

  return (
    <svg
      ref={stage}
      className="iso-svg"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label="Jugador de pádel en el lado derecho de la cancha, frente al vidrio del fondo, botando la pelota mientras espera para sacar"
      focusable="false"
    >
      {COURT_ART}
      {WALL_ART}
      <g ref={player} dangerouslySetInnerHTML={{ __html: playerSvg(REST_POSE, 0, clip) }} />
    </svg>
  );
}
