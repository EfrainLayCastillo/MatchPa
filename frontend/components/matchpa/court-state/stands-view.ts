import {
  boxCorners,
  cameraOf,
  corners,
  cylinder,
  fitProjection,
  haloOf,
  insetPlan,
  iso,
  lineOnTop,
  pointsAt,
  slabOf,
  type Flat,
  type Plan,
  type Point3,
  type SolidPaths,
} from "@/components/iso/iso-kit";

export const STANDS_WIDTH = 300;
export const STANDS_HEIGHT = 230;

const FLOOR: Plan = { x: -74, y: -40, w: 148, d: 84, r: 6 };
const FLOOR_Z = -10;
const TILE_Z = -4;
const TILE = 12;
const SEATS = 7;
const PITCH = 17.5;
const BALL_R = 4.5;

interface Tier {
  plank: Plan;
  top: number;
}

const TIERS: Tier[] = [
  { plank: { x: -66, y: -26, w: 132, d: 22, r: 1.5 }, top: 42 },
  { plank: { x: -66, y: 8, w: 132, d: 22, r: 1.5 }, top: 20 },
];
export const LIME_SEAT = { tier: 1, index: 3 };

export const SP = fitProjection(
  [...boxCorners(FLOOR, FLOOR_Z - 4, 0), [-66, -26, 42 + 6 + 3 + 16], [66, -26, 42 + 6 + 3 + 16]],
  STANDS_WIDTH,
  STANDS_HEIGHT,
  { pad: 12 },
);
const SK = cameraOf(SP).k;

const path = (points: Point3[]) =>
  pointsAt(points, SP)
    .map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join("");

function tileGrid() {
  const inner = insetPlan(FLOOR, 2);
  const lines: string[] = [];
  for (let x = inner.x + TILE; x < inner.x + inner.w - 1; x += TILE) lines.push(lineOnTop([x, inner.y], [x, inner.y + inner.d], 0, SP));
  for (let y = inner.y + TILE; y < inner.y + inner.d - 1; y += TILE) lines.push(lineOnTop([inner.x, y], [inner.x + inner.w, y], 0, SP));
  return lines.join("");
}

export interface ShellFace {
  d: string;
  tone: "top" | 0 | 1 | 2 | 3;
}

export interface SeatArt {
  bracket: SolidPaths;
  faces: ShellFace[];
  cap: string;
  drain: Flat;
  lime: boolean;
}

type Profile = [number, number][];

const SHELL: Profile = [
  [7.6, -1.4],
  [6.8, 0.4],
  [3, 1.1],
  [-2.5, 1.5],
  [-5.2, 2.5],
  [-6.8, 4.8],
  [-7.6, 8.4],
  [-8.4, 12.6],
];
const SHELL_THICK = 1.5;
const SHELL_HALF = 8;

const view = (() => {
  const { sinA, cosA, sinE, cosE } = cameraOf(SP);
  return { y: sinA * cosE, z: sinE, lightY: cosA };
})();

function underside(profile: Profile): Profile {
  return profile.map(([y, z], index) => {
    const [ay, az] = profile[Math.max(0, index - 1)]!;
    const [by, bz] = profile[Math.min(profile.length - 1, index + 1)]!;
    const length = Math.hypot(by - ay, bz - az) || 1;
    const ty = (by - ay) / length;
    const tz = (bz - az) / length;
    return [y - tz * SHELL_THICK, z + ty * SHELL_THICK];
  });
}

function faceTone(ny: number, nz: number): ShellFace["tone"] {
  if (nz > 0.7) return "top";
  const lit = (ny * view.lightY + 1) / 2;
  return Math.min(3, Math.max(0, Math.round(lit * 3))) as 0 | 1 | 2 | 3;
}

function quad(cx: number, points: [number, number][], cy: number, z0: number) {
  const corners = [...points.map(([y, z]) => [cx - SHELL_HALF, cy + y, z0 + z] as Point3), ...points.reverse().map(([y, z]) => [cx + SHELL_HALF, cy + y, z0 + z] as Point3)];
  return path([...corners, corners[0]!]);
}

function shellFaces(cx: number, cy: number, z0: number, top: Profile, under: Profile) {
  const faces: ShellFace[] = [];
  const add = (a: [number, number], b: [number, number], flip: number) => {
    const ty = b[0] - a[0];
    const tz = b[1] - a[1];
    const length = Math.hypot(ty, tz) || 1;
    const ny = (-tz / length) * flip;
    const nz = (ty / length) * flip;
    if (ny * view.y + nz * view.z <= 0.01) return;
    faces.push({ d: quad(cx, [a, b], cy, z0), tone: faceTone(ny, nz) });
  };
  for (let index = top.length - 2; index >= 0; index--) add(top[index + 1]!, top[index]!, 1);
  add(under[0]!, top[0]!, -1);
  add(top[top.length - 1]!, under[under.length - 1]!, -1);
  return faces;
}

