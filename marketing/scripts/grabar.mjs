// Uso: node scripts/grabar.mjs <slug> [--solo 01-disponibles,02-invitar] [--port 3123] [--sync]
// Graba las tomas de videos/<slug>/tomas.mjs contra el frontend en modo mock (NEXT_PUBLIC_MOCK_API=true) y las sincroniza
// con la composición. --sync no graba: solo vuelve a escribir la composición desde assets/tomas.json (tras cambiar un corte).
// Deja grabaciones/<slug>/<toma>.mp4 (30 fps), su copia en videos/<slug>/assets/rec/ y assets/tomas.json; en index.html reemplaza
// `const TOMAS = …;` y los bloques <!-- tomas-video:start/end --> (un <video> por toma) y <!-- tomas-audio:start/end --> (un clic por toque).
import { spawn, execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, openSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(ROOT, "../frontend");
const FRONTEND = join(ROOT, ".cache/frontend-mock");
const VIEWPORT = { width: 390, height: 844 };
const arg = (name) => (process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : null);

const slug = process.argv[2];
if (!slug) throw new Error("Uso: node scripts/grabar.mjs <slug>");
const port = Number(arg("--port") ?? 3123);
const only = arg("--solo")?.split(",");
const base = `http://localhost:${port}`;
const { default: tomas } = await import(pathToFileURL(join(ROOT, "videos", slug, "tomas.mjs")).href);
const outDir = join(ROOT, "grabaciones", slug);
const rawDir = join(outDir, ".raw");
const jsonPath = join(ROOT, "videos", slug, "assets", "tomas.json");

const ffmpegDir = readdirSync(join(process.env.HOME, "Library/Application Support/HyperFrames/runtimes")).find((d) => d.startsWith("ffmpeg-"));
const ffmpeg = join(process.env.HOME, "Library/Application Support/HyperFrames/runtimes", ffmpegDir, "ffmpeg");

async function waitFor(url, timeoutMs = 120_000) {
  const until = Date.now() + timeoutMs;
  while (Date.now() < until) {
    try { if ((await fetch(url)).status < 500) return; } catch { /* todavía arrancando */ }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`El frontend no respondió en ${url}`);
}

/** Copia del frontend sin .next ni .env, para no chocar con el `next dev` del usuario (Next no permite dos en la misma carpeta). */
function mirrorFrontend() {
  mkdirSync(FRONTEND, { recursive: true });
  const lock = (dir) => (existsSync(join(dir, "package-lock.json")) ? readFileSync(join(dir, "package-lock.json"), "utf8") : "");
  const depsChanged = lock(SOURCE) !== lock(FRONTEND);
  execFileSync("rsync", ["-a", "--delete", "--exclude", ".next", "--exclude", "node_modules", "--exclude", ".env*", `${SOURCE}/`, `${FRONTEND}/`]);
  if (depsChanged) rmSync(join(FRONTEND, "node_modules"), { recursive: true, force: true });
  if (!existsSync(join(FRONTEND, "node_modules"))) execFileSync("cp", ["-al", join(SOURCE, "node_modules"), join(FRONTEND, "node_modules")]);
}

function startFrontend() {
  mirrorFrontend();
  const server = spawn("npx", ["next", "dev", "-p", String(port)], {
    cwd: FRONTEND,
    env: { ...process.env, NEXT_PUBLIC_MOCK_API: "true", NEXT_PUBLIC_API_URL: "http://localhost:9" },
    stdio: ["ignore", openSync(join(ROOT, ".cache/next-mock.log"), "w"), "inherit"],
    detached: true,
  });
  return () => { try { process.kill(-server.pid); } catch { /* ya cerró */ } };
}

/** Ejecuta un paso; devuelve el toque (centro del elemento, normalizado al viewport) si lo hubo. */
async function run(page, step) {
  if (step.goto) return void (await page.goto(base + step.goto, { waitUntil: "networkidle" }));
  if (step.wait) return void (await page.waitForTimeout(step.wait));
  if (step.type) return void (await page.keyboard.type(step.type, { delay: step.delay ?? 140 }));
  if (step.key) return void (await page.keyboard.press(step.key));
  if (step.scroll) return void (await page.evaluate((top) => window.scrollBy({ top, behavior: "smooth" }), step.scroll));
  if (step.tap) {
    const target = step.tap(page);
    await target.waitFor({ state: "visible" });
    const box = await target.boundingBox();
    await target.tap();
    return { x: +((box.x + box.width / 2) / VIEWPORT.width).toFixed(3), y: +((box.y + box.height / 2) / VIEWPORT.height).toFixed(3) };
  }
  throw new Error(`Paso desconocido: ${JSON.stringify(Object.keys(step))}`);
}

/** Screencast de Chrome a 2×. Con la emulación de Playwright los cuadros salen a 1×; por eso la escala va forzada al lanzar Chrome y sin viewport emulado. */
async function startScreencast(page) {
  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  cdp.on("Page.screencastFrame", ({ data, metadata, sessionId }) => {
    frames.push({ t: metadata.timestamp, data });
    cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "png", maxWidth: VIEWPORT.width * 2, maxHeight: VIEWPORT.height * 2, everyNthFrame: 1 });
  return async () => {
    await cdp.send("Page.stopScreencast");
    return frames;
  };
}

function encodeFrames(frames, from, to, dir, out) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const kept = frames.filter((frame, i) => frame.t <= to && (frames[i + 1]?.t ?? to) > from);
  const lines = kept.flatMap((frame, i) => {
    const file = join(dir, `${String(i).padStart(5, "0")}.png`);
    writeFileSync(file, Buffer.from(frame.data, "base64"));
    const begin = Math.max(frame.t, from), end = Math.min(kept[i + 1]?.t ?? to, to);
    return [`file '${file}'`, `duration ${(end - begin).toFixed(4)}`];
  });
  const list = join(dir, "list.txt");
  writeFileSync(list, [...lines, lines.at(-2)].join("\n"));
  execFileSync(ffmpeg, ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", list,
    "-vf", "fps=30,scale=trunc(iw/2)*2:trunc(ih/2)*2", "-c:v", "libx264", "-preset", "slow", "-crf", "10", "-pix_fmt", "yuv420p", "-an", out]);
}

