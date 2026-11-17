// Genera la voz en off de un guion con la voz que indica su línea **Voz:**.
//   node scripts/vo.mjs 2026-10-30-que-es-matchpa [--solo 3,5 | --junto]  (--junto: toda la voz en off en una sola toma, assets/vo/vo-completa.wav)
//   **Voz:** Voicebox, perfil `efrain`      → Voicebox local (VOICEBOX_MODEL=0.6B si Docker tiene menos de 10 GB) (servicio `voicebox` del docker-compose.yml, http://localhost:17600), tiempos por palabra con Whisper.
//   **Voz:** HeyGen `<id de 32 caracteres>` → HeyGen (requiere plan de HyperFrames).
// Lee la tabla "## Voz en off" de guiones/<slug>.md y escribe videos/<slug>/assets/vo/vo-N.wav y vo-N.json (palabras con tiempos).
import { readFileSync, writeFileSync, mkdirSync, readdirSync, renameSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const APP = `${process.env.HOME}/Library/Application Support/HyperFrames`;
const RUNTIMES = `${APP}/runtimes`;
const runtime = (prefix) => `${RUNTIMES}/${readdirSync(RUNTIMES).find((d) => d.startsWith(prefix))}`;
const MEDIA_USE = `${runtime("cli-darwin-arm64-")}/node_modules/hyperframes/dist/skills/media-use`;
const TTS = `${MEDIA_USE}/audio/scripts/heygen-tts.mjs`;
const VOICEBOX = process.env.VOICEBOX_URL ?? "http://127.0.0.1:17600";
const VOICEBOX_MODEL = process.env.VOICEBOX_MODEL ?? "1.7B";
process.env.PATH = `${runtime("ffmpeg-darwin-arm64-")}:${process.env.PATH}`;

const slug = process.argv[2];
if (!slug) throw new Error("Falta el slug: node scripts/vo.mjs 2026-10-30-que-es-matchpa");
const only = process.argv.includes("--solo") ? process.argv[process.argv.indexOf("--solo") + 1].split(",").map(Number) : null;
const project = join(ROOT, "videos", slug);
const out = join(project, "assets/vo");

function readScript() {
  const script = readFileSync(join(ROOT, "guiones", `${slug}.md`), "utf8");
  const voiceLine = script.match(/\*\*Voz:\*\*([^\n]*)/)?.[1] ?? "";
  const id = voiceLine.match(/`([^`]+)`/)?.[1];
  if (!id) throw new Error("El guion no tiene la línea **Voz:** con el perfil de Voicebox o el id de HeyGen entre backticks");
  const section = script.split(/^## Voz en off/m)[1]?.split(/^## /m)[0] ?? "";
  const lines = [...section.matchAll(/^\|\s*(\d+)\s*\|[^|]*\|\s*"(.+)"\s*\|/gm)].map(([, n, text]) => ({ n: +n, text }));
  if (!lines.length) throw new Error("No encontré líneas en la tabla de Voz en off");
  return { engine: /voicebox/i.test(voiceLine) ? "voicebox" : "heygen", id, lines };
}

function heygen(voice, text, wav, json) {
  execFileSync("node", [TTS, text, "-o", wav, "--words", json, "--voice", voice, "--lang", "es"], { stdio: ["ignore", "ignore", "inherit"] });
}

async function voiceboxProfile(name) {
  const res = await fetch(`${VOICEBOX}/profiles`).catch(() => null);
  if (!res?.ok) throw new Error(`Voicebox no responde en ${VOICEBOX}. Levántalo desde la raíz del repo con: docker compose --profile marketing up -d voicebox`);
  const profile = (await res.json()).find((p) => p.id === name || p.name.toLowerCase() === name.toLowerCase());
  if (!profile) throw new Error(`No existe el perfil "${name}" en Voicebox. Créalo en ${VOICEBOX} con tu voz.`);
  return profile.id;
}

async function waitForGeneration(id) {
  for (;;) {
    const res = await fetch(`${VOICEBOX}/history/${id}`).catch(() => null);
    const gen = res?.ok ? await res.json() : null;
    if (gen?.status === "completed") return;
    if (gen?.status === "failed") throw new Error(`Voicebox: ${gen.error ?? "falló la generación"}`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

function transcribe(wav) {
  const raw = execFileSync("npx", ["hyperframes", "transcribe", wav, "--engine", "whisper", "--model", "small", "--language", "es", "--json", "-d", project], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  const { transcriptPath } = JSON.parse(raw.slice(raw.indexOf("{")));
  return JSON.parse(readFileSync(transcriptPath, "utf8")).map((w) => ({ text: (w.text ?? w.word).trim(), start: w.start, end: w.end }));
}

const DIGITS = { 1: "uno", 2: "dos", 3: "tres", 4: "cuatro", 5: "cinco", 6: "seis", 7: "siete", 8: "ocho", 9: "nueve", 10: "diez" };
/** Whisper writes numbers as digits ("8", "4"): compare them as the words the script spells. */
const norm = (word) => {
  const plain = word.normalize("NFD").replace(/[^a-z0-9ñ]/gi, "").toLowerCase();
  return DIGITS[plain] ?? plain;
};

function editDistance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const above = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return row[b.length];
}

/** Whisper mishears a letter or two ("Machpa"), but a dropped or added final n/s is the model's own slip ("descubre", "hace"): not the same word. */
function sameWord(said, target) {
  if (said === undefined) return false;
  const droppedEnding = ["n", "s"].some((letter) => said + letter === target || said === target + letter);
  return !droppedEnding && editDistance(said, target) <= Math.max(1, Math.floor(target.length / 4));
}

/** Whisper splits brand words ("Match Pa"): a pair that spells a target word counts as that word. */
function joinSplitWords(said, target) {
  const joined = [];
  for (let i = 0; i < said.length; i += 1) {
    const pair = said[i] + (said[i + 1] ?? "");
    const split = target.includes(pair) && !target.includes(said[i]);
    joined.push({ word: split ? pair : said[i], raw: split ? 2 : 1 });
    if (split) i += 1;
  }
  return joined;
}

/** Dónde empieza la frase pedida y cuántas palabras crudas de Whisper ocupa; exige todas las palabras. El modelo a veces recita antes el final de la muestra de referencia. */
function phraseStart(words, text) {
  const target = text.split(/\s+/).map(norm).filter(Boolean);
  const said = joinSplitWords(words.map((w) => norm(w.text)), target);
  const fits = (i) => target.every((t, j) => sameWord(said[i + j]?.word, t));
  const from = said.findIndex((_, i) => fits(i));
  if (from < 0) return null;
  const rawFrom = said.slice(0, from).reduce((n, { raw }) => n + raw, 0);
  const count = said.slice(from, from + target.length).reduce((n, { raw }) => n + raw, 0);
  return { from: rawFrom, count };
}

function trimTo(wav, words, from, count) {
  const cut = Math.max(0, words[from].start - 0.08);
  const last = Math.min(from + count, words.length) - 1;
  const tail = words[last].end - cut + 0.15;
  const tmp = wav.replace(/\.wav$/, ".tmp.wav");
  // The model can stop on the last syllable: pad silence and fade so a line never ends dry.
  const fade = `apad=pad_dur=0.8,atrim=0:${(tail + 0.6).toFixed(3)},afade=t=out:st=${tail.toFixed(3)}:d=0.45`;
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", wav, "-ss", String(cut), "-af", fade, tmp]);
  renameSync(tmp, wav);
  return words.slice(from, last + 1).map((w) => ({ ...w, start: +(w.start - cut).toFixed(3), end: +(w.end - cut).toFixed(3) }));
}

/** Palabras de la frase pedida, recortando el audio a ella; null si el modelo no la dijo. */
function wordsOf(wav, text) {
  const words = transcribe(wav);
  const phrase = phraseStart(words, text);
  if (!phrase) {
    console.log(`  Whisper oyó: "${words.map((w) => w.text).join(" ")}"`);
    return null;
  }
  return trimTo(wav, words, phrase.from, phrase.count);
}

async function voiceboxOnce(profileId, text, wav, seed) {
  const res = await fetch(`${VOICEBOX}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile_id: profileId, text, language: "es", model_size: VOICEBOX_MODEL, seed }),
  });
  if (!res.ok) throw new Error(`Voicebox /generate: ${res.status} ${await res.text()}`);
  const { id } = await res.json();
  await waitForGeneration(id);
  writeFileSync(wav, Buffer.from(await (await fetch(`${VOICEBOX}/audio/${id}`)).arrayBuffer()));
  return wordsOf(wav, text);
}

