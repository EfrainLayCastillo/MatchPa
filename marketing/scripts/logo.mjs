// Uso: node scripts/logo.mjs → assets/marca/logo/ (logo, logo-verde e isotipo en SVG y PNG, y preview.html).
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as fontkit from "fontkit";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "assets/marca/logo");
const C = { marfil: "#f5f0f0", lima: "#e6fa50", turquesa: "#50c8c8", verde: "#003c3c" };

const bricolage = fontkit.openSync(join(ROOT, "assets/fonts/Bricolage.ttf")).getVariation({ wght: 800, opsz: 96, wdth: 100 });
const yellowtail = fontkit.openSync(join(ROOT, "assets/fonts/Yellowtail.ttf"));

function outline(font, text, size, x, baseline) {
  const scale = size / font.unitsPerEm;
  const run = font.layout(text);
  let pen = x;
  const parts = run.glyphs.map((glyph, i) => {
    const position = run.positions[i];
    const d = glyph.path.scale(scale, -scale).translate(pen + position.xOffset * scale, baseline - position.yOffset * scale).toSVG();
    pen += position.xAdvance * scale;
    return { d, bbox: glyph.path.scale(scale, -scale).translate(pen - position.xAdvance * scale, baseline).bbox };
  });
  return { d: parts.map((p) => p.d).join(""), bbox: union(parts.map((p) => p.bbox)), end: pen };
}

function union(boxes) {
  const real = boxes.filter((b) => Number.isFinite(b.minX));
  return {
    minX: Math.min(...real.map((b) => b.minX)),
    minY: Math.min(...real.map((b) => Math.min(b.minY, b.maxY))),
    maxX: Math.max(...real.map((b) => b.maxX)),
    maxY: Math.max(...real.map((b) => Math.max(b.minY, b.maxY))),
  };
}

const svg = (w, h, viewBox, body, label) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${viewBox}" role="img" aria-label="${label}">${body}</svg>\n`;

function wordmark(match, pa) {
  const size = 200;
  const word = outline(bricolage, "Match", size, 0, 0);
  const script = outline(yellowtail, "Pa", size * 1.35, word.end - size * 0.2, 0);
  const box = union([word.bbox, script.bbox]);
  const pad = size * 0.12;
  const [x, y, w, h] = [box.minX - pad, box.minY - pad, box.maxX - box.minX + pad * 2, box.maxY - box.minY + pad * 2].map((n) => +n.toFixed(1));
  const body = `<path fill="${match}" d="${word.d}"/><path fill="${pa}" d="${script.d}"/>`;
  return svg(w, h, `${x} ${y} ${w} ${h}`, body, "MatchPa");
}

function star(cx, cy, r) {
  return `M${cx} ${cy - r}Q${cx} ${cy} ${cx + r} ${cy}Q${cx} ${cy} ${cx} ${cy + r}Q${cx} ${cy} ${cx - r} ${cy}Q${cx} ${cy} ${cx} ${cy - r}Z`;
}

function isotipo() {
  const side = 1024;
  const probe = outline(yellowtail, "Pa", 600, 0, 0).bbox;
  const dx = side / 2 - (probe.minX + probe.maxX) / 2;
  const dy = side / 2 - (probe.minY + probe.maxY) / 2;
  const pa = outline(yellowtail, "Pa", 600, dx, dy);
  const body = `<rect width="${side}" height="${side}" rx="224" fill="${C.verde}"/><path fill="${C.lima}" d="${pa.d}"/><path fill="${C.turquesa}" d="${star(790, 250, 92)}"/>`;
  return svg(side, side, `0 0 ${side} ${side}`, body, "MatchPa");
}

function save(name, content, pngWidth) {
  writeFileSync(join(OUT, `${name}.svg`), content);
  execFileSync("rsvg-convert", ["-w", String(pngWidth), "-o", join(OUT, `${name}.png`), join(OUT, `${name}.svg`)]);
}

const preview = (files) =>
  `<!doctype html><meta charset="utf-8"><title>Logo MatchPa</title><body style="margin:0;display:grid;gap:24px;padding:24px;background:#ccc;font-family:sans-serif">${files
    .map(([file, bg]) => `<div style="background:${bg};padding:48px;border-radius:16px"><img src="${file}.svg" style="max-width:min(100%,640px);max-height:320px"></div>`)
    .join("")}</body>`;

mkdirSync(OUT, { recursive: true });
save("logo", wordmark(C.marfil, C.lima), 2000);
save("logo-verde", wordmark(C.verde, C.verde), 2000);
save("isotipo", isotipo(), 1024);
writeFileSync(join(OUT, "preview.html"), preview([["logo", C.verde], ["logo-verde", C.marfil], ["logo-verde", C.lima], ["isotipo", C.marfil]]));
