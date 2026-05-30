/**
 * Sobe public/ (fotos) para Cloudflare Pages.
 * Requer: npx wrangler login (uma vez)
 * URL final: https://w11store-assets.pages.dev
 */
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const projectName = process.env.CF_PAGES_PROJECT || "w11store-assets";

if (!fs.existsSync(publicDir)) {
  console.error("Pasta public/ não encontrada.");
  process.exit(1);
}

console.log(`Deploy das imagens → Cloudflare Pages (${projectName})...`);
console.log("Isso pode demorar (muitas fotos). Mantenha o terminal aberto.\n");

const result = spawnSync(
  "npx",
  ["wrangler", "pages", "deploy", "public", "--project-name", projectName, "--branch", "main"],
  { cwd: root, stdio: "inherit", shell: true }
);

if (result.status !== 0) {
  console.error("\nFalha no deploy. Rode antes: npx wrangler login");
  process.exit(result.status ?? 1);
}

console.log(`\n✅ Imagens publicadas em: https://${projectName}.pages.dev`);
console.log("Configure na Vercel a variável:");
console.log(`  VITE_ASSET_BASE_URL=https://${projectName}.pages.dev`);
