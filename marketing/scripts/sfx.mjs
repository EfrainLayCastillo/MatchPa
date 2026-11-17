// Librería de sonidos compartida en assets/sfx, con su catálogo en assets/sfx/CATALOGO.md.
//   node scripts/sfx.mjs buscar "padel ball hit"                  → candidatos de la librería de HeyGen
//   node scripts/sfx.mjs bajar "padel ball hit" <id> <nombre> "uso" → descarga, mide y lo agrega al catálogo
//   node scripts/sfx.mjs catalogo                                  → vuelve a medir todo y reescribe CATALOGO.md
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "assets/sfx");
const INDEX = join(DIR, "sfx.json");
const APP = `${process.env.HOME}/Library/Application Support/HyperFrames`;
const RUNTIMES = `${APP}/runtimes`;
const runtime = (prefix) => `${RUNTIMES}/${readdirSync(RUNTIMES).find((d) => d.startsWith(prefix))}`;
const MEDIA_USE = `${runtime("cli-darwin-arm64-")}/node_modules/hyperframes/dist/skills/media-use`;
const LIB = `${MEDIA_USE}/audio/scripts/lib/heygen.mjs`;
process.env.PATH = `${runtime("ffmpeg-darwin-arm64-")}:${process.env.PATH}`;

const index = () => (existsSync(INDEX) ? JSON.parse(readFileSync(INDEX, "utf8")) : {});

async function heygen() {
  const { searchSounds, heygenAuthHeaders, downloadTo } = await import(LIB);
  return { search: (q) => searchSounds(q, "sound_effects", heygenAuthHeaders(), { limit: 6, minScore: 0.3 }), downloadTo };
}

function measure(files) {
  const out = execFileSync("npx", ["--yes", "hyperframes@0.8.216", "audio", ...files], { cwd: DIR, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  const result = {};
  let current;
  for (const line of out.split("\n")) {
    const head = line.match(/^(\S+\.(?:mp3|wav))\s+([\d.]+) s/);
    if (head) result[(current = head[1])] = { duration: +head[2] };
    const peak = line.match(/peak ([\d.]+)/);
    if (peak && current && result[current].peak === undefined) result[current].peak = +peak[1];
  }
  return result;
}

function writeCatalog() {
  const all = index();
  const files = Object.keys(all).map((name) => `${name}.mp3`);
  const sizes = measure(files);
  const rows = Object.entries(all).map(([name, meta]) => {
    const m = sizes[`${name}.mp3`] ?? {};
    return `| \`${name}\` | ${m.duration ?? "?"} | ${m.peak ?? "?"} | ${meta.uso} | ${meta.fuente} |`;
  });
  writeFileSync(join(DIR, "CATALOGO.md"), `# Catálogo de sonidos

Generado con \`node scripts/sfx.mjs catalogo\`; no lo edites a mano (los usos viven en \`sfx.json\`).
**Golpe (s)** es dónde cae el pico dentro del archivo: para que suene en el segundo \`t\`, pon \`data-start = t - golpe\`.

| Nombre | Duración (s) | Golpe (s) | Uso | Fuente |
|---|---|---|---|---|
${rows.join("\n")}
`);
  console.log(`CATALOGO.md: ${rows.length} sonidos`);
}

const [command, ...args] = process.argv.slice(2);
if (command === "buscar") {
  const { search } = await heygen();
  for (const s of await search(args[0])) console.log(`${s.id}  ${s.score.toFixed(2)}  ${s.duration}s  ${s.description}`);
} else if (command === "bajar") {
  const [query, id, name, uso] = args;
  const { search, downloadTo } = await heygen();
  const hit = (await search(query)).find((s) => s.id === id);
  if (!hit) throw new Error(`No aparece ${id} al buscar "${query}"`);
  await downloadTo(hit.audio_url, join(DIR, `${name}.mp3`));
  writeFileSync(INDEX, JSON.stringify({ ...index(), [name]: { uso, fuente: `HeyGen ${id}` } }, null, 2));
  writeCatalog();
} else if (command === "catalogo") {
  writeCatalog();
} else {
  console.log(readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(0, 4).join("\n"));
}
