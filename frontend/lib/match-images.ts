export const MATCH_IMAGES = {
  bg1: "/static/bg1.jpg",
  bg2: "/static/bg2.jpg",
} as const;

export type MatchImage = keyof typeof MATCH_IMAGES;

/** Only known keys are accepted, so the `?img=` query param can't point anywhere else. */
export function toMatchImage(value: string | null): MatchImage {
  return value !== null && value in MATCH_IMAGES ? (value as MatchImage) : "bg1";
}