function seatAt(cx: number, tier: Tier, lime: boolean): SeatArt {
  const cy = tier.plank.y + tier.plank.d / 2 + 1;
  const z0 = tier.top + 3.4;
  const under = underside(SHELL);
  const cap = [...SHELL, ...[...under].reverse()].map(([y, z]) => [cx + SHELL_HALF, cy + y, z0 + z] as Point3);
  return {
    bracket: slabOf({ x: cx - 3.5, y: cy - 4, w: 7, d: 6, r: 0.6 }, tier.top, 2.6, SP, 2),
    faces: shellFaces(cx, cy, z0, SHELL, under),
    cap: path([...cap, cap[0]!]),
    drain: iso([cx, cy + 1, z0 + 1.3], SP),
    lime,
  };
}

function legsOf({ plank, top }: Tier) {
  const xs = [plank.x + 8, 0, plank.x + plank.w - 8];
  const ys = [plank.y + 4, plank.y + plank.d - 4];
  const bottom = top - 3;
  const posts = xs.flatMap((x) => ys.map((y) => ({ foot: cylinder(x, y, 3, 0, 1.4, SP, 16), post: slabOf({ x: x - 1.4, y: y - 1.4, w: 2.8, d: 2.8, r: 0 }, 1.4, bottom - 1.4, SP, 2) })));
  const braces = xs.map((x) => slabOf({ x: x - 1.2, y: plank.y + 2.6, w: 2.4, d: plank.d - 5.2, r: 0 }, bottom * 0.4, 2.4, SP, 2));
  const rail = slabOf({ x: plank.x + 6, y: plank.y + plank.d - 5.2, w: plank.w - 12, d: 2.4, r: 0 }, bottom * 0.4, 2.4, SP, 2);
  return { posts, braces, rail };
}

function tierArt(tier: Tier, tierIndex: number) {
  const { plank, top } = tier;
  const grooves = [0.25, 0.5, 0.75].map((t) => lineOnTop([plank.x + 1.5, plank.y + plank.d * t], [plank.x + plank.w - 1.5, plank.y + plank.d * t], top, SP)).join("");
  const seats = Array.from({ length: SEATS }, (_, index) => {
    const cx = plank.x + 13 + index * PITCH;
    return seatAt(cx, tier, tierIndex === LIME_SEAT.tier && index === LIME_SEAT.index);
  });
  return {
    legs: legsOf(tier),
    plank: slabOf(plank, top - 3, 3, SP, 2, 0.5),
    grooves,
    capScrews: pointsAt(corners(plank, 2).map(([x, y]) => [x, y, top] as Point3), SP),
    seats,
  };
}

const limeTier = TIERS[LIME_SEAT.tier]!;
const limeCenter: Point3 = [limeTier.plank.x + 13 + LIME_SEAT.index * PITCH, limeTier.plank.y + limeTier.plank.d / 2 + 3, limeTier.top + 4.6 + BALL_R];

export const STANDS = {
  halo: haloOf(insetPlan(FLOOR, -3), FLOOR_Z - 4, 4, SP),
  feet: corners(FLOOR, 8).map(([x, y]) => cylinder(x, y, 4, FLOOR_Z - 4, 4, SP, 18)),
  base: slabOf(FLOOR, FLOOR_Z, TILE_Z - FLOOR_Z, SP, 8, 0.8),
  tiles: slabOf(insetPlan(FLOOR, 2), TILE_Z, -TILE_Z, SP, 8, 0.6),
  grid: tileGrid(),
  screws: pointsAt(corners(FLOOR, 3.5).map(([x, y]) => [x, y, TILE_Z] as Point3), SP),
  tiers: TIERS.map(tierArt),
  ball: { at: iso(limeCenter, SP), r: BALL_R * SK, seam: path([0, 1, 2, 3, 4, 5, 6].map((i) => [limeCenter[0] - 3 + i, limeCenter[1] + 1.5, limeCenter[2] + 2.4 - Math.abs(i - 3) * 0.7] as Point3)) },
};

export function spotlightAt(seconds: number) {
  const sweep = Math.sin(seconds * 0.55);
  const [x, y] = iso([sweep * 52, 0, 34 - 6 * Math.abs(sweep)], SP);
  return { x, y, rx: 34 * SK, ry: 26 * SK };
}
