import { Line, Solid } from "@/components/iso/draw";
import { BRANCH, BRANCH_HEIGHT, BRANCH_WIDTH } from "./geometry";
import "@/components/iso/iso.css";
import "@/components/matchpa/court-state/court-state.css";
import "./branch-figure.css";

/** A small padel club: clubhouse with lit windows, stands, one court with glass and net, a lamp post. */
export function BranchFigure({ name }: { name: string }) {
  return (
    <svg
      className="court-state iso-svg bf"
      viewBox={`0 0 ${BRANCH_WIDTH} ${BRANCH_HEIGHT}`}
      role="img"
      aria-label={`Ilustración de la sede ${name}`}
      focusable="false"
    >
      <path className="iso-halo" d={BRANCH.halo} />
      <Solid paths={BRANCH.base} tone="mid" crease="faint" className="bf-base" />
      <g className="bf-house">
        <Solid paths={BRANCH.house} tone="hi" crease="lo" />
        {BRANCH.windows.map((d, index) => (
          <path key={index} className="bf-window" d={d} />
        ))}
        <path className="bf-door" d={BRANCH.door} />
      </g>
      <Solid paths={BRANCH.roof} tone="hi" crease="lo" className="bf-roof" />
      <Solid paths={BRANCH.sign} tone="hi" crease="lo" className="bf-sign" />
      {BRANCH.stands.map((tier, row) => (
        <g key={row}>
          <Solid paths={tier.step} tone="mid" crease="faint" className="bf-step" />
          {tier.seats.map((paths, index) => (
            <Solid key={index} paths={paths} tone="hi" crease="lo" className={row === 1 && index === 3 ? "bf-sign" : "bf-seat"} />
          ))}
        </g>
      ))}
      <Solid paths={BRANCH.court} tone="mid" crease="none" className="bf-court" />
      <Line d={BRANCH.lines} tone="lit" className="bf-line" />
      {BRANCH.glass.map((d, index) => (
        <path key={index} className="bf-glass" d={d} />
      ))}
      <path className="bf-net" d={BRANCH.net} />
      <path className="bf-net-band" d={BRANCH.netBand} />
      <Solid paths={BRANCH.lampPost} tone="hi" crease="faint" />
      <Solid paths={BRANCH.lampHead} tone="hi" crease="lo" className="bf-lamp" />
    </svg>
  );
}
