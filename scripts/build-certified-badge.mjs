import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "brand");
const input = path.join(root, "fgp-certified-installer.png");
const output = path.join(root, "fgp-certified-badge.png");

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;

function px(x, y) {
  const i = (y * w + x) * 4;
  return [data[i], data[i + 1], data[i + 2], data[i + 3]];
}

function luma(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Anchor on orange INSTALLER banner
let sx = 0;
let sy = 0;
let n = 0;
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const [r, g, b] = px(x, y);
    if (r > 150 && g > 60 && g < 140 && b < 80 && r > g + 40) {
      sx += x;
      sy += y;
      n++;
    }
  }
}
if (!n) throw new Error("Could not find INSTALLER banner");

const cx = Math.round(sx / n);
const cy = Math.round(sy / n - 42);

const radii = [];
for (let a = 0; a < 720; a++) {
  const rad = (a * Math.PI * 2) / 720;
  let lastBright = 0;
  let seen = false;
  let navyRun = 0;
  for (let r = 30; r < 400; r++) {
    const x = Math.round(cx + Math.cos(rad) * r);
    const y = Math.round(cy + Math.sin(rad) * r);
    if (x < 1 || y < 1 || x >= w - 1 || y >= h - 1) break;
    const [cr, cg, cb] = px(x, y);
    const L = luma(cr, cg, cb);
    if (L > 150) {
      lastBright = r;
      seen = true;
      navyRun = 0;
    } else if (seen && cr < 45 && cg < 55 && cb < 90) {
      navyRun++;
      if (navyRun > 4) break;
    }
  }
  if (lastBright > 80 && lastBright < 280) radii.push(lastBright);
}

radii.sort((a, b) => a - b);
const ringR = Math.ceil(radii[Math.floor(radii.length * 0.78)] + 1);
const size = ringR * 2 + 2;
let left = Math.round(cx - size / 2);
let top = Math.round(cy - size / 2);
left = Math.max(0, Math.min(left, w - size));
top = Math.max(0, Math.min(top, h - size));

const out = 512;
const scale = out / size;
const cropped = await sharp(input)
  .extract({ left, top, width: size, height: size })
  .resize(out, out, { fit: "fill" })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const outData = cropped.data;
const outCx = (out - 1) / 2;
const outCy = (out - 1) / 2;
const keepR = (ringR + 0.5) * scale;

for (let y = 0; y < out; y++) {
  for (let x = 0; x < out; x++) {
    const i = (y * out + x) * 4;
    const dx = x - outCx;
    const dy = y - outCy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > keepR) {
      outData[i + 3] = 0;
      continue;
    }
    // Soften only the outer half-pixel of the chrome edge onto transparency
    if (dist > keepR - 1.25) {
      outData[i + 3] = Math.round(outData[i + 3] * Math.max(0, (keepR - dist) / 1.25));
    }
  }
}

await sharp(outData, { raw: { width: out, height: out, channels: 4 } }).png().toFile(output);

console.log("tight badge ready", {
  cx,
  cy,
  ringR,
  size,
  samples: radii.length,
  p50: radii[Math.floor(radii.length * 0.5)],
  p78: radii[Math.floor(radii.length * 0.78)],
});
