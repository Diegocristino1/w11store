import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const primary = path.join(root, "winning-eleven-store.jsx");
const mirror = path.join(root, "src", "App.jsx");

function syncFiles() {
  const hasPrimary = fs.existsSync(primary);
  const hasMirror = fs.existsSync(mirror);

  if (!hasPrimary && !hasMirror) {
    console.error("Nenhum arquivo da loja encontrado.");
    process.exit(1);
  }

  if (!hasPrimary) {
    fs.copyFileSync(mirror, primary);
    console.log("Criado winning-eleven-store.jsx a partir de src/App.jsx");
    return;
  }

  if (!hasMirror) {
    fs.mkdirSync(path.dirname(mirror), { recursive: true });
    fs.copyFileSync(primary, mirror);
    console.log("Criado src/App.jsx a partir de winning-eleven-store.jsx");
    return;
  }

  const primaryMtime = fs.statSync(primary).mtimeMs;
  const mirrorMtime = fs.statSync(mirror).mtimeMs;

  if (primaryMtime === mirrorMtime) return;

  if (primaryMtime > mirrorMtime) {
    fs.copyFileSync(primary, mirror);
    console.log("Sincronizado: winning-eleven-store.jsx → src/App.jsx");
  } else {
    fs.copyFileSync(mirror, primary);
    console.log("Sincronizado: src/App.jsx → winning-eleven-store.jsx");
  }
}

syncFiles();
