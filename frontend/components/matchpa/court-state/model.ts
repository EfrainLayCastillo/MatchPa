export const GRAVITY = 981;
export const RESTITUTION = 0.74;
export const BALL_R = 4.5;
export const HAND_R = 5;
export const PUSH = 6;
export const HAND_REST_Z = 84;

const CARRY = 0.28;
const HOLD = 0.62;
const RETURN = 0.22;

const releaseZ = HAND_REST_Z - HAND_R - BALL_R - PUSH;
const dropHeight = releaseZ - BALL_R;
const riseSpeed = Math.sqrt(2 * GRAVITY * dropHeight);
const impactSpeed = riseSpeed / RESTITUTION;
const pushSpeed = Math.sqrt(impactSpeed ** 2 - 2 * GRAVITY * dropHeight);

const T_PUSH = (2 * PUSH) / pushSpeed;
const T_FALL = (impactSpeed - pushSpeed) / GRAVITY;
const T_RISE = riseSpeed / GRAVITY;
const T_BOUNCE = T_PUSH + T_FALL;
const T_APEX = T_BOUNCE + T_RISE;
export const CYCLE = T_APEX + CARRY + HOLD;

const SQUASH_SPAN = 0.022;

export interface Dribble {
  handZ: number;
  ballZ: number;
  squash: number;
  bob: number;
  bounces: number;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

function ballHeight(t: number, handZ: number) {
  const held = handZ - HAND_R - BALL_R;
  if (t < T_PUSH || t >= T_APEX) return held;
  if (t < T_BOUNCE) {
    const s = t - T_PUSH;
    return releaseZ - pushSpeed * s - (GRAVITY * s * s) / 2;
  }
  const s = t - T_BOUNCE;
  return BALL_R + riseSpeed * s - (GRAVITY * s * s) / 2;
}

function handHeight(t: number) {
  const low = HAND_REST_Z - PUSH;
  if (t < T_PUSH) return HAND_REST_Z - PUSH * (t / T_PUSH) ** 2;
  if (t < T_PUSH + RETURN) return low + PUSH * smooth((t - T_PUSH) / RETURN);
  const meet = T_APEX - RETURN;
  if (t < meet) return HAND_REST_Z;
  if (t < T_APEX) return HAND_REST_Z - PUSH * smooth((t - meet) / RETURN);
  return low + PUSH * smooth((t - T_APEX) / CARRY);
}

export function dribbleAt(seconds: number): Dribble {
  const t = seconds % CYCLE;
  const handZ = handHeight(t);
  const fromImpact = Math.abs(t - T_BOUNCE);
  const squash =
    fromImpact < SQUASH_SPAN ? 0.28 * (1 - fromImpact / SQUASH_SPAN) : 0;
  const fromPush = Math.min(Math.abs(t - T_PUSH), CYCLE - Math.abs(t - T_PUSH));
  return {
    handZ,
    ballZ: ballHeight(t, handZ),
    squash,
    bob: -1.6 * (1 - smooth(fromPush / 0.3)),
    bounces: Math.floor((seconds + CYCLE - T_BOUNCE) / CYCLE),
  };
}

export const REST: Dribble = dribbleAt(CYCLE - 0.01);

export const readoutOf = (bounces: number) => `Bote ${bounces}`;
