import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const IMAGE_RE = /\.(jpe?g|png|webp|gif|avif)$/i;
const SKIP_FILES = new Set([".gitkeep", "_info.txt", "desktop.ini", "thumbs.db"]);

const KEEP_ROOTS = new Set([
  path.join(publicDir, "teams"),
  path.join(publicDir, "categories"),
]);

function hasImages(dir) {
  if (!fs.existsSync(dir)) return false;
  return fs.readdirSync(dir, { withFileTypes: true }).some(
    (e) => e.isFile() && IMAGE_RE.test(e.name) && !SKIP_FILES.has(e.name.toLowerCase())
  );
}

function cleanTree(dirPath, removedList) {
  if (!fs.existsSync(dirPath)) return;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      cleanTree(path.join(dirPath, entry.name), removedList);
    }
  }

  if (KEEP_ROOTS.has(dirPath) || dirPath === publicDir) return;

  const after = fs.existsSync(dirPath)
    ? fs.readdirSync(dirPath, { withFileTypes: true })
    : [];
  const subdirs = after.filter((e) => e.isDirectory());

  if (!hasImages(dirPath) && subdirs.length === 0) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    removedList.push(path.relative(root, dirPath));
  }
}

export function cleanupEmptyFolders({ quiet = false } = {}) {
  const removed = [];
  for (const base of ["categories", "teams"]) {
    const basePath = path.join(publicDir, base);
    if (fs.existsSync(basePath)) cleanTree(basePath, removed);
  }

  if (!quiet) {
    if (removed.length === 0) {
      console.log("Nenhuma pasta vazia encontrada — todas já têm imagens ou foram removidas antes.");
    } else {
      console.log(`Removidas ${removed.length} pasta(s) sem imagens:`);
      removed.forEach((p) => console.log(`  - ${p}`));
    }
  }

  return removed;
}

const isMain = process.argv[1]?.includes("cleanup-empty-folders");
if (isMain) cleanupEmptyFolders();
