import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "public");
const markPath = path.join(root, "brand", "fgp-mark-red.png");

async function knockBlackTransparent(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] < 36 && data[i + 1] < 36 && data[i + 2] < 36) data[i + 3] = 0;
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } });
}

async function tile(size, radiusRatio = 0.22) {
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
  return sharp(svgBg)
    .composite([{ input: markBuf, left: pad, top: pad }])
    .png()
    .toBuffer();
}

function pngToIco(pngBuffers) {
  // Minimal ICO writer for square PNGs (16/32/48)
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const entries = [];
  let offset = 6 + count * 16;
  for (const png of pngBuffers) {
    const meta = Buffer.alloc(16);
    // size inferred later via sharp; write 0 for 256, else actual
    meta[0] = 0; // width placeholder
    meta[1] = 0; // height placeholder
    meta[2] = 0;
    meta[3] = 0;
    meta.writeUInt16LE(1, 4);
    meta.writeUInt16LE(32, 6);
    meta.writeUInt32LE(png.length, 8);
    meta.writeUInt32LE(offset, 12);
    entries.push({ meta, png });
    offset += png.length;
  }

  // fill sizes using sharp metadata synchronously not available; parse IHDR
  entries.forEach(({ meta, png }) => {
    const w = png.readUInt32BE(16);
    const h = png.readUInt32BE(20);
    meta[0] = w >= 256 ? 0 : w;
    meta[1] = h >= 256 ? 0 : h;
  });

  return Buffer.concat([header, ...entries.map((e) => e.meta), ...entries.map((e) => e.png)]);
}

const png16 = await tile(16, 0.2);
const png32 = await tile(32);
const png48 = await tile(48);
const png180 = await tile(180, 0.2);

fs.writeFileSync(path.join(root, "favicon-16.png"), png16);
fs.writeFileSync(path.join(root, "favicon-32.png"), png32);
fs.writeFileSync(path.join(root, "favicon-48.png"), png48);
fs.writeFileSync(path.join(root, "favicon.png"), png32);
fs.writeFileSync(path.join(root, "apple-touch-icon.png"), png180);
fs.writeFileSync(path.join(root, "favicon.ico"), pngToIco([png16, png32, png48]));

const mark512 = await (await knockBlackTransparent(markPath))
  .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();
const b64 = mark512.toString("base64");
fs.writeFileSync(
  path.join(root, "favicon.svg"),
  `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Floorguard Products">
  <rect width="64" height="64" rx="14" fill="#0e1c3a"/>
  <image href="data:image/png;base64,${b64}" x="10" y="10" width="44" height="44" preserveAspectRatio="xMidYMid meet"/>
</svg>
`
);

console.log("site favicon pack ready (ico/png/svg)");
