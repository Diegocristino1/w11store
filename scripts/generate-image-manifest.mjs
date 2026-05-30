import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const outFile = path.join(root, "src", "generated", "image-manifest.json");

const IMAGE_RE = /\.(jpe?g|png|webp|gif|avif)$/i;
const SKIP_FILES = new Set([".gitkeep", "_info.txt", "desktop.ini", "thumbs.db"]);

function listImages(dir, urlPrefix) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && IMAGE_RE.test(e.name) && !SKIP_FILES.has(e.name.toLowerCase()))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }))
    .map((name) => {
      const prefix = urlPrefix.split("/").map((seg) => encodeURIComponent(seg)).join("/");
      return `${prefix}/${encodeURIComponent(name)}`;
    });
}

export function generateImageManifest() {
  const manifest = {
    generatedAt: new Date().toISOString(),
    categories: {},
    teams: {},
    flatTeams: {},
  };

  const categoriesDir = path.join(publicDir, "categories");
  if (fs.existsSync(categoriesDir)) {
    for (const entry of fs.readdirSync(categoriesDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const folder = entry.name;
      manifest.categories[folder] = listImages(
        path.join(categoriesDir, folder),
        `/categories/${folder}`
      );
    }
  }

  const teamsDir = path.join(publicDir, "teams");
  if (fs.existsSync(teamsDir)) {
    for (const entry of fs.readdirSync(teamsDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const folder = entry.name;
      const folderPath = path.join(teamsDir, folder);
      const subdirs = fs.readdirSync(folderPath, { withFileTypes: true }).filter((e) => e.isDirectory());
      const directImages = listImages(folderPath, `/teams/${folder}`);

      if (subdirs.length > 0) {
        manifest.teams[folder] = {};
        for (const team of subdirs) {
          const imgs = listImages(
            path.join(folderPath, team.name),
            `/teams/${folder}/${team.name}`
          );
          if (imgs.length > 0) manifest.teams[folder][team.name] = imgs;
        }
      }

      if (directImages.length > 0) {
        manifest.flatTeams[folder] = directImages;
      }
    }
  }

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(manifest, null, 2));
  return manifest;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const m = generateImageManifest();
  const catCount = Object.values(m.categories).reduce((s, a) => s + a.length, 0);
  const nestedCount = Object.values(m.teams).reduce(
    (s, league) => s + Object.values(league).reduce((t, a) => t + a.length, 0),
    0
  );
  const flatCount = Object.values(m.flatTeams).reduce((s, a) => s + a.length, 0);
  console.log(
    `Manifest: ${catCount} fotos em categorias, ${nestedCount + flatCount} fotos em times (${Object.keys(m.flatTeams).length} pastas planas) → src/generated/image-manifest.json`
  );
}
