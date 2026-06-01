import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { writeImageManifest } from "./generate-image-manifest.mjs";
import { writeTeamsCatalog } from "./generate-teams-catalog.mjs";
import { copyCatalogToPublic } from "./copy-catalog.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const IMAGE_RE = /\.(jpe?g|png|webp|gif|avif)$/i;

function removeImagesInDir(dir) {
  if (!fs.existsSync(dir)) return 0;
  let removed = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) removed += removeImagesInDir(full);
    else if (IMAGE_RE.test(entry.name)) {
      fs.unlinkSync(full);
      removed++;
    }
  }
  return removed;
}

const emptyGalleryStore = {
  version: 1,
  updatedAt: new Date().toISOString(),
  images: {},
  groups: { categories: {}, teams: {}, flatTeams: {} },
};

const targets = [
  path.join(publicDir, "categories"),
  path.join(publicDir, "teams"),
];

let removed = 0;
for (const dir of targets) removed += removeImagesInDir(dir);

const galleryStorePath = path.join(publicDir, "catalog", "gallery-store.json");
fs.mkdirSync(path.dirname(galleryStorePath), { recursive: true });
fs.writeFileSync(galleryStorePath, JSON.stringify(emptyGalleryStore, null, 2));

const manifest = await writeImageManifest({
  generatedAt: new Date().toISOString(),
  categories: {},
  teams: {},
  flatTeams: {},
  groups: { categories: {}, teams: {}, flatTeams: {} },
});

writeTeamsCatalog(manifest);
copyCatalogToPublic();

console.log(`Removidas ${removed} imagens de public/categories e public/teams`);
console.log("Catálogo zerado → src/generated/ e public/catalog/");
