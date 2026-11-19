import type { Point3 } from "@/components/iso/iso-kit";
import { BALL_R, CYCLE, GRAVITY, HAND_R, HAND_REST_Z, RESTITUTION, dribbleAt } from "./model";

export interface Pose {
  base: number;
  bob: number;
  feet: [Point3, Point3];
  nearHand: Point3;
  racketHand: Point3;
  racketDir: Point3;
  ball: { at: Point3; squash: number; scale: number } | null;
  look: number;
}

const ADVANCE = 26;
const RACKET_LENGTH = 32;
const HELD_GAP = HAND_R + BALL_R;
const DRIBBLE_HAND: Point3 = [36, 13, HAND_REST_Z];
const RACKET_HAND: Point3 = [4, -25, 70];
const RACKET_UP: Point3 = [0.12, -0.32, 1];
const FEET: [Point3, Point3] = [
  [2, -9, 7],
  [2, 9, 7],
];

const add = (a: Point3, b: Point3): Point3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const lerp = (a: Point3, b: Point3, t: number): Point3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const unit = (a: Point3): Point3 => {
  const length = Math.hypot(...a) || 1;
  return [a[0] / length, a[1] / length, a[2] / length];
};
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};
const window01 = (t: number, from: number, to: number) => clamp01((t - from) / (to - from));

const lookAt = (ballZ: number) => clamp01((HAND_REST_Z - HELD_GAP - ballZ) / 70);

export function dribblePose(seconds: number): Pose {
  const d = dribbleAt(seconds);
  const sway = 0.05 * Math.sin((seconds / 2.7) * Math.PI * 2);
  return {
    base: 0,
    bob: d.bob,
    feet: FEET,
    nearHand: [DRIBBLE_HAND[0], DRIBBLE_HAND[1], d.handZ],
    racketHand: add(RACKET_HAND, [0, 0, d.bob]),
    racketDir: [RACKET_UP[0] + sway, RACKET_UP[1], RACKET_UP[2]],
    ball: { at: [DRIBBLE_HAND[0], DRIBBLE_HAND[1], d.ballZ], squash: d.squash, scale: 1 },
    look: lookAt(d.ballZ),
  };
}

export const DRIBBLE_REST = CYCLE - 0.01;

const HIT_DIR = unit([0.45, 0.55, -0.7]);
const DROP_HAND: Point3 = [28.4, -12.4, 86];
const RELEASE = 0.35;
const DROP_Z = DROP_HAND[2] - HELD_GAP;
const BOUNCE = RELEASE + Math.sqrt((2 * (DROP_Z - BALL_R)) / GRAVITY);
const RISE_SPEED = RESTITUTION * Math.sqrt(2 * GRAVITY * (DROP_Z - BALL_R));
const HIT = BOUNCE + 0.2;
const HIT_Z = BALL_R + RISE_SPEED * 0.2 - (GRAVITY * 0.2 ** 2) / 2;
const HIT_POINT: Point3 = [DROP_HAND[0], DROP_HAND[1], HIT_Z];
const SHOT: Point3 = [330, 40, 160];
const WALK_FROM = HIT + 0.05;
const WALK_TO = WALK_FROM + 0.7;
export const SERVE_END = WALK_TO + 1.2;
export const SERVE_HIT = HIT;

interface RacketKey {
  t: number;
  hand: Point3;
  dir: Point3;
}

const RACKET_KEYS: RacketKey[] = [
  { t: 0, hand: RACKET_HAND, dir: RACKET_UP },
  { t: 0.45, hand: [-14, -30, 72], dir: [-0.6, -0.5, 0.5] },
  { t: BOUNCE - 0.04, hand: [-14, -30, 70], dir: [-0.6, -0.5, 0.4] },
  { t: HIT, hand: add(HIT_POINT, [-HIT_DIR[0] * RACKET_LENGTH, -HIT_DIR[1] * RACKET_LENGTH, -HIT_DIR[2] * RACKET_LENGTH]), dir: HIT_DIR },
  { t: HIT + 0.22, hand: [26, -22, 92], dir: [0.5, -0.1, 0.9] },
  { t: WALK_TO, hand: RACKET_HAND, dir: RACKET_UP },
];

function racketAt(t: number, keys: RacketKey[] = RACKET_KEYS) {
  const index = Math.max(0, keys.findIndex((key) => key.t > t) - 1);
  const from = keys[index]!;
  const to = keys[index + 1] ?? from;
  const raw = to === from ? 1 : window01(t, from.t, to.t);
  const eased = to.t === HIT || to.t === V_HIT ? raw * raw : smooth(raw);
  return { hand: lerp(from.hand, to.hand, eased), dir: unit(lerp(from.dir, to.dir, eased)) };
}

