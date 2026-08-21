/**
 * Regenerate the PWA icon set and social image from the app's own artwork.
 *
 * Run with: npm run icons
 *
 * The icons are drawn with the same canvas code the app uses for its in-app
 * icon preview, so the brand stays in one place. The maskable variant is drawn
 * inset so the logo survives Android's circular crop: the maskable spec keeps
 * only a centred circle of 80% diameter, so the mark sits inside a 60% box.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const OUT = new URL("../public/", import.meta.url);

const DRAW = `(size, inset) => {
  const cv = document.createElement("canvas");
  cv.width = size; cv.height = size;
  const x = cv.getContext("2d");

  // Background fills the whole tile; the mark is inset for maskable icons.
  const bg = (r) => { x.beginPath(); rr(x, 0, 0, size, size, r); x.clip(); };
  function rr(c,X,Y,W,H,r){c.moveTo(X+r,Y);c.arcTo(X+W,Y,X+W,Y+H,r);c.arcTo(X+W,Y+H,X,Y+H,r);c.arcTo(X,Y+H,X,Y,r);c.arcTo(X,Y,X+W,Y,r);c.closePath();}

  bg(inset ? 0 : size * 0.225);
  const g = x.createLinearGradient(0, 0, size, size);
  g.addColorStop(0, "#f3d089"); g.addColorStop(0.55, "#e8b563"); g.addColorStop(1, "#c98f3a");
  x.fillStyle = g; x.fillRect(0, 0, size, size);
  const rg = x.createRadialGradient(size*0.3, size*0.28, 0, size*0.3, size*0.28, size*0.8);
  rg.addColorStop(0, "rgba(255,255,255,.4)"); rg.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = rg; x.fillRect(0, 0, size, size);

  // Mark, scaled into the safe zone when maskable.
  const s = inset ? size * 0.6 : size;
  const o = inset ? (size - s) / 2 : 0;
  const P = (fx, fy) => [o + s * fx, o + s * fy];
  x.fillStyle = "#1a1206"; x.beginPath();
  x.moveTo(...P(0.50, 0.24)); x.lineTo(...P(0.78, 0.76)); x.lineTo(...P(0.60, 0.76));
  x.lineTo(...P(0.50, 0.55)); x.lineTo(...P(0.40, 0.76)); x.lineTo(...P(0.22, 0.76));
  x.closePath(); x.fill();
  x.fillStyle = "#fff"; x.beginPath();
  x.moveTo(...P(0.50, 0.24)); x.lineTo(...P(0.585, 0.40)); x.lineTo(...P(0.50, 0.36));
  x.lineTo(...P(0.415, 0.40)); x.closePath(); x.fill();

  return cv.toDataURL("image/png").split(",")[1];
}`;

const OG = `(w, h) => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const x = cv.getContext("2d");
  const g = x.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#3a2a12"); g.addColorStop(0.5, "#241a2e"); g.addColorStop(1, "#101526");
  x.fillStyle = g; x.fillRect(0, 0, w, h);
  const rg = x.createRadialGradient(w*0.22, h*0.3, 0, w*0.22, h*0.3, w*0.7);
  rg.addColorStop(0, "rgba(232,181,99,.20)"); rg.addColorStop(1, "rgba(232,181,99,0)");
  x.fillStyle = rg; x.fillRect(0, 0, w, h);

  x.fillStyle = "#f3d089";
  x.font = "800 92px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  x.fillText("APEX", 96, h * 0.44);
  x.fillStyle = "rgba(255,255,255,.88)";
  x.font = "500 40px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  x.fillText("train your mind & body", 96, h * 0.44 + 68);
  x.fillStyle = "rgba(255,255,255,.55)";
  x.font = "500 28px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  x.fillText("ideas · quizzes · knowledge maps · workouts", 96, h * 0.44 + 124);
  return cv.toDataURL("image/png").split(",")[1];
}`;

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setContent("<!doctype html><body>");

const png = async (b64, name, opts = {}) => {
  const buf = await sharp(Buffer.from(b64, "base64"))
    .png({ compressionLevel: 9, palette: true, quality: 90, ...opts })
    .toBuffer();
  await writeFile(new URL(name, OUT), buf);
  return buf.length;
};

const sizes = [
  ["icon-192.png", 192, false],
  ["icon-512.png", 512, false],
  ["icon-maskable-512.png", 512, true],
  ["apple-touch-icon.png", 180, false],
];

for (const [name, size, inset] of sizes) {
  const b64 = await page.evaluate(`(${DRAW})(${size}, ${inset})`);
  const bytes = await png(b64, name);
  console.log(`${name.padEnd(24)} ${size}x${size}${inset ? " maskable" : ""}  ${(bytes / 1024).toFixed(1)} KB`);
}

const ogB64 = await page.evaluate(`(${OG})(1200, 630)`);
const ogBytes = await png(ogB64, "og-image.png", { palette: true, colours: 128 });
console.log(`${"og-image.png".padEnd(24)} 1200x630  ${(ogBytes / 1024).toFixed(1)} KB`);

await browser.close();
