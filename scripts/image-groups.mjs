import fs from "fs";
import path from "path";
import sharp from "sharp";

const IMAGE_RE = /\.(jpe?g|png|webp|gif|avif)$/i;
const SESSION_GAP_MS = 3_000;
const SMALL_SESSION_MAX = 12;
const SMALL_SESSION_MAX_ADJ = 42;
const LARGE_SESSION_CHAIN_THRESHOLD = 35;

function imageStem(name) {
  return name.replace(/\.[^.]+$/i, "");
}

function parseTimestampStem(stem) {
  if (/^\d{13}$/.test(stem)) return Number(stem);
  return null;
}

function numberedStemInfo(stem, allStems) {
  const match = stem.match(/^(.+)\((\d+)\)$/i);
  if (match) return { base: match[1].toLowerCase(), num: Number(match[2]) };
  const lower = stem.toLowerCase();
  const hasNumbered = allStems.some((s) => imageStem(s).toLowerCase().startsWith(`${lower}(`));
  if (hasNumbered) return { base: lower, num: 0 };
  return null;
}

function hamming(a, b) {
  let x = a ^ b;
  let n = 0;
  while (x) {
    n += Number(x & 1n);
    x >>= 1n;
  }
  return n;
}

async function computeDHash(filePath) {
  const size = 9;
  const { data, info } = await sharp(filePath)
    .rotate()
    .resize(size, size - 1, { fit: "fill" })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  let hash = 0n;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < w - 1; x++) {
      const bit = BigInt(y * (w - 1) + x);
      if (data[y * w + x] > data[y * w + x + 1]) hash |= 1n << bit;
    }
  }
  return hash;
}

function splitIntoSessions(fileNames) {
  const allStems = fileNames.map(imageStem);
  const sessions = [];
  let numberedBuckets = new Map();

  const flushNumbered = () => {
    for (const files of numberedBuckets.values()) {
      if (files.length) sessions.push({ kind: "numbered", files });
    }
    numberedBuckets = new Map();
  };

  let timestampRun = [];

  const flushTimestamp = () => {
    if (timestampRun.length) sessions.push({ kind: "timestamp", files: timestampRun });
    timestampRun = [];
  };

  for (const name of fileNames) {
    const stem = imageStem(name);
    const ts = parseTimestampStem(stem);
    const numbered = numberedStemInfo(stem, allStems);

    if (ts != null) {
      flushNumbered();
      const last = timestampRun[timestampRun.length - 1];
      if (last && ts - last.ts > SESSION_GAP_MS) flushTimestamp();
      timestampRun.push({ name, ts });
      continue;
    }

    flushTimestamp();

    if (numbered != null) {
      if (!numberedBuckets.has(numbered.base)) numberedBuckets.set(numbered.base, []);
      numberedBuckets.get(numbered.base).push(name);
    } else {
      flushNumbered();
      sessions.push({ kind: "single", files: [name] });
    }
  }

  flushTimestamp();
  flushNumbered();
  return sessions;
}

function sortNumberedFiles(files) {
  const allStems = files.map(imageStem);
  return [...files].sort((a, b) => {
    const sa = imageStem(a);
    const sb = imageStem(b);
    const na = numberedStemInfo(sa, allStems)?.num ?? 0;
    const nb = numberedStemInfo(sb, allStems)?.num ?? 0;
    if (na !== nb) return na - nb;
    return sa.localeCompare(sb, "pt-BR", { sensitivity: "base" });
  });
}

function chainByHash(files, hashes, threshold) {
  if (!files.length) return [];
  const groups = [[files[0]]];
  for (let i = 1; i < files.length; i++) {
    const prev = files[i - 1];
    const cur = files[i];
    if (hamming(hashes[prev], hashes[cur]) <= threshold) groups[groups.length - 1].push(cur);
    else groups.push([cur]);
  }
  return groups;
}

function groupTimestampSession(files, hashes) {
  if (files.length <= SMALL_SESSION_MAX) {
    let maxAdj = 0;
    for (let i = 1; i < files.length; i++) {
      maxAdj = Math.max(maxAdj, hamming(hashes[files[i - 1]], hashes[files[i]]));
    }
    if (maxAdj <= SMALL_SESSION_MAX_ADJ) return [files];
  }
  return chainByHash(files, hashes, LARGE_SESSION_CHAIN_THRESHOLD);
}

function toUrl(prefix, name) {
  const encodedPrefix = prefix.split("/").map((seg) => encodeURIComponent(seg)).join("/");
  return `${encodedPrefix}/${encodeURIComponent(name)}`;
}

export async function buildImageGroupsForFolder(dirPath, urlPrefix, fileNames) {
  if (!fileNames.length) return [];

  const sessions = splitIntoSessions(fileNames);
  const hashTargets = new Set();
  for (const session of sessions) {
    if (session.kind !== "timestamp") continue;
    for (const entry of session.files) hashTargets.add(entry.name);
  }

  const hashes = {};
  for (const name of hashTargets) {
    const full = path.join(dirPath, name);
    if (!fs.existsSync(full)) continue;
    try {
      hashes[name] = await computeDHash(full);
    } catch {
      /* skip unreadable files */
    }
  }

  const groups = [];
  for (const session of sessions) {
    if (session.kind === "single") {
      groups.push([toUrl(urlPrefix, session.files[0])]);
      continue;
    }

    if (session.kind === "numbered") {
      const sorted = sortNumberedFiles(session.files);
      groups.push(sorted.map((name) => toUrl(urlPrefix, name)));
      continue;
    }

    const sorted = session.files
      .slice()
      .sort((a, b) => a.ts - b.ts)
      .map((entry) => entry.name);

    const ready = sorted.filter((name) => hashes[name] != null);
    const missing = sorted.filter((name) => hashes[name] == null);

    if (!ready.length) {
      groups.push(sorted.map((name) => toUrl(urlPrefix, name)));
      continue;
    }

    if (missing.length) {
      for (const name of missing) groups.push([toUrl(urlPrefix, name)]);
    }

    for (const chunk of groupTimestampSession(ready, hashes)) {
      groups.push(chunk.map((name) => toUrl(urlPrefix, name)));
    }
  }

  return groups;
}

export async function buildAllImageGroups(manifest, publicDir) {
  const groups = { categories: {}, teams: {}, flatTeams: {} };

  for (const [folder, urls] of Object.entries(manifest.categories || {})) {
    const dir = path.join(publicDir, "categories", folder);
    if (!fs.existsSync(dir)) continue;
    const names = urls.map((u) => decodeURIComponent(u.split("/").pop()));
    groups.categories[folder] = await buildImageGroupsForFolder(dir, `/categories/${folder}`, names);
  }

  for (const [league, teams] of Object.entries(manifest.teams || {})) {
    groups.teams[league] = {};
    for (const [team, urls] of Object.entries(teams)) {
      const dir = path.join(publicDir, "teams", league, team);
      if (!fs.existsSync(dir)) continue;
      const names = urls.map((u) => decodeURIComponent(u.split("/").pop()));
      groups.teams[league][team] = await buildImageGroupsForFolder(
        dir,
        `/teams/${league}/${team}`,
        names
      );
    }
  }

  for (const [folder, urls] of Object.entries(manifest.flatTeams || {})) {
    const dir = path.join(publicDir, "teams", folder);
    if (!fs.existsSync(dir)) continue;
    const names = urls.map((u) => decodeURIComponent(u.split("/").pop()));
    groups.flatTeams[folder] = await buildImageGroupsForFolder(dir, `/teams/${folder}`, names);
  }

  return groups;
}
