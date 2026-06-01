const GALLERY_LOCAL_KEY = "we_gallery_store_v1";
const GALLERY_PREFIX = "gallery:";

export function isGalleryImageRef(src) {
  return typeof src === "string" && src.startsWith(GALLERY_PREFIX);
}

export function galleryImageId(src) {
  return src.slice(GALLERY_PREFIX.length);
}

export function galleryImageRef(id) {
  return `${GALLERY_PREFIX}${id}`;
}

export function emptyGalleryStore() {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    images: {},
    groups: { categories: {}, teams: {}, flatTeams: {} },
  };
}

export async function fetchPublishedGallery() {
  try {
    const res = await fetch("/catalog/gallery-store.json", { cache: "no-store" });
    if (!res.ok) return emptyGalleryStore();
    const data = await res.json();
    return normalizeGalleryStore(data);
  } catch {
    return emptyGalleryStore();
  }
}

export function loadLocalGalleryDraft() {
  try {
    const raw = localStorage.getItem(GALLERY_LOCAL_KEY);
    if (!raw) return null;
    return normalizeGalleryStore(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveLocalGalleryDraft(store) {
  const normalized = normalizeGalleryStore(store);
  normalized.updatedAt = new Date().toISOString();
  localStorage.setItem(GALLERY_LOCAL_KEY, JSON.stringify(normalized));
  return normalized;
}

export function clearLocalGalleryDraft() {
  localStorage.removeItem(GALLERY_LOCAL_KEY);
}

export function downloadGalleryStore(store, filename = "gallery-store.json") {
  const blob = new Blob([JSON.stringify(normalizeGalleryStore(store), null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importGalleryStoreFromFile(file) {
  const text = await file.text();
  return normalizeGalleryStore(JSON.parse(text));
}

function normalizeGalleryStore(data) {
  const base = emptyGalleryStore();
  if (!data || typeof data !== "object") return base;
  return {
    version: 1,
    updatedAt: data.updatedAt || new Date().toISOString(),
    images: { ...base.images, ...(data.images || {}) },
    groups: {
      categories: { ...base.groups.categories, ...(data.groups?.categories || {}) },
      teams: deepMergeTeams(base.groups.teams, data.groups?.teams || {}),
      flatTeams: { ...base.groups.flatTeams, ...(data.groups?.flatTeams || {}) },
    },
  };
}

function deepMergeTeams(base, incoming) {
  const out = { ...base };
  for (const [league, teams] of Object.entries(incoming)) {
    out[league] = { ...(out[league] || {}), ...teams };
  }
  return out;
}

export function mergeGalleryIntoManifest(serverManifest, galleryStore) {
  if (!galleryStore?.images) return { ...(serverManifest || {}), _galleryImages: {} };

  const manifest = {
    generatedAt: serverManifest?.generatedAt || new Date().toISOString(),
    categories: { ...(serverManifest?.categories || {}) },
    teams: JSON.parse(JSON.stringify(serverManifest?.teams || {})),
    flatTeams: { ...(serverManifest?.flatTeams || {}) },
    groups: {
      categories: { ...(serverManifest?.groups?.categories || {}) },
      teams: JSON.parse(JSON.stringify(serverManifest?.groups?.teams || {})),
      flatTeams: { ...(serverManifest?.groups?.flatTeams || {}) },
    },
  };

  const appendGroups = (listKey, groupsKey, map) => {
    for (const [key, groups] of Object.entries(map || {})) {
      const urlGroups = (groups || [])
        .map((group) => (group || []).map((id) => galleryImageRef(id)))
        .filter((g) => g.length);
      const flat = urlGroups.flat();
      if (!flat.length) continue;
      manifest[listKey][key] = [...(manifest[listKey][key] || []), ...flat];
      manifest.groups[groupsKey][key] = [...(manifest.groups[groupsKey][key] || []), ...urlGroups];
    }
  };

  appendGroups("categories", "categories", galleryStore.groups?.categories);
  appendGroups("flatTeams", "flatTeams", galleryStore.groups?.flatTeams);

  for (const [league, teams] of Object.entries(galleryStore.groups?.teams || {})) {
    if (!manifest.teams[league]) manifest.teams[league] = {};
    if (!manifest.groups.teams[league]) manifest.groups.teams[league] = {};
    for (const [teamId, groups] of Object.entries(teams || {})) {
      const urlGroups = (groups || [])
        .map((group) => (group || []).map((id) => galleryImageRef(id)))
        .filter((g) => g.length);
      const flat = urlGroups.flat();
      if (!flat.length) continue;
      manifest.teams[league][teamId] = [...(manifest.teams[league][teamId] || []), ...flat];
      manifest.groups.teams[league][teamId] = [
        ...(manifest.groups.teams[league][teamId] || []),
        ...urlGroups,
      ];
    }
  }

  manifest._galleryImages = galleryStore.images;
  return manifest;
}

export function resolveGalleryImageUrl(src, galleryImages) {
  if (!isGalleryImageRef(src)) return src;
  return galleryImages?.[galleryImageId(src)] || src;
}

export function compressImageFile(file, maxSide = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      const scale = Math.min(1, maxSide / Math.max(width, height));
      width = Math.round(width * scale);
      height = Math.round(height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível ler a imagem."));
    };
    img.src = url;
  });
}

export function addImagesToGallery(store, target, files) {
  const next = normalizeGalleryStore(store);
  const groupIds = [];

  for (const file of files) {
    const id = `img_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    next.images[id] = file.dataUrl;
    groupIds.push(id);
  }

  if (!groupIds.length) return next;

  const { bucket, league, teamId, categoryFolder } = target;

  if (bucket === "category") {
    if (!next.groups.categories[categoryFolder]) next.groups.categories[categoryFolder] = [];
    next.groups.categories[categoryFolder].push(groupIds);
  } else if (bucket === "flatTeam") {
    if (!next.groups.flatTeams[teamId]) next.groups.flatTeams[teamId] = [];
    next.groups.flatTeams[teamId].push(groupIds);
  } else if (bucket === "team") {
    if (!next.groups.teams[league]) next.groups.teams[league] = {};
    if (!next.groups.teams[league][teamId]) next.groups.teams[league][teamId] = [];
    next.groups.teams[league][teamId].push(groupIds);
  }

  return next;
}

export function removeGalleryGroup(store, target, groupIndex) {
  const next = normalizeGalleryStore(store);
  const groups = getGroupsList(next, target);
  if (!groups || groupIndex < 0 || groupIndex >= groups.length) return next;

  const removed = groups.splice(groupIndex, 1)[0] || [];
  for (const id of removed) {
    if (!isImageUsed(next, id)) delete next.images[id];
  }
  setGroupsList(next, target, groups);
  return next;
}

function getGroupsList(store, target) {
  const { bucket, league, teamId, categoryFolder } = target;
  if (bucket === "category") return store.groups.categories[categoryFolder];
  if (bucket === "flatTeam") return store.groups.flatTeams[teamId];
  if (bucket === "team") return store.groups.teams[league]?.[teamId];
  return null;
}

function setGroupsList(store, target, groups) {
  const { bucket, league, teamId, categoryFolder } = target;
  if (bucket === "category") store.groups.categories[categoryFolder] = groups;
  if (bucket === "flatTeam") store.groups.flatTeams[teamId] = groups;
  if (bucket === "team") {
    if (!store.groups.teams[league]) store.groups.teams[league] = {};
    store.groups.teams[league][teamId] = groups;
  }
}

function isImageUsed(store, id) {
  const allGroups = [
    ...Object.values(store.groups.categories || {}),
    ...Object.values(store.groups.flatTeams || {}),
    ...Object.values(store.groups.teams || {}).flatMap((t) => Object.values(t || {})),
  ];
  return allGroups.some((g) => (g || []).flat().includes(id));
}
