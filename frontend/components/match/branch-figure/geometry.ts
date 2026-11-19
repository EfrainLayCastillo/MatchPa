import {
  boxCorners,
  cylinder,
  fitProjection,
  haloOf,
  insetPlan,
  lineOnTop,
  pointsAt,
  slabOf,
  type Plan,
  type Point3,
} from "@/components/iso/iso-kit";

export const BRANCH_WIDTH = 220;
export const BRANCH_HEIGHT = 170;

const BASE: Plan = { x: -62, y: -44, w: 124, d: 88, r: 6 };
const COURT: Plan = { x: -2, y: -20, w: 62, d: 31, r: 0 };
const HOUSE: Plan = { x: -54, y: -36, w: 44, d: 30, r: 0 };
const ROOF: Plan = { x: -57, y: -39, w: 50, d: 36, r: 1.5 };
const HOUSE_H = 24;
const GLASS_H = 10;
const NET_H = 3.2;
const MID_X = COURT.x + COURT.w / 2;
const MID_Y = COURT.y + COURT.d / 2;
const SERVICE = 21.5;
const STAND_X = 2;
const STAND_W = 54;
const SEATS = 8;

export const BP = fitProjection(boxCorners(BASE, -8, HOUSE_H + 12), BRANCH_WIDTH, BRANCH_HEIGHT, { pad: 8 });

const shape = (points: Point3[]) =>
  pointsAt(points, BP)
    .map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join("") + "Z";

const onFrontFace = (y: number, x0: number, x1: number, z0: number, z1: number) =>
  shape([
    [x0, y, z0],
    [x1, y, z0],
    [x1, y, z1],
    [x0, y, z1],
  ]);

const onSideFace = (x: number, y0: number, y1: number, z0: number, z1: number) =>
  shape([
    [x, y0, z0],
    [x, y1, z0],
    [x, y1, z1],
    [x, y0, z1],
  ]);

function standTier(y: number, height: number) {
  const pitch = STAND_W / SEATS;
  return {
    step: slabOf({ x: STAND_X, y, w: STAND_W, d: 6, r: 0.6 }, 0, height, BP, 2),
    seats: Array.from({ length: SEATS }, (_, index) =>
      slabOf({ x: STAND_X + 1.4 + index * pitch, y: y + 1.6, w: pitch - 2.2, d: 3, r: 0.8 }, height, 2.4, BP, 2),
    ),
  };
}

const front = HOUSE.y + HOUSE.d;
const side = HOUSE.x + HOUSE.w;

export const BRANCH = {
  halo: haloOf(insetPlan(BASE, -3), -8, 4, BP),
  base: slabOf(BASE, -8, 8, BP, 8, 0.8),
  court: slabOf(COURT, 0, 0.6, BP, 2),
  lines: [
    lineOnTop([MID_X - SERVICE, COURT.y], [MID_X - SERVICE, COURT.y + COURT.d], 0.6, BP),
    lineOnTop([MID_X + SERVICE, COURT.y], [MID_X + SERVICE, COURT.y + COURT.d], 0.6, BP),
    lineOnTop([MID_X - SERVICE, MID_Y], [MID_X + SERVICE, MID_Y], 0.6, BP),
  ].join(""),
  glass: [onSideFace(COURT.x, COURT.y, COURT.y + COURT.d, 0.6, GLASS_H), onFrontFace(COURT.y, COURT.x, COURT.x + COURT.w, 0.6, GLASS_H)],
  net: onSideFace(MID_X, COURT.y - 1.5, COURT.y + COURT.d + 1.5, 0.6, NET_H),
  netBand: shape([
    [MID_X, COURT.y - 1.5, NET_H],
    [MID_X, COURT.y + COURT.d + 1.5, NET_H],
  ]).slice(0, -1),
  stands: [standTier(-41, 8), standTier(-35, 4)],
  house: slabOf(HOUSE, 0, HOUSE_H, BP, 2),
  roof: slabOf(ROOF, HOUSE_H, 2.6, BP, 4, 0.5),
  sign: slabOf({ x: -46, y: ROOF.y + ROOF.d - 2, w: 28, d: 1.6, r: 0 }, HOUSE_H + 2.6, 6, BP, 2),
  windows: [
    onFrontFace(front, -50, -42, 9, 17),
    onFrontFace(front, -22, -14, 9, 17),
    onSideFace(side, -30, -22, 9, 17),
    onSideFace(side, -18, -10, 9, 17),
  ],
  door: onFrontFace(front, -35, -28, 0, 15),
  lampPost: cylinder(-24, 24, 0.9, 0, 30, BP, 10),
  lampHead: cylinder(-24, 24, 2.6, 30, 2.2, BP, 16, 0.4),
};
