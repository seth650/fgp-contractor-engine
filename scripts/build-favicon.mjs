import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "public");
const markPath = path.join(root, "brand", "fgp-mark-red.png");

async function knockBlackTransparent(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Knock out black plate from brand PNG
    if (r < 36 && g < 36 && b < 36) data[i + 3] = 0;
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } });
}

async function makeIcon(size, out, radiusRatio = 0.22) {
  const pad = Math.round(size * 0.16);
  const inner = size - pad * 2;
  const markBuf = await (await knockBlackTransparent(markPath))
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const radius = Math.round(size * radiusRatio);
  const svgBg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="#0e1c3a"/></svg>`
  );
  await sharp(svgBg)
    .composite([{ input: markBuf, left: pad, top: pad }])
    .png()
    .toFile(out);
  console.log("wrote", path.basename(out));
}

const transparentMark = await (await knockBlackTransparent(markPath))
  .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();
const b64 = transparentMark.toString("base64");

fs.writeFileSync(
  path.join(root, "favicon.svg"),
  `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Floorguard Products">
  <rect width="64" height="64" rx="14" fill="#0e1c3a"/>
  <image href="data:image/png;base64,${b64}" x="10" y="10" width="44" height="44" preserveAspectRatio="xMidYMid meet"/>
</svg>
`
);
console.log("wrote favicon.svg");

await makeIcon(32, path.join(root, "favicon.png"));
await makeIcon(32, path.join(root, "favicon-32.png"));
await makeIcon(48, path.join(root, "favicon-48.png"));
await makeIcon(180, path.join(root, "apple-touch-icon.png"), 0.2);

// cleanup draft
const draft = path.join(root, "favicon-source.jpg");
if (fs.existsSync(draft)) fs.unlinkSync(draft);

console.log("favicon set ready");
