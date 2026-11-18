import { cameraOf, extrude, iso, solidSvg, slabOf, type Flat, type Plane, type Point3 } from "@/components/iso/iso-kit";
import { BALL_R, HAND_R } from "./model";
import type { Pose } from "./motion";
import { K, P } from "./view";

type Material = "skin" | "shirt" | "shorts" | "cloth" | "band" | "sock" | "grip";

interface Limb {
  points: Point3[];
  r: number;
  material: Material;
}

const EDGE = 0.75;
const HEAD_R = 14;

const camera = cameraOf(P);
const VIEW: Point3 = [camera.cosA * camera.cosE, camera.sinA * camera.cosE, camera.sinE];

const add = (a: Point3, b: Point3): Point3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: Point3, b: Point3): Point3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: Point3, s: number): Point3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: Point3, b: Point3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Point3, b: Point3): Point3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a: Point3) => mul(a, 1 / (Math.hypot(...a) || 1));
const fine = (value: number) => Math.round(value * 10) / 10;
const at = (point: Point3) => iso(point, P);
const polyline = (points: Flat[], closed = false) =>
  points.map(([x, y], index) => `${index ? "L" : "M"}${fine(x)} ${fine(y)}`).join("") + (closed ? "Z" : "");

function bend(root: Point3, tip: Point3, upper: number, lower: number, pole: Point3): Point3 {
  const axis = sub(tip, root);
  const reach = Math.min(Math.hypot(...axis), upper + lower - 0.01);
  const u = unit(axis);
  const along = (upper ** 2 - lower ** 2 + reach ** 2) / (2 * reach);
  const out = unit(sub(pole, mul(u, dot(pole, u))));
  return add(add(root, mul(u, along)), mul(out, Math.sqrt(Math.max(0, upper ** 2 - along ** 2))));
}

function blobSvg(limbs: Limb[]) {
  const shaped = limbs.map(({ points, r, material }) => ({ d: polyline(points.map(at)), w: 2 * r * K, material }));
  const layer = (kind: string, width: (w: number) => number, shift: (w: number) => Flat) =>
    shaped
      .map(({ d, w, material }) => {
        const [dx, dy] = shift(w);
        return `<path class="sw-${kind}" data-m="${material}" d="${d}" stroke-width="${fine(width(w))}" transform="translate(${fine(dx)} ${fine(dy)})"/>`;
      })
      .join("");
  return (
    layer("edge", (w) => w + EDGE * 2, () => [0, 0]) +
    layer("body", (w) => w, () => [0, 0]) +
    layer("shade", (w) => w * 0.5, (w) => [w * 0.17, w * 0.1]) +
    layer("shine", (w) => w * 0.18, (w) => [-w * 0.2, -w * 0.15])
  );
}

function sphereSvg(center: Point3, r: number, material: Material | "ball") {
  const [x, y] = at(center);
  const s = r * K;
  return (
    `<circle class="sw-edge" data-m="${material}" cx="${fine(x)}" cy="${fine(y)}" r="${fine(s + EDGE)}"/>` +
    `<circle class="sw-body" data-m="${material}" cx="${fine(x)}" cy="${fine(y)}" r="${fine(s)}"/>` +
    `<circle class="sw-shade" data-m="${material}" cx="${fine(x + s * 0.28)}" cy="${fine(y + s * 0.18)}" r="${fine(s * 0.62)}"/>` +
    `<circle class="sw-shine" data-m="${material}" cx="${fine(x - s * 0.4)}" cy="${fine(y - s * 0.38)}" r="${fine(s * 0.2)}"/>`
  );
}

function visibleRun(point: (t: number) => Point3, normal: (t: number) => Point3, from = 0, to = Math.PI * 2, steps = 40) {
  const run: Point3[] = [];
  for (let index = 0; index <= steps; index++) {
    const t = from + ((to - from) * index) / steps;
    if (dot(normal(t), VIEW) > 0.02) run.push(point(t));
  }
  return run;
}

