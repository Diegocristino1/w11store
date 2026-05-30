import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");

const MAX_SIDE = 1200;
const JPEG_QUALITY = 82;
const SKIP_IF_BYTES = 400 * 1024;
const SKIP_IF_MAX_SIDE = 1200;
const IMAGE_RE = /\.(jpe?g|png)$/i;
const SKIP_NAMES = new Set([".gitkeep", "_info.txt", "desktop.ini", "thumbs.db"]);

function walkImages(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkImages(full, files);
    else if (IMAGE_RE.test(entry.name) && !SKIP_NAMES.has(entry.name.toLowerCase())) files.push(full);
  }
  return files;
}

async function compressOne(filePath) {
  const before = fs.statSync(filePath).size;
  const meta = await sharp(filePath).metadata();
  const maxDim = Math.max(meta.width || 0, meta.height || 0);

  if (before <= SKIP_IF_BYTES && maxDim <= SKIP_IF_MAX_SIDE) {
    return { filePath, before, after: before, skipped: true };
  }

  const ext = path.extname(filePath).toLowerCase();
  let pipeline = sharp(filePath).rotate();

  if (maxDim > MAX_SIDE) {
    pipeline = pipeline.resize(MAX_SIDE, MAX_SIDE, { fit: "inside", withoutEnlargement: true });
  }

  const tmp = `${filePath}.compressing`;
  if (ext === ".png") {
    await pipeline.png({ compressionLevel: 8, adaptiveFiltering: true }).toFile(tmp);
  } else {
    await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toFile(tmp);
  }

  const after = fs.statSync(tmp).size;
  if (after >= before) {
    fs.unlinkSync(tmp);
    return { filePath, before, after: before, skipped: true, reason: "no_gain" };
  }

  fs.renameSync(tmp, filePath);
  return { filePath, before, after, skipped: false };
}

async function main() {
  const targets = [
    path.join(publicDir, "categories"),
    path.join(publicDir, "teams"),
  ];

  const files = targets.flatMap((dir) => walkImages(dir));
  console.log(`Comprimindo ${files.length} imagens (max ${MAX_SIDE}px, JPEG q${JPEG_QUALITY})...\n`);

  let saved = 0;
  let processed = 0;
  let skipped = 0;
  let beforeTotal = 0;
  let afterTotal = 0;

  for (let i = 0; i < files.length; i++) {
    const result = await compressOne(files[i]);
    beforeTotal += result.before;
    afterTotal += result.after;
    if (result.skipped) skipped++;
    else {
      processed++;
      saved += result.before - result.after;
    }

    if ((i + 1) % 100 === 0 || i === files.length - 1) {
      const pct = (((i + 1) / files.length) * 100).toFixed(1);
      console.log(
        `[${pct}%] ${i + 1}/${files.length} — comprimidas: ${processed}, puladas: ${skipped}, economizado: ${(saved / 1024 / 1024).toFixed(1)} MB`
      );
    }
  }

  console.log("\n=== Resultado ===");
  console.log(`Antes:  ${(beforeTotal / 1024 / 1024 / 1024).toFixed(2)} GB`);
  console.log(`Depois: ${(afterTotal / 1024 / 1024 / 1024).toFixed(2)} GB`);
  console.log(`Economia: ${(saved / 1024 / 1024 / 1024).toFixed(2)} GB (${((saved / beforeTotal) * 100).toFixed(1)}%)`);
  console.log(`Comprimidas: ${processed} | Já ok: ${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
