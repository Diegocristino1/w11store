import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generateImageManifest, writeImageManifest } from "./generate-image-manifest.mjs";
import { writeTeamsCatalog } from "./generate-teams-catalog.mjs";
import { copyCatalogToPublic } from "./copy-catalog.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestFile = path.join(root, "src", "generated", "image-manifest.json");
const catalogFile = path.join(root, "src", "generated", "teams-catalog.json");

function countManifestImages(manifest) {
  const catCount = Object.values(manifest.categories || {}).reduce((s, a) => s + a.length, 0);
  const nestedCount = Object.values(manifest.teams || {}).reduce(
    (s, league) => s + Object.values(league).reduce((t, a) => t + a.length, 0),
    0
  );
  const flatCount = Object.values(manifest.flatTeams || {}).reduce((s, a) => s + a.length, 0);
  return catCount + nestedCount + flatCount;
}

function hasCommittedCatalog() {
  return fs.existsSync(catalogFile) && fs.existsSync(manifestFile);
}

const manifest = generateImageManifest();
const total = countManifestImages(manifest);

if (total === 0) {
  if (!hasCommittedCatalog()) {
    console.error("Nenhuma foto em public/ e nenhum catálogo commitado em src/generated/.");
    process.exit(1);
  }
  console.log(
    "public/ sem fotos no servidor — mantendo src/generated/*.json já commitados."
  );
} else {
  writeImageManifest(manifest);

  const catCount = Object.values(manifest.categories).reduce((s, a) => s + a.length, 0);
  const nestedCount = Object.values(manifest.teams).reduce(
    (s, league) => s + Object.values(league).reduce((t, a) => t + a.length, 0),
    0
  );
  const flatCount = Object.values(manifest.flatTeams).reduce((s, a) => s + a.length, 0);
  console.log(
    `Manifest: ${catCount} fotos em categorias, ${nestedCount + flatCount} fotos em times (${Object.keys(manifest.flatTeams).length} pastas planas) → src/generated/image-manifest.json`
  );

  writeTeamsCatalog(manifest);
}

copyCatalogToPublic();