function serveBall(t: number, hand: Point3): Pose["ball"] {
  if (t < RELEASE) return { at: add(hand, [0, 0, -HELD_GAP]), squash: 0, scale: 1 };
  if (t < BOUNCE) {
    const s = t - RELEASE;
    return { at: [DROP_HAND[0], DROP_HAND[1], DROP_Z - (GRAVITY * s * s) / 2], squash: 0, scale: 1 };
  }
  if (t < HIT) {
    const s = t - BOUNCE;
    const squash = s < 0.022 ? 0.28 * (1 - s / 0.022) : 0;
    return { at: [DROP_HAND[0], DROP_HAND[1], BALL_R + RISE_SPEED * s - (GRAVITY * s * s) / 2], squash, scale: 1 };
  }
  const s = t - HIT;
  const scale = 1 - smooth((s - 0.25) / 0.2);
  if (scale <= 0) return null;
  return { at: add(HIT_POINT, [SHOT[0] * s, SHOT[1] * s, SHOT[2] * s - (GRAVITY * s * s) / 2]), squash: 0, scale };
}

function stepFeet(progress: (foot: number) => number, distance: number): [Point3, Point3] {
  return FEET.map((foot, index) => {
    const p = progress(index);
    return add(foot, [distance * smooth(p), 0, 4 * Math.sin(Math.PI * p)]);
  }) as [Point3, Point3];
}

function nearHandAt(t: number) {
  if (t < RELEASE) return lerp(DRIBBLE_HAND, DROP_HAND, smooth(t / RELEASE));
  return lerp(DROP_HAND, [30, 15, 80], smooth((t - RELEASE) / 0.4));
}

const readyHop = (t: number) => -1.2 * (0.5 + 0.5 * Math.sin(t * Math.PI * 3.2));

export function servePose(t: number): Pose {
  const base = ADVANCE * smooth(window01(t, WALK_FROM, WALK_TO));
  const racket = racketAt(t);
  const nearHand = nearHandAt(t);
  const ball = serveBall(t, nearHand);
  const walk = WALK_TO - WALK_FROM;
  return {
    base,
    bob: t > WALK_TO ? readyHop(t) : 0,
    feet: stepFeet((foot) => window01(t, WALK_FROM + foot * walk * 0.35, WALK_FROM + walk * (0.65 + foot * 0.35)), ADVANCE),
    nearHand: add(nearHand, [base, 0, 0]),
    racketHand: add(racket.hand, [t < HIT ? 0 : base, 0, 0]),
    racketDir: racket.dir,
    ball,
    look: t < HIT + 0.3 && ball ? lookAt(ball.at[2]) : 0,
  };
}

const WALK_BACK = 0.9;
const BALL_POP = 0.3;
export const RETURN_END = WALK_BACK + BALL_POP;

export function returnPose(t: number): Pose {
  const rest = dribblePose(DRIBBLE_REST);
  const back = smooth(t / WALK_BACK);
  const base = ADVANCE * (1 - back);
  const hand: Point3 = lerp([30, 15, 80], DRIBBLE_HAND, back);
  const pop = smooth((t - WALK_BACK) / BALL_POP);
  return {
    ...rest,
    base,
    bob: rest.bob * back,
    feet: stepFeet((foot) => 1 - window01(t, foot * WALK_BACK * 0.3, WALK_BACK * (0.7 + foot * 0.3)), ADVANCE),
    nearHand: add(hand, [base, 0, 0]),
    racketHand: add(RACKET_HAND, [base, 0, 0]),
    racketDir: RACKET_UP,
    ball: pop > 0 ? { at: add(DRIBBLE_HAND, [0, 0, -HELD_GAP]), squash: 0, scale: pop } : null,
  };
}

const V_HIT = 0.85;
const V_HIT_POINT: Point3 = [32, -10, 76];
const V_DIR = unit([0.8, 0.3, -0.15]);
const V_FROM: Point3 = [300, 36, 150];
const V_SHOT: Point3 = [380, -10, 90];
const V_WALK_FROM = V_HIT + 0.05;
const V_WALK_TO = V_WALK_FROM + 0.7;
export const VOLLEY_END = V_WALK_TO + 1.2;
export const VOLLEY_HIT = V_HIT;

