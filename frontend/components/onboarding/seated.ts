import { iso, type Flat, type Point3 } from "@/components/iso/iso-kit";
import { blobSvg, sphereSvg, type Lens, type Material } from "@/components/matchpa/court-state/pose";
import { SK, SP, seatOrigin } from "@/components/matchpa/court-state/stands-view";

const LENS: Lens = { at: (point) => iso(point, SP), k: SK };
const HEAD_R = 5.2;
const SEAT_DROP = 3.4;

const add = (a: Point3, b: Point3): Point3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const fine = (value: number) => Math.round(value * 10) / 10;

export interface Seated {
  svg: string;
  tag: Flat;
}

function legSvg(origin: Point3, side: number) {
  const [x, y, z] = origin;
  const hip: Point3 = [x + side, y - 1, z + 3.2];
  const knee: Point3 = [x + side, y + 8.5, z + 4.2];
  const foot: Point3 = [x + side, y + 10.5, z - SEAT_DROP + 2.2];
  return (
    blobSvg([{ points: [hip, knee], r: 2.9, material: "cloth" }], LENS) +
    blobSvg([{ points: [knee, foot], r: 2.1, material: "skin" }], LENS) +
    sphereSvg(add(foot, [0, 1.6, -0.6]), 2.7, "shorts", LENS)
  );
}

function armSvg(origin: Point3, side: number, top: Material) {
  const [x, y, z] = origin;
  const shoulder: Point3 = [x + side * 6, y - 1.2, z + 15.5];
  const hand: Point3 = [x + side * 5, y + 5.5, z + 7.5];
  return blobSvg([{ points: [shoulder, hand], r: 1.9, material: "skin" }, { points: [shoulder, add(shoulder, [0, 1.8, -2.4])], r: 2.7, material: top }], LENS);
}

function faceSvg(head: Point3) {
  const eyes = [1.4, -1.4].map((dx) => LENS.at(add(head, [dx, HEAD_R - 0.3, 0.3])));
  return eyes.map(([x, y]) => `<circle class="sw-eye" cx="${fine(x)}" cy="${fine(y)}" r="0.9"/>`).join("");
}

export function seatedSvg(tier: number, seat: number, top: Material): Seated {
  const origin = seatOrigin(tier, seat);
  const [x, y, z] = origin;
  const head: Point3 = [x, y - 0.4, z + 25.5];
  const [hx, hy] = LENS.at(head);
  const svg =
    legSvg(origin, -2.8) +
    legSvg(origin, 2.8) +
    armSvg(origin, -1, top) +
    blobSvg([{ points: [[x, y - 0.5, z + 5.7], [x, y - 1.2, z + 16]], r: 5.8, material: top }, { points: [[x - 5.2, y - 1.2, z + 15.5], [x + 5.2, y - 1.2, z + 15.5]], r: 3.2, material: top }], LENS) +
    sphereSvg(head, HEAD_R, "skin", LENS) +
    sphereSvg(add(head, [-0.6, -1.2, 2.6]), 4, "hair", LENS) +
    faceSvg(head) +
    armSvg(origin, 1, top);
  return { svg, tag: [hx, hy - HEAD_R * SK - 12] };
}