/** Up to 3 seeds; if none says every word, keep the last take and flag it for a listen instead of looping. */
async function voicebox(profileId, text, wav, json) {
  const base = Math.floor(Math.random() * 100_000);
  for (const seed of [base, base + 7919, base + 15838]) {
    const words = await voiceboxOnce(profileId, text, wav, seed);
    if (words) return writeFileSync(json, JSON.stringify(words, null, 2));
    console.log(`  "${text}" salió distinto con la semilla ${seed}; reintento`);
  }
  const heard = transcribe(wav);
  writeFileSync(json, JSON.stringify(trimTo(wav, heard, 0, heard.length), null, 2));
  console.log(`  REVISAR A OÍDO: se quedó la última toma de "${text}"`);
}

const { engine, id, lines } = readScript();
mkdirSync(out, { recursive: true });
const profileId = engine === "voicebox" ? await voiceboxProfile(id) : id;

if (process.argv.includes("--junto")) {
  const wav = join(out, "vo-completa.wav");
  const words = await voiceboxOnce(profileId, lines.map(({ text }) => text).join(" "), wav, 7);
  if (words) writeFileSync(join(out, "vo-completa.json"), JSON.stringify(words, null, 2));
  console.log(`vo-completa.wav: ${words ? `${words.at(-1).end.toFixed(1)} s` : "Whisper no reconoció la frase completa"}`);
  process.exit(0);
}

for (const { n, text } of lines.filter(({ n }) => !only || only.includes(n))) {
  const wav = join(out, `vo-${n}.wav`), json = join(out, `vo-${n}.json`);
  await (engine === "voicebox" ? voicebox(profileId, text, wav, json) : heygen(profileId, text, wav, json));
  const words = JSON.parse(readFileSync(json, "utf8"));
  console.log(`vo-${n}: ${words.map((w) => `${w.text}@${w.start.toFixed(2)}`).join(" ")}`);
}
