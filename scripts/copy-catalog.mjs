import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "catalog");

export function copyCatalogToPublic() {
  const files = [
    ["src/generated/image-manifest.json", "image-manifest.json"],
    ["src/generated/teams-catalog.json", "teams-catalog.json"],
  ];

  fs.mkdirSync(outDir, { recursive: true });

  for (const [src, name] of files) {
    const from = path.join(root, src);
    if (!fs.existsSync(from)) {
      console.error(`Arquivo não encontrado: ${src}`);
      process.exit(1);
    }
    fs.copyFileSync(from, path.join(outDir, name));
  }

  console.log("Catálogo copiado → public/catalog/");
}

const isMain = process.argv[1]?.includes("copy-catalog");
if (isMain) copyCatalogToPublic();
