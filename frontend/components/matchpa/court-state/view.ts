import {
  boxCorners,
  cameraOf,
  corners,
  cylinder,
  dotGrid,
  fitProjection,
  haloOf,
  insetPlan,
  planOutline,
  pointsAt,
  slabOf,
  type Plan,
  type Point3,
} from "@/components/iso/iso-kit";

export const WIDTH = 300;
export const HEIGHT = 300;

const PLINTH: Plan = { x: -46, y: -46, w: 112, d: 92, r: 6 };
const TURF = insetPlan(PLINTH, 2);
const PLINTH_Z = -12;
const TURF_Z = -4;
const FOOT_Z = -16;
const WALL = TURF.x;
const FENCE_TOP = 132;
const MESH_TOP = 148;
const MESH = 3.6;

export const P = fitProjection(
  [...boxCorners(PLINTH, FOOT_Z, 0), [WALL, WALL, MESH_TOP], [WALL, TURF.y + TURF.d, MESH_TOP], [TURF.x + TURF.w, WALL, MESH_TOP]],
  WIDTH,
  HEIGHT,
  { pad: 14 },
);
export const K = cameraOf(P).k;

const SERVICE: Plan = { x: 44, y: TURF.y, w: 3, d: TURF.d, r: 0 };
const CENTER: Plan = { x: 47, y: 24, w: TURF.x + TURF.w - 47, d: 3, r: 0 };
const LABEL: Plan = { x: 8, y: PLINTH.y + PLINTH.d, w: 34, d: 0.8, r: 0 };

const LABEL_Y = LABEL.y + LABEL.d;
const labelRules = [-6.5, -8, -9.5].map((z, index) => {
  const right = LABEL.x + LABEL.w - 4 - index * 6;
  return `M${pointsAt([[LABEL.x + 4, LABEL_Y, z]], P)[0]!.join(" ")}L${pointsAt([[right, LABEL_Y, z]], P)[0]!.join(" ")}`;
});

const turfDots = dotGrid(TURF.x + 4, TURF.y + 4, 21, 17, 5, 0, P).filter((_, index) => index % 3 !== 1);

export const COURT = {
  halo: haloOf(insetPlan(PLINTH, -3), FOOT_Z, 4, P),
  feet: corners(PLINTH, 8).map(([x, y]) => cylinder(x, y, 4, FOOT_Z, 4, P, 18)),
  plinth: slabOf(PLINTH, PLINTH_Z, TURF_Z - PLINTH_Z, P, 8, 0.8),
  turf: slabOf(TURF, TURF_Z, -TURF_Z, P, 8, 0.6),
  groove: planOutline(insetPlan(TURF, 3), 0, P),
  turfDots,
  lines: [slabOf(SERVICE, 0, 0.4, P, 2), slabOf(CENTER, 0, 0.4, P, 2)],
  screws: pointsAt(corners(PLINTH, 3.5).map(([x, y]) => [x, y, TURF_Z] as Point3), P),
  label: slabOf(LABEL, -10.8, 5.6, P, 2),
  labelRules,
  labelScrews: pointsAt(
    [
      [LABEL.x + 1.6, LABEL_Y, -6],
      [LABEL.x + LABEL.w - 1.6, LABEL_Y, -6],
      [LABEL.x + 1.6, LABEL_Y, -10],
      [LABEL.x + LABEL.w - 1.6, LABEL_Y, -10],
    ],
    P,
  ),
};


const THICK = 1.4;
const SIDE_END = TURF.x + TURF.w;

type Along = (u: number, z: number) => Point3;
const backAt: Along = (u, z) => [WALL + THICK, u, z];
const sideAt: Along = (u, z) => [u, WALL + THICK, z];

interface Bay {
  wall: Along;
  from: number;
  to: number;
  glass: number;
}

const BAYS: Bay[] = [
  { wall: backAt, from: WALL, to: TURF.y + TURF.d, glass: FENCE_TOP },
  { wall: sideAt, from: WALL, to: SIDE_END, glass: FENCE_TOP },
];

const path = (points: Point3[], closed = false) => {
  const flat = pointsAt(points, P);
  return flat.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("") + (closed ? "Z" : "");
};

const pane = ({ wall, from, to, glass }: Bay) => path([wall(from, 0), wall(to, 0), wall(to, glass), wall(from, glass)], true);

function glare({ wall, from, to, glass }: Bay, at: number, width: number) {
  const span = to - from;
  const u = (t: number) => from + span * t;
  return path([wall(u(at), 0), wall(u(at + width), 0), wall(u(at + width + 0.3), glass), wall(u(at + 0.3), glass)], true);
}

const clampPost = (value: number, end: number) => Math.min(Math.max(value, WALL), end - 2);
function mesh({ wall, from, to }: Bay) {
  const lines: string[] = [];
  for (let u = from + MESH; u < to - 0.5; u += MESH) lines.push(path([wall(u, FENCE_TOP), wall(u, MESH_TOP)]));
  for (let z = FENCE_TOP + MESH; z < MESH_TOP - 0.5; z += MESH) lines.push(path([wall(from, z), wall(to, z)]));
  return lines.join("");
}

const glassBays = BAYS;
const posts = [
  [WALL, WALL],
  [WALL, TURF.y + TURF.d],
  [SIDE_END, WALL],
].map(([x, y]) => slabOf({ x: clampPost(x, SIDE_END), y: clampPost(y, TURF.y + TURF.d), w: 2, d: 2, r: 0 }, 0, MESH_TOP, P, 2));

const glow = (point: Point3, r: number) => {
  const [[x, y]] = pointsAt([point], P) as [[number, number]];
  return { x, y, r: r * K };
};

export const WALLS = {
  panes: glassBays.map(pane),
  glare: glassBays.flatMap((bay) => [glare(bay, 0.18, 0.16), glare(bay, 0.42, 0.05)]),
  rims: glassBays.map(({ wall, from, to, glass }) => path([wall(from, glass), wall(to, glass)])),
  mesh: BAYS.map(mesh).join(""),
  rails: [
    slabOf({ x: WALL, y: WALL, w: THICK, d: TURF.d, r: 0 }, MESH_TOP - 1.6, 1.6, P, 2),
    slabOf({ x: WALL, y: WALL, w: SIDE_END - WALL, d: THICK, r: 0 }, MESH_TOP - 1.6, 1.6, P, 2),
  ],
  posts,
  glows: [glow([WALL - 10, -14, 64], 28), glow([-14, WALL - 10, 56], 26), glow([WALL - 6, -26, 30], 18)],
};
