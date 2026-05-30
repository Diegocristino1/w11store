import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const storeFile = path.join(root, "winning-eleven-store.jsx");
const teamsRoot = path.join(root, "public", "teams");

const content = fs.readFileSync(storeFile, "utf8");
const teamsBlock = content.match(/const TEAMS = \{([\s\S]*?)\n\};/);
if (!teamsBlock) {
  console.error("Não foi possível ler TEAMS em winning-eleven-store.jsx");
  process.exit(1);
}

const leagueRegex = /(\w+):\[([\s\S]*?)\n  \],/g;
let created = 0;
let leagues = 0;

for (const match of teamsBlock[1].matchAll(leagueRegex)) {
  const leagueId = match[1];
  const teamsSection = match[2];
  leagues++;

  for (const teamMatch of teamsSection.matchAll(/\{id:"([^"]+)",\s*name:"([^"]+)"/g)) {
    const teamId = teamMatch[1];
    const teamName = teamMatch[2];
    const dir = path.join(teamsRoot, leagueId, teamId);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, ".gitkeep"), "");
    fs.writeFileSync(
      path.join(dir, "_info.txt"),
      `${teamName}\nLiga: ${leagueId}\nID: ${teamId}\n\nColoque as fotos deste time nesta pasta.\nEx.: foto1.jpg, titular.jpg\nURL no site: /teams/${leagueId}/${teamId}/foto1.jpg\n`
    );
    created++;
  }
}

console.log(`Pastas criadas: ${created} times em ${leagues} ligas → public/teams/`);
