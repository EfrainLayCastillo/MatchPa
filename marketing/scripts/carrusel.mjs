// Uso: node scripts/carrusel.mjs <slug>
// Saca un PNG por slide de carruseles/<slug>/index.html, según data-slides="1,1,1,1" del root, con snapshot (sin render).
// Deja renders/<slug>/slide-N.png, listos para subir a Instagram en orden, y publicacion.md con el caption y los hashtags del guion.
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RUNTIMES = join(process.env.HOME, "Library/Application Support/HyperFrames/runtimes");
const ffmpegDir = join(RUNTIMES, readdirSync(RUNTIMES).find((d) => d.startsWith("ffmpeg-")));

const slug = process.argv[2];
if (!slug) throw new Error("Uso: node scripts/carrusel.mjs <slug>");
const piece = join(ROOT, "carruseles", slug);
const outDir = join(ROOT, "renders", slug);

function restTimes(html) {
  const durations = html.match(/data-slides="([^"]+)"/)?.[1].split(",").map(Number);
  if (!durations?.length) throw new Error('El root no tiene data-slides="1,1,1,1"');
  return durations.map((duration, i) => +(durations.slice(0, i).reduce((a, b) => a + b, 0) + duration - 0.3).toFixed(2));
}

function snapshot(times) {
  const env = { ...process.env, PATH: `${ffmpegDir}:${process.env.PATH}` };
  const log = execFileSync("npx", ["hyperframes", "snapshot", ".", "--at", times.join(",")], { cwd: piece, env, encoding: "utf8" });
  return [...log.matchAll(/(\S+frame-\d+-at-([\d.]+)s\.png)/g)].filter((m) => times.includes(Number(m[2]))).map((m) => m[1]);
}

function publication() {
  const script = readFileSync(join(ROOT, "guiones", `${slug}.md`), "utf8");
  const field = (name) => script.match(new RegExp(`\\*\\*${name}:\\*\\*\\s*(.+)`))?.[1].trim() ?? "";
  const title = script.match(/^# (.+)/m)?.[1] ?? slug;
  const altText = script.split(/^## Alt text\s*$/m)[1]?.split(/^## /m)[0].trim() ?? "";
  const out = join(outDir, "publicacion.md");
  writeFileSync(out, `# ${title}\n\n## Caption\n\n${field("Caption")}\n\n## Hashtags\n\n${field("Hashtags")}\n\n## Alt text\n\n${altText}\n`);
  console.log(out);
}

mkdirSync(outDir, { recursive: true });
snapshot(restTimes(readFileSync(join(piece, "index.html"), "utf8"))).forEach((frame, i) => {
  const out = join(outDir, `slide-${i + 1}.png`);
  copyFileSync(frame, out);
  console.log(out);
});
publication();
