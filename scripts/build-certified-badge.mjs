import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "brand");
const input = path.join(root, "fgp-certified-installer.png");
const output = path.join(root, "fgp-certified-badge.png");

const { width: w, height: h } = await sharp(input).metadata();
const size = Math.min(w, h);
const left = Math.floor((w - size) / 2);
const top = Math.floor((h - size) / 2);
const mask = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`
);

await sharp(input)
  .extract({ left, top, width: size, height: size })
  .ensureAlpha()
  .composite([{ input: mask, blend: "dest-in" }])
  .png()
  .toFile(output);

console.log("certified badge ready", size);