const VOLLEY_KEYS: RacketKey[] = [
  { t: 0, hand: RACKET_HAND, dir: RACKET_UP },
  { t: V_HIT - 0.3, hand: [-6, -32, 84], dir: [0.1, -0.5, 0.9] },
  { t: V_HIT, hand: add(V_HIT_POINT, [-V_DIR[0] * RACKET_LENGTH, -V_DIR[1] * RACKET_LENGTH, -V_DIR[2] * RACKET_LENGTH]), dir: V_DIR },
  { t: V_HIT + 0.22, hand: [34, -24, 80], dir: [0.7, -0.1, 0.5] },
  { t: V_WALK_TO, hand: RACKET_HAND, dir: RACKET_UP },
];

function volleyBall(t: number): Pose["ball"] {
  if (t < V_HIT) {
    const u = (t - 0.1) / (V_HIT - 0.1);
    return { at: add(lerp(V_FROM, V_HIT_POINT, u), [0, 0, 30 * Math.sin(Math.PI * u)]), squash: 0, scale: smooth(u / 0.3) };
  }
  const s = t - V_HIT;
  const scale = 1 - smooth((s - 0.25) / 0.2);
  if (scale <= 0) return null;
  return { at: add(V_HIT_POINT, [V_SHOT[0] * s, V_SHOT[1] * s, V_SHOT[2] * s - (GRAVITY * s * s) / 2]), squash: 0, scale };
}

export function volleyPose(t: number): Pose {
  const base = ADVANCE * smooth(window01(t, V_WALK_FROM, V_WALK_TO));
  const racket = racketAt(t, VOLLEY_KEYS);
  const nearHand = lerp(DRIBBLE_HAND, [30, 15, 80], smooth(t / 0.5));
  const ball = volleyBall(t);
  const walk = V_WALK_TO - V_WALK_FROM;
  return {
    base,
    bob: t > V_WALK_TO ? readyHop(t) : 0,
    feet: stepFeet((foot) => window01(t, V_WALK_FROM + foot * walk * 0.35, V_WALK_FROM + walk * (0.65 + foot * 0.35)), ADVANCE),
    nearHand: add(nearHand, [base, 0, 0]),
    racketHand: add(racket.hand, [t < V_HIT ? 0 : base, 0, 0]),
    racketDir: racket.dir,
    ball,
    look: t < V_HIT + 0.3 && ball ? lookAt(ball.at[2]) : 0,
  };
}

export const readyPose = (): Pose => ({ ...volleyPose(0), ball: null });

export interface Scene {
  mode: "dribble" | "serve" | "volley" | "return";
  kind: "serve" | "volley";
  t: number;
  dribble: number;
  seen: number;
  bounces: number;
  pending: boolean;
}

export const startScene = (): Scene => ({ mode: "dribble", kind: "serve", t: 0, dribble: DRIBBLE_REST, seen: dribbleAt(DRIBBLE_REST).bounces, bounces: 0, pending: false });

function nextMode(scene: Scene, waiting: boolean) {
  if (scene.mode === "dribble" && scene.pending) return { mode: scene.kind, t: 0, pending: false };
  if (scene.mode === "serve" && scene.t >= SERVE_END && !waiting) return { mode: "return" as const, t: 0 };
  if (scene.mode === "volley" && scene.t >= VOLLEY_END && !waiting) return { mode: "return" as const, t: 0 };
  if (scene.mode === "return" && scene.t >= RETURN_END) return { mode: "dribble" as const, t: 0, dribble: DRIBBLE_REST, seen: dribbleAt(DRIBBLE_REST).bounces };
  return null;
}

function countBounce(scene: Scene) {
  const seen = dribbleAt(scene.dribble).bounces;
  if (seen !== scene.seen) Object.assign(scene, { seen, bounces: scene.bounces + 1 });
}

export function advance(scene: Scene, dt: number, { serve, waiting, kind = "serve" }: { serve: boolean; waiting: boolean; kind?: Scene["kind"] }): Pose {
  scene.kind = kind;
  if (serve) scene.pending = true;
  Object.assign(scene, nextMode(scene, waiting));
  scene.t += dt;
  if (scene.mode === "serve") return servePose(scene.t);
  if (scene.mode === "volley") return volleyPose(scene.t);
  if (scene.mode === "return") return returnPose(scene.t);
  if (kind === "volley") return readyPose();
  scene.dribble += dt;
  countBounce(scene);
  return dribblePose(scene.dribble);
}

export function sceneText(scene: Scene, readout: (bounces: number) => string) {
  if (scene.mode === "serve") return scene.t < SERVE_HIT ? "¡Saque!" : "Esperando la devolución…";
  if (scene.mode === "volley") return scene.t < VOLLEY_HIT ? "¡Ahí viene!" : "¡Volea!";
  if (scene.mode === "return") return "No llegó. Otra vez a la línea";
  return readout(scene.bounces);
}