/** Hoy en Panamá a la hora dada ("16:30"): los datos del mock dependen de la hora (eveningOrLater) y así la toma no depende de cuándo se grabe. */
function panamaToday(time) {
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Panama" }).format(new Date());
  return new Date(`${day}T${time}:00-05:00`);
}

async function record(browser, toma) {
  const context = await browser.newContext({
    viewport: null, hasTouch: true, locale: "es-PA", timezoneId: "America/Panama", colorScheme: "light",
  });
  await context.addInitScript(() => {
    const hide = () => document.querySelectorAll("nextjs-portal").forEach((node) => node.remove());
    new MutationObserver(hide).observe(document, { childList: true, subtree: true });
  });
  if (tomas.clock) await context.clock.install({ time: panamaToday(tomas.clock) });
  const page = await context.newPage();
  for (const step of toma.setup ?? []) await run(page, step);
  const stopScreencast = await startScreencast(page);
  await page.waitForTimeout(300);
  const clock = () => Date.now() / 1000;
  const start = clock();
  const taps = [];
  for (const step of toma.steps) {
    const at = clock();
    const tap = await run(page, step);
    if (tap) taps.push({ t: +(at - start).toFixed(2), ...tap, label: step.label ?? null });
  }
  const end = clock();
  const frames = await stopScreencast();
  await context.close();
  const out = join(outDir, `${toma.id}.mp4`);
  encodeFrames(frames, start, end, join(rawDir, toma.id), out);
  console.log(`${toma.id}: ${frames.length} cuadros`);
  mkdirSync(join(ROOT, "videos", slug, "assets/rec"), { recursive: true });
  copyFileSync(out, join(ROOT, "videos", slug, "assets/rec", `${toma.id}.mp4`));
  return { file: `assets/rec/${toma.id}.mp4`, duration: +(end - start).toFixed(2), taps };
}

/** Momento del video final en que ocurre un toque, según el corte de la toma. */
const clipTime = (video, t) => +(video.start + (t - video.from) / video.rate).toFixed(2);

function syncComposition(recorded) {
  const data = Object.fromEntries(tomas.tomas.filter((t) => recorded[t.id]).map((t) => [t.id, { ...recorded[t.id], file: `assets/rec/${t.id}.mp4`, video: t.video }]));
  const placed = Object.entries(data).filter(([, toma]) => toma.video);
  const videos = placed.map(([id, { file, video }], i) =>
    `<video id="toma-${id}" class="rec" src="${file}" data-start="${video.start}" data-duration="${+((video.to - video.from) / video.rate).toFixed(2)}" data-media-start="${video.from}" data-playback-rate="${video.rate}" data-track-index="${8 + i}" muted playsinline></video>`);
  const clicks = placed.flatMap(([id, { taps, video }]) => taps.filter((tap) => tap.t >= video.from && tap.t <= video.to)
    .map((tap, i) => `<audio id="click-${id}-${i}" src="assets/audio/click.mp3" data-start="${clipTime(video, tap.t)}" data-duration="0.36" data-media-start="0" data-volume="0.8" data-track-index="13"></audio>`));
  const page = join(ROOT, "videos", slug, "index.html");
  const block = (name, lines, indent) => `<!-- ${name}:start -->\n${lines.map((l) => indent + l).join("\n")}\n${indent}<!-- ${name}:end -->`;
  let html = readFileSync(page, "utf8").replace(/const TOMAS = .*;/, `const TOMAS = ${JSON.stringify(data)};`);
  html = html.replace(/<!-- tomas-video:start -->[\s\S]*?<!-- tomas-video:end -->/, block("tomas-video", videos, "            "));
  html = html.replace(/<!-- tomas-audio:start -->[\s\S]*?<!-- tomas-audio:end -->/, block("tomas-audio", clicks, "      "));
  writeFileSync(page, html);
  console.log(`index.html: ${videos.length} tomas, ${clicks.length} clics`);
}

if (process.argv.includes("--sync")) {
  syncComposition(JSON.parse(readFileSync(jsonPath, "utf8")));
  process.exit(0);
}

mkdirSync(rawDir, { recursive: true });
mkdirSync(join(ROOT, ".cache"), { recursive: true });
const stop = startFrontend();
try {
  await waitFor(`${base}/lobby`);
  const browser = await chromium.launch({ args: ["--force-device-scale-factor=2", `--window-size=${VIEWPORT.width},${VIEWPORT.height}`] });
  const warm = await browser.newPage();
  for (const path of tomas.warm ?? ["/lobby"]) await warm.goto(base + path, { waitUntil: "networkidle" });
  await warm.close();
  const result = {};
  for (const toma of tomas.tomas.filter((t) => !only || only.includes(t.id))) {
    result[toma.id] = await record(browser, toma);
    console.log(`${toma.id}: ${result[toma.id].duration}s, ${result[toma.id].taps.length} toques`);
  }
  await browser.close();
  const previous = existsSync(jsonPath) && only ? JSON.parse(readFileSync(jsonPath, "utf8")) : {};
  const merged = { ...previous, ...result };
  writeFileSync(jsonPath, JSON.stringify(merged, null, 2));
  syncComposition(merged);
} finally {
  stop();
  rmSync(rawDir, { recursive: true, force: true });
}
