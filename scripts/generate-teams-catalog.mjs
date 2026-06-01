import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generateImageManifest } from "./generate-image-manifest.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outFile = path.join(root, "src", "generated", "teams-catalog.json");

const TAG_LEAGUE = {
  ALE: { id: "bund", label: "Bundesliga", icon: "🇩🇪", color: "#d30006" },
  ESP: { id: "laliga", label: "LaLiga", icon: "🇪🇸", color: "#ef3340" },
  FRA: { id: "l1", label: "Ligue 1", icon: "🇫🇷", color: "#001e62" },
  ING: { id: "epl", label: "Premier League", icon: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "#3d195b" },
  ITA: { id: "serie", label: "Serie A", icon: "🇮🇹", color: "#1a73c8" },
  SEL: { id: "sel", label: "Seleções", icon: "🌍", color: "#f5c200" },
  BRA: { id: "br", label: "Brasileirão", icon: "🇧🇷", color: "#009c3b" },
  MUN: { id: "outros", label: "Outros", icon: "🌎", color: "#7c3aed" },
  EUA: { id: "eua", label: "EUA / NBA", icon: "🇺🇸", color: "#002868" },
};

const STANDARD_LEAGUES = {
  br: { label: "Brasileirão", icon: "🇧🇷", color: "#009c3b" },
  serie: { label: "Serie A", icon: "🇮🇹", color: "#1a73c8" },
  epl: { label: "Premier League", icon: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "#3d195b" },
  bund: { label: "Bundesliga", icon: "🇩🇪", color: "#d30006" },
  l1: { label: "Ligue 1", icon: "🇫🇷", color: "#001e62" },
  laliga: { label: "LaLiga", icon: "🇪🇸", color: "#ef3340" },
  sel: { label: "Seleções", icon: "🌍", color: "#f5c200" },
  outros: { label: "Outros", icon: "🌎", color: "#7c3aed" },
  eua: { label: "EUA / NBA", icon: "🇺🇸", color: "#002868" },
};

const SLUG_NAMES = {
  flamengo: "Flamengo", palmeiras: "Palmeiras", corinthians: "Corinthians", saopaulo: "São Paulo",
  santos: "Santos", gremio: "Grêmio", inter: "Internacional", atletico: "Atlético Mineiro",
  fluminense: "Fluminense", botafogo: "Botafogo", cruzeiro: "Cruzeiro", vasco: "Vasco da Gama",
  bahia: "Bahia", fortaleza: "Fortaleza", sport: "Sport Recife", atleticago: "Atlético Goianiense",
  rbragantino: "Red Bull Bragantino", cearasc: "Ceará SC", mancity: "Manchester City",
  manutd: "Manchester United", arsenal: "Arsenal", liverpool: "Liverpool", chelsea: "Chelsea",
  tottenham: "Tottenham", newcastle: "Newcastle", juventus: "Juventus", acmilan: "AC Milan",
  bocajuniors: "Boca Juniors", ajax: "Ajax", benfica: "Benfica", porto: "FC Porto",
};

function colorFromName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 55%, 38%)`;
}

function makeAbbr(name) {
  const clean = name.replace(/^\[[^\]]+\]\s*/, "").trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0] + (words[2]?.[0] || words[1][1] || "")).toUpperCase().slice(0, 3);
  return clean.slice(0, 3).toUpperCase();
}

function formatSlugName(slug) {
  if (SLUG_NAMES[slug]) return SLUG_NAMES[slug];
  return slug.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function parseFlatFolder(folderName) {
  const m = folderName.match(/^\[([A-Z]{3})\]\s*(.+)$/);
  if (!m) return { leagueId: "outros", name: folderName };
  const meta = TAG_LEAGUE[m[1]] || STANDARD_LEAGUES.outros;
  return { leagueId: meta.id, name: m[2].trim() };
}

function isNbaTeam(name) {
  return /^(Atlanta|Boston|Brooklyn|Charlotte|Chicago|Cleveland|Dallas|Denver|Detroit|Golden State|Houston|Indiana|LA Clippers|LA Lakers|Los Angeles|Memphis|Miami|Milwaukee|Minnesota|New Orleans|New York|Oklahoma City|Orlando|Philadelphia|Phoenix|Portland|Sacramento|San Antonio|Toronto|Utah|Washington)\b/.test(name);
}

export function generateTeamsCatalog(manifest) {
  const leagueMap = new Map();

  const ensureLeague = (id) => {
    if (!leagueMap.has(id)) {
      const meta = STANDARD_LEAGUES[id] || { label: id, icon: "⚽", color: "#444444" };
      leagueMap.set(id, { id, ...meta, teams: [] });
    }
    return leagueMap.get(id);
  };

  for (const [leaguePath, teams] of Object.entries(manifest.teams || {})) {
    if (STANDARD_LEAGUES[leaguePath]) {
      const league = ensureLeague(leaguePath);
      for (const [teamId, images] of Object.entries(teams)) {
        if (!images?.length) continue;
        const name = formatSlugName(teamId);
        league.teams.push({
          id: teamId,
          name,
          abbr: makeAbbr(name),
          color: colorFromName(name),
          flat: false,
          leaguePath,
          teamPath: teamId,
          photoCount: images.length,
        });
      }
    }
  }

  for (const [folderName, images] of Object.entries(manifest.flatTeams || {})) {
    if (!images?.length) continue;
    let { leagueId, name } = parseFlatFolder(folderName);
    if (leagueId === "outros" && isNbaTeam(name)) leagueId = "eua";
    const league = ensureLeague(leagueId);
    league.teams.push({
      id: folderName,
      name,
      abbr: makeAbbr(name),
      color: colorFromName(name),
      flat: true,
      leaguePath: folderName,
      teamPath: null,
      photoCount: images.length,
    });
  }

  const leagues = [...leagueMap.values()]
    .map((lg) => ({
      ...lg,
      teams: lg.teams.sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" })),
    }))
    .filter((lg) => lg.teams.length > 0)
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" }));

  return { generatedAt: new Date().toISOString(), leagues };
}

export function writeTeamsCatalog(manifest) {
  if (!manifest || typeof manifest.then === "function") {
    throw new Error("writeTeamsCatalog requer manifest gerado (use await generateImageManifest()).");
  }
  const catalog = generateTeamsCatalog(manifest);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(catalog, null, 2));
  const teamCount = catalog.leagues.reduce((s, lg) => s + lg.teams.length, 0);
  console.log(`Catálogo: ${teamCount} times em ${catalog.leagues.length} ligas → src/generated/teams-catalog.json`);
  return catalog;
}

const isMain = process.argv[1]?.includes("generate-teams-catalog");
if (isMain) {
  const manifest = await generateImageManifest();
  writeTeamsCatalog(manifest);
}
