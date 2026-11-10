import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { MatchImage } from "@/lib/match-images";
import { MATCH_IMAGES } from "@/lib/match-images";

const root = process.cwd();

async function dataUri(path: string, mime: string): Promise<string> {
  const file = await readFile(join(root, path));
  return `data:${mime};base64,${file.toString("base64")}`;
}

/** Brand fonts as TTF: the image renderer reads neither woff2 nor next/font output. */
export async function ogFonts() {
  const font = (file: string) => readFile(join(root, "assets/fonts", file));
  const [heading, body, script] = await Promise.all([
    font("bricolage-800.ttf"),
    font("bricolage-500.ttf"),
    font("yellowtail-400.ttf"),
  ]);
  return [
    { name: "Bricolage", data: heading, weight: 800 as const, style: "normal" as const },
    { name: "Bricolage", data: body, weight: 500 as const, style: "normal" as const },
    { name: "Yellowtail", data: script, weight: 400 as const, style: "normal" as const },
  ];
}

export const ogLogo = () => dataUri("public/logo/logo.svg", "image/svg+xml");

export const ogPhoto = (image: MatchImage) => dataUri(`public${MATCH_IMAGES[image]}`, "image/jpeg");
