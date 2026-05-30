import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { generateImageManifest } from "./generate-image-manifest.mjs";
import { writeTeamsCatalog } from "./generate-teams-catalog.mjs";
import { cleanupEmptyFolders } from "./cleanup-empty-folders.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const primary = path.join(root, "winning-eleven-store.jsx");
const mirror = path.join(root, "src", "App.jsx");
const watchDirs = [
  path.join(root, "public", "categories"),
  path.join(root, "public", "teams"),
];

let syncing = false;
let debounce = null;
let manifestDebounce = null;

function syncFiles() {
  if (syncing) return;
  syncing = true;
  try {
    const hasPrimary = fs.existsSync(primary);
    const hasMirror = fs.existsSync(mirror);

    if (!hasPrimary && hasMirror) {
      fs.copyFileSync(mirror, primary);
      return;
    }
    if (hasPrimary && !hasMirror) {
      fs.mkdirSync(path.dirname(mirror), { recursive: true });
      fs.copyFileSync(primary, mirror);
      return;
    }
    if (!hasPrimary || !hasMirror) return;

    const primaryMtime = fs.statSync(primary).mtimeMs;
    const mirrorMtime = fs.statSync(mirror).mtimeMs;
    if (primaryMtime === mirrorMtime) return;

    if (primaryMtime > mirrorMtime) {
      fs.copyFileSync(primary, mirror);
    } else {
      fs.copyFileSync(mirror, primary);
    }
  } finally {
    syncing = false;
  }
}

function scheduleSync() {
  clearTimeout(debounce);
  debounce = setTimeout(syncFiles, 200);
}

function scheduleManifest() {
  clearTimeout(manifestDebounce);
  manifestDebounce = setTimeout(() => {
    try {
      cleanupEmptyFolders({ quiet: true });
      const manifest = generateImageManifest();
      writeTeamsCatalog(manifest);
    } catch (err) {
      console.error("Erro ao atualizar manifest de imagens:", err.message);
    }
  }, 300);
}

function watchDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.watch(dir, { recursive: true }, scheduleManifest);
}

syncFiles();
cleanupEmptyFolders({ quiet: true });
const initialManifest = generateImageManifest();
writeTeamsCatalog(initialManifest);

fs.mkdirSync(path.dirname(mirror), { recursive: true });
if (!fs.existsSync(mirror) && fs.existsSync(primary)) {
  fs.copyFileSync(primary, mirror);
}

fs.watch(primary, scheduleSync);
fs.watch(mirror, scheduleSync);
watchDirs.forEach(watchDir);

const vite = spawn(
  process.platform === "win32" ? "npm.cmd" : "npm",
  ["exec", "vite"],
  { cwd: root, stdio: "inherit", shell: true }
);

vite.on("exit", (code) => process.exit(code ?? 0));

process.on("SIGINT", () => {
  vite.kill("SIGINT");
  process.exit(0);
});

console.log("Assistindo código, categorias e times (fotos aparecem ao salvar na pasta)");