function ringAround(center: Point3, axis: Point3, r: number) {
  const e1 = unit(cross(axis, Math.abs(axis[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]));
  const e2 = cross(unit(axis), e1);
  const radial = (t: number) => add(mul(e1, Math.cos(t)), mul(e2, Math.sin(t)));
  const back = Math.atan2(dot(e2, VIEW), dot(e1, VIEW)) + Math.PI;
  return visibleRun((t) => add(center, mul(radial(t), r)), radial, back, back + Math.PI * 2);
}

const onSphere = (center: Point3, r: number, theta: number, beta: number): Point3 =>
  add(center, [r * Math.cos(beta) * Math.cos(theta), r * Math.cos(beta) * Math.sin(theta), r * Math.sin(beta)]);

function latitude(center: Point3, r: number, beta: number) {
  const normal = (t: number) => unit(sub(onSphere(center, r, t, beta), center));
  const back = Math.atan2(VIEW[1], VIEW[0]) + Math.PI;
  return visibleRun((t) => onSphere(center, r, t, beta), normal, back, back + Math.PI * 2, 48);
}

function headSvg(head: Point3, look: number, clip: string) {
  const [hx, hy] = at(head);
  const visorLow = latitude(head, HEAD_R + 0.3, 0.2).map(at);
  const visorHigh = latitude(head, HEAD_R + 0.3, 0.4).map(at).reverse();
  const hairEdge = latitude(head, HEAD_R, 0.42).map(at);
  const hair = polyline([...hairEdge, [hairEdge.at(-1)![0], hy - HEAD_R * K * 2], [hairEdge[0]![0], hy - HEAD_R * K * 2]], true);
  const eyeBeta = -0.12 - 0.2 * look;
  const eyes = [-0.3, 0.52].map((theta) => at(onSphere(head, HEAD_R, theta + 0.1 * look, eyeBeta)));
  const mouth = Array.from({ length: 7 }, (_, index) => at(onSphere(head, HEAD_R, -0.05 + index * 0.06, -0.44 + Math.sin((index / 6) * Math.PI) * -0.05)));
  const brimRing: Plane[] = [
    ...Array.from({ length: 13 }, (_, index) => {
      const theta = -1.2 + (index / 12) * 2.4;
      return [head[0] + 19.5 * Math.cos(theta), head[1] + 19.5 * Math.sin(theta)] as Plane;
    }),
    ...Array.from({ length: 13 }, (_, index) => {
      const theta = 1.2 - (index / 12) * 2.4;
      const inner = (HEAD_R + 0.3) * Math.cos(0.2);
      return [head[0] + inner * Math.cos(theta), head[1] + inner * Math.sin(theta)] as Plane;
    }),
  ];
  const brimZ = head[2] + (HEAD_R + 0.3) * Math.sin(0.2) - 1.1;
  return (
    sphereSvg(add(head, [-1, -HEAD_R + 0.5, -1]), 3.2, "skin") +
    sphereSvg(head, HEAD_R, "skin") +
    `<clipPath id="${clip}"><circle cx="${fine(hx)}" cy="${fine(hy)}" r="${fine(HEAD_R * K)}"/></clipPath>` +
    `<path class="sw-hair" clip-path="url(#${clip})" d="${hair}"/>` +
    `<path class="sw-visor" d="${polyline([...visorLow, ...visorHigh], true)}"/>` +
    eyes.map(([x, y]) => `<circle class="sw-eye" cx="${fine(x)}" cy="${fine(y)}" r="${fine(1.25 * K)}"/>`).join("") +
    `<path class="sw-mouth" d="${polyline(mouth)}"/>` +
    `<g class="sw-brim">${solidSvg(extrude(brimRing, brimZ, 1.1, P, { convex: false }), { tone: "hi", crease: "hi" })}</g>` +
    sphereSvg(add(head, [-1, HEAD_R - 0.5, -1]), 3.2, "skin")
  );
}

function chestLogoSvg(lift: Point3) {
  const theta = 0.42;
  const origin = add([15.8 * Math.cos(theta), 15.8 * Math.sin(theta), 90], lift);
  const tangent: Point3 = [-Math.sin(theta), Math.cos(theta), 0];
  const [ox, oy] = at(origin);
  const flip = at(add(origin, tangent))[0] > ox ? 1 : -1;
  const [ax, ay] = at(add(origin, mul(tangent, flip)));
  const [dx, dy] = at(add(origin, [0, 0, -1]));
  const matrix = [ax - ox, ay - oy, dx - ox, dy - oy, ox, oy].map((value) => value.toFixed(3)).join(" ");
  return `<text class="sw-logo" transform="matrix(${matrix})" font-size="10" text-anchor="middle">Pa</text>`;
}

function hull(points: Flat[]) {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const turn = (o: Flat, a: Flat, b: Flat) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const chain = (list: Flat[]) =>
    list.reduce<Flat[]>((out, point) => {
      while (out.length >= 2 && turn(out[out.length - 2]!, out[out.length - 1]!, point) <= 0) out.pop();
      return [...out, point];
    }, []);
  const lower = chain(sorted);
  const upper = chain([...sorted].reverse());
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

const HEAD_FROM = 15;
const HEAD_TO = 47;
const HEAD_MID = 32;
const HALF_WIDTH = 12.5;

function halfWidth(s: number) {
  const t = (s - HEAD_MID) / (s > HEAD_MID ? HEAD_TO - HEAD_MID : HEAD_MID - HEAD_FROM);
  const power = s > HEAD_MID ? 2.6 : 1.7;
  return HALF_WIDTH * Math.pow(Math.max(0, 1 - Math.abs(t) ** power), 1 / power);
}

function racketSvg(hand: Point3, direction: Point3) {
  const d = unit(direction);
  const w = unit(cross(d, [0, 0, 1]));
  const n = cross(d, w);
  const front = mul(n, dot(n, VIEW) > 0 ? 1.8 : -1.8);
  const local = (s: number, v: number, lift: Point3): Point3 => add(add(add(hand, mul(d, s)), mul(w, v)), lift);
  const outline = Array.from({ length: 48 }, (_, index) => {
    const a = (index / 48) * Math.PI * 2;
    const s = HEAD_MID + Math.cos(a) * (Math.cos(a) > 0 ? HEAD_TO - HEAD_MID : HEAD_MID - HEAD_FROM);
    return [s, Math.sign(Math.sin(a)) * halfWidth(s)] as Plane;
  });
  const face = outline.map(([s, v]) => at(local(s, v, front)));
  const back = outline.map(([s, v]) => at(local(s, v, mul(front, -1))));
  const holes: Flat[] = [];
  for (let s = HEAD_FROM + 5; s <= HEAD_TO - 3.5; s += 3.2)
    for (let v = -HALF_WIDTH; v <= HALF_WIDTH; v += 3.2) if (Math.abs(v) < halfWidth(s) - 3.4) holes.push(at(local(s, v, front)));
  const guard = outline.filter(([s]) => s > HEAD_MID + 6).map(([s, v]) => at(local(s - 1.2, v * 0.9, front)));
  const grip: Limb = { points: [local(-5, 0, [0, 0, 0]), local(HEAD_FROM + 3, 0, [0, 0, 0])], r: 2.2, material: "grip" };
  const wraps = [-2, 1, 4, 7, 10].map((s) => polyline(ringAround(local(s, 0, [0, 0, 0]), d, 2.3).map(at))).join("");
  return (
    blobSvg([grip]) +
    `<path class="sw-wrap" d="${wraps}"/>` +
    `<path class="sw-frame" d="${polyline(hull([...face, ...back]), true)}"/>` +
    `<path class="sw-face" d="${polyline(face, true)}"/>` +
    `<path class="sw-guard" d="${polyline(guard)}"/>` +
    holes.map(([x, y]) => `<circle class="sw-hole" cx="${fine(x)}" cy="${fine(y)}" r="${fine(0.6 * K)}"/>`).join("")
  );
}

function legSvg(ankle: Point3, hip: Point3) {
  const knee = bend(ankle, hip, 28, 28, [1, 0, 0]);
  const [x, y] = ankle;
  const floor = ankle[2] - 7;
  return {
    shoe: solidSvg(slabOf({ x: x - 8, y: y - 5, w: 21, d: 10, r: 4.5 }, floor, 6.5, P, 4, 0.5), { tone: "hi", crease: "lo" }),
    laces: [2, 5, 8].map((dx) => at([x + dx, y, floor + 6.5])),
    leg: blobSvg([
      { points: [ankle, knee, hip], r: 4.4, material: "skin" },
      { points: [add(ankle, [0, 0, -0.5]), add(ankle, [0.3, 0, 6])], r: 4.9, material: "sock" },
    ]),
  };
}

function armToward(shoulder: Point3, hand: Point3, pole: Point3) {
  return [shoulder, bend(shoulder, hand, 24, 25, pole), hand] as Point3[];
}

function armSvg(arm: Point3[]) {
  const sleeve = add(arm[0]!, mul(sub(arm[1]!, arm[0]!), 0.35));
  return blobSvg([
    { points: arm, r: 4, material: "skin" },
    { points: [arm[0]!, sleeve], r: 5.6, material: "shirt" },
  ]);
}

function wristbandSvg(elbow: Point3, hand: Point3) {
  const axis = sub(hand, elbow);
  const from = add(elbow, mul(axis, 0.6));
  const to = add(elbow, mul(axis, 0.84));
  const stripe = ringAround(add(elbow, mul(axis, 0.72)), axis, 5.5).map(at);
  return blobSvg([{ points: [from, to], r: 5.3, material: "band" }]) + `<path class="sw-stripe" d="${polyline(stripe)}"/>`;
}

function ballSvg({ at: center, squash, scale }: NonNullable<Pose["ball"]>, seconds: number) {
  const [x, y] = at(center);
  const bottom = y + BALL_R * K;
  const spin = seconds * 9;
  const axis = unit([Math.cos(spin), Math.sin(spin), 0.6]);
  const seam = polyline(ringAround(center, axis, BALL_R).map(at));
  const sx = scale * (1 + squash * 0.7);
  const sy = scale * (1 - squash);
  return (
    `<g transform="translate(${fine(x)} ${fine(bottom)}) scale(${sx.toFixed(3)} ${sy.toFixed(3)}) translate(${fine(-x)} ${fine(-bottom)})">` +
    sphereSvg(center, BALL_R, "ball") +
    `<path class="sw-seam" d="${seam}"/></g>`
  );
}

function shadowSvg({ at: [bx, by, bz], scale }: NonNullable<Pose["ball"]>) {
  const lift = Math.min(1, Math.max(0, (bz - BALL_R) / 70));
  const r = BALL_R * scale * (1.15 - 0.45 * lift);
  const ring = Array.from({ length: 24 }, (_, index) => {
    const a = (index / 24) * Math.PI * 2;
    return at([bx + r * Math.cos(a), by + r * Math.sin(a), 0]);
  });
  return `<path class="sw-shadow" style="opacity:${((0.42 - 0.26 * lift) * scale).toFixed(2)}" d="${polyline(ring, true)}"/>`;
}

function lowerBodySvg(body: Point3, feet: Pose["feet"]) {
  const [far, near] = ([-9, 9] as const).map((side, index) => legSvg(feet[index], add(body, [0, side, 62])));
  const laces = [...far!.laces, ...near!.laces].map(([x, y]) => `<circle cx="${fine(x)}" cy="${fine(y)}" r="0.7"/>`).join("");
  const shorts = blobSvg([
    { points: [add(body, [0, -8.5, 64]), add(body, [1.5, -9.5, 50])], r: 7.6, material: "shorts" },
    { points: [add(body, [0, 8.5, 64]), add(body, [1.5, 9.5, 50])], r: 7.6, material: "shorts" },
    { points: [add(body, [0, -8, 66]), add(body, [0, 8, 66])], r: 9.5, material: "shorts" },
  ]);
  return { far: far!.shoe + far!.leg, near: near!.shoe + near!.leg + `<g class="sw-laces">${laces}</g>` + shorts };
}

function torsoSvg(body: Point3) {
  return (
    blobSvg([{ points: [add(body, [0, 0, 100]), add(body, [0, 0, 113])], r: 5, material: "skin" }]) +
    blobSvg([
      { points: [add(body, [0, 0, 76]), add(body, [0, 0, 97])], r: 15.5, material: "shirt" },
      { points: [add(body, [0, -14, 101]), add(body, [0, 14, 101])], r: 8, material: "shirt" },
    ]) +
    chestLogoSvg(body)
  );
}

export function playerSvg(pose: Pose, seconds: number, clip: string) {
  const body: Point3 = [pose.base, 0, pose.bob];
  const nearArm = armToward(add(body, [1, 16, 103]), pose.nearHand, [-0.3, 0.7, -1]);
  const farArm = armToward(add(body, [-1, -16, 103]), pose.racketHand, [-0.5, -0.6, -0.4]);
  const legs = lowerBodySvg(body, pose.feet);
  return [
    pose.ball ? shadowSvg(pose.ball) : "",
    racketSvg(pose.racketHand, pose.racketDir),
    armSvg(farArm),
    sphereSvg(pose.racketHand, HAND_R, "skin"),
    legs.far,
    legs.near,
    torsoSvg(body),
    headSvg(add(body, [0, 0, 125]), pose.look, clip),
    armSvg(nearArm),
    wristbandSvg(nearArm[1]!, pose.nearHand),
    sphereSvg(pose.nearHand, HAND_R, "skin"),
    pose.ball ? ballSvg(pose.ball, seconds) : "",
  ].join("");
}
