// Sharp PR media from headless Helium at 2x pixel density.
//   bun capture.ts shot   <url> <out.png> [--size 1000x1100] [--js "<expr>"]
//   bun capture.ts scroll <url> <out.mp4> [--size 1000x1100] [--js "<expr>"]
// --js runs after load, before capture, to put the page in the state to show.
import { spawn } from "bun";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const HELIUM = "/Applications/Helium.app/Contents/MacOS/Helium";
const [mode, url, out, ...rest] = process.argv.slice(2);
if (!["shot", "scroll"].includes(mode) || !url || !out) {
  console.error("usage: bun capture.ts shot|scroll <url> <out> [--size WxH] [--js expr]");
  process.exit(1);
}
const flag = (name: string) => {
  const i = rest.indexOf(name);
  return i === -1 ? undefined : rest[i + 1];
};
const [W, H] = (flag("--size") ?? "1000x1100").split("x").map(Number);
const port = 9300 + Math.floor(Math.random() * 600);
const dir = mkdtempSync(join(tmpdir(), "capture-"));
const browser = spawn(
  [HELIUM, "--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${dir}/profile`,
    "--hide-scrollbars", "--no-first-run", `--window-size=${W},${H}`, "about:blank"],
  { stdout: "ignore", stderr: "ignore" },
);

try {
  let ws!: WebSocket;
  for (let i = 0; !ws; i++) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      ws = new WebSocket(targets.find((t: any) => t.type === "page").webSocketDebuggerUrl);
    } catch {
      if (i > 50) throw new Error("Helium did not start");
      await Bun.sleep(200);
    }
  }
  await new Promise((r) => (ws.onopen = r));
  let nextId = 0;
  const pending = new Map<number, (m: any) => void>();
  let onEvent = (_m: any) => {};
  ws.onmessage = (e) => {
    const m = JSON.parse(String(e.data));
    if (pending.has(m.id)) pending.get(m.id)!(m), pending.delete(m.id);
    else onEvent(m);
  };
  const send = (method: string, params = {}) =>
    new Promise<any>((resolve, reject) => {
      const id = ++nextId;
      pending.set(id, (m) => (m.error ? reject(new Error(m.error.message)) : resolve(m.result)));
      ws.send(JSON.stringify({ id, method, params }));
    });
  const evaluate = async (expression: string) =>
    (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result.value;
  const shot = async (path: string) =>
    Bun.write(path, Buffer.from((await send("Page.captureScreenshot", { format: "png" })).data, "base64"));

  await send("Page.enable");
  // Real 2x pixels: a 1x display, or a hidden preview panel, gives soft captures.
  await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 2, mobile: false });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "dark" }] });
  const loaded = new Promise((r) => (onEvent = (m) => m.method === "Page.loadEventFired" && r(0)));
  await send("Page.navigate", { url });
  await loaded;
  await Bun.sleep(1500);
  const js = flag("--js");
  if (js) await evaluate(js), await Bun.sleep(500);

  if (mode === "shot") await shot(out);
  else {
    // One screenshot per frame, so the video is as sharp as a still and never drops frames.
    const fps = 30;
    let frame = 0;
    const hold = async (n: number) => {
      for (let i = 0; i < n; i++) await shot(join(dir, `${String(frame++).padStart(5, "0")}.png`));
    };
    const start = await evaluate("scrollY");
    const end = Math.min(await evaluate("document.documentElement.scrollHeight - innerHeight"), start + 3 * H);
    await hold(fps);
    const steps = fps * 6;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      await evaluate(`scrollTo(0, ${Math.round(start + eased * (end - start))})`);
      await hold(1);
    }
    await hold(fps);
    const ffmpeg = spawn(["ffmpeg", "-loglevel", "error", "-y", "-framerate", String(fps),
      "-i", join(dir, "%05d.png"), "-c:v", "libx264", "-preset", "slow", "-crf", "18",
      "-pix_fmt", "yuv420p", "-movflags", "+faststart", out]);
    if ((await ffmpeg.exited) !== 0) throw new Error("ffmpeg failed");
  }
  ws.close();
  console.log(out);
} finally {
  browser.kill();
  rmSync(dir, { recursive: true, force: true });
}
