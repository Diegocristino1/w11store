import { useState, useEffect, useRef } from "react";
import imageManifest from "./src/generated/image-manifest.json";
import teamsCatalog from "./src/generated/teams-catalog.json";

const STORAGE_KEY = "we_store_v2";
const ADMIN_PWD = "admin123";

const STORE_CONTACT = {
  whatsapp: "5561998854511",
  whatsappDisplay: "(61) 99885-4511",
  instagramHandle: "w11store",
  instagramLabel: "w11store",
  whatsappUrl: "https://wa.me/5561998854511",
  instagramUrl: "https://instagram.com/w11store",
};

/* ───────── TEAMS DATA (legado — admin / produtos) ───────── */
const LEAGUES = [
  { id:"br",    label:"Brasileirão",    icon:"🇧🇷", color:"#009c3b" },
  { id:"serie", label:"Serie A",        icon:"🇮🇹", color:"#1a73c8" },
  { id:"epl",   label:"Premier League", icon:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", color:"#3d195b" },
  { id:"bund",  label:"Bundesliga",     icon:"🇩🇪", color:"#d30006" },
  { id:"l1",    label:"Ligue 1",        icon:"🇫🇷", color:"#001e62" },
  { id:"laliga",label:"LaLiga",         icon:"🇪🇸", color:"#ef3340" },
  { id:"sel",   label:"Seleções",       icon:"🌍", color:"#f5c200" },
  { id:"outros",label:"Outros",         icon:"🌎", color:"#7c3aed" },
];

/* Fotos por time: public/teams/<liga>/<id>/  →  /teams/<liga>/<id>/arquivo.jpg */
const teamPhotoUrl = (leagueId, teamId, file) => `/teams/${leagueId}/${teamId}/${file}`;

const TEAMS = {
  br:[
    {id:"flamengo",    name:"Flamengo",          color:"#cc0000", abbr:"FLA"},
    {id:"palmeiras",   name:"Palmeiras",          color:"#006437", abbr:"PAL"},
    {id:"corinthians", name:"Corinthians",        color:"#1a1a1a", abbr:"COR"},
    {id:"saopaulo",    name:"São Paulo",          color:"#cc0000", abbr:"SPF"},
    {id:"santos",      name:"Santos",             color:"#1c1c1c", abbr:"SAN"},
    {id:"gremio",      name:"Grêmio",             color:"#1d4ed8", abbr:"GRE"},
    {id:"inter",       name:"Internacional",      color:"#cc0000", abbr:"INT"},
    {id:"atletico",    name:"Atlético Mineiro",   color:"1a1a1a",  abbr:"CAM"},
    {id:"fluminense",  name:"Fluminense",         color:"#6b0000", abbr:"FLU"},
    {id:"botafogo",    name:"Botafogo",           color:"#1a1a1a", abbr:"BOT"},
    {id:"cruzeiro",    name:"Cruzeiro",           color:"#003399", abbr:"CRU"},
    {id:"vasco",       name:"Vasco da Gama",      color:"#1a1a1a", abbr:"VAS"},
    {id:"bahia",       name:"Bahia",              color:"#0066cc", abbr:"BAH"},
    {id:"fortaleza",   name:"Fortaleza",          color:"#cc0000", abbr:"FOR"},
    {id:"sport",       name:"Sport Recife",       color:"cc0000",  abbr:"SPT"},
    {id:"atleticago",  name:"Atlético Goianiense",color:"#cc0000", abbr:"ACG"},
    {id:"rbragantino", name:"Red Bull Bragantino",color:"cc0000",  abbr:"RBB"},
    {id:"cearasc",     name:"Ceará SC",           color:"#1a1a1a", abbr:"CEA"},
    {id:"goias",       name:"Goiás",              color:"#006437", abbr:"GOI"},
    {id:"avai",        name:"Avaí",               color:"#003399", abbr:"AVA"},
    {id:"coritiba",    name:"Coritiba",           color:"#006437", abbr:"CFC"},
    {id:"juventude",   name:"Juventude",          color:"#006437", abbr:"JUV"},
    {id:"americamg",   name:"América MG",         color:"006437",  abbr:"AME"},
    {id:"cuiaba",      name:"Cuiabá",             color:"#f5a623", abbr:"CUI"},
  ],
  serie:[
    {id:"juventus",  name:"Juventus",       color:"#1a1a1a", abbr:"JUV"},
    {id:"acmilan",   name:"AC Milan",       color:"#cc0000", abbr:"MIL"},
    {id:"inter_it",  name:"Inter Milan",    color:"#003399", abbr:"INT"},
    {id:"asroma",    name:"AS Roma",        color:"#8b1a1a", abbr:"ROM"},
    {id:"napoli",    name:"Napoli",         color:"#03a9f4", abbr:"NAP"},
    {id:"lazio",     name:"Lazio",          color:"#6aafe6", abbr:"LAZ"},
    {id:"atalanta",  name:"Atalanta",       color:"#1a1a1a", abbr:"ATA"},
    {id:"fiorentina",name:"Fiorentina",     color:"#6633cc", abbr:"FIO"},
    {id:"bologna",   name:"Bologna",        color:"#cc0000", abbr:"BOL"},
    {id:"torino",    name:"Torino",         color:"#8b1a1a", abbr:"TOR"},
    {id:"udinese",   name:"Udinese",        color:"#1a1a1a", abbr:"UDI"},
    {id:"sampdoria", name:"Sampdoria",      color:"#003399", abbr:"SAM"},
    {id:"cagliari",  name:"Cagliari",       color:"#cc0000", abbr:"CAG"},
    {id:"lecce",     name:"Lecce",          color:"#f5a623", abbr:"LEC"},
    {id:"monza",     name:"Monza",          color:"#cc0000", abbr:"MON"},
    {id:"empoli",    name:"Empoli",         color:"#3399cc", abbr:"EMP"},
  ],
  epl:[
    {id:"mancity",   name:"Manchester City",   color:"#6cabdd", abbr:"MCI"},
    {id:"manutd",    name:"Manchester United", color:"#cc0000", abbr:"MUN"},
    {id:"arsenal",   name:"Arsenal",           color:"#cc0000", abbr:"ARS"},
    {id:"liverpool", name:"Liverpool",         color:"#cc0000", abbr:"LIV"},
    {id:"chelsea",   name:"Chelsea",           color:"#034694", abbr:"CHE"},
    {id:"tottenham", name:"Tottenham",         color:"#132257", abbr:"TOT"},
    {id:"newcastle", name:"Newcastle",         color:"#1a1a1a", abbr:"NEW"},
    {id:"astonvilla",name:"Aston Villa",       color:"#95033f", abbr:"AVL"},
    {id:"brighton",  name:"Brighton",          color:"#0057b8", abbr:"BHA"},
    {id:"westham",   name:"West Ham",          color:"#7a263a", abbr:"WHU"},
    {id:"brentford", name:"Brentford",         color:"#cc0000", abbr:"BRE"},
    {id:"fulham",    name:"Fulham",            color:"#1a1a1a", abbr:"FUL"},
    {id:"crystal",   name:"Crystal Palace",   color:"#1b458f", abbr:"CRY"},
    {id:"wolves",    name:"Wolverhampton",     color:"#fdb913", abbr:"WOL"},
    {id:"everton",   name:"Everton",           color:"#003399", abbr:"EVE"},
    {id:"nforest",   name:"Nottingham Forest", color:"#cc0000", abbr:"NFO"},
    {id:"leicester", name:"Leicester City",    color:"#003090", abbr:"LEI"},
    {id:"leeds",     name:"Leeds United",      color:"#f5c200", abbr:"LEE"},
    {id:"burnley",   name:"Burnley",           color:"#6c1d45", abbr:"BUR"},
    {id:"bournemth", name:"Bournemouth",       color:"#cc0000", abbr:"BOU"},
  ],
  bund:[
    {id:"baviera",   name:"Bayern München",      color:"#cc0000", abbr:"BAY"},
    {id:"bvb",       name:"Borussia Dortmund",   color:"#f5c200", abbr:"BVB"},
    {id:"rbleipzig", name:"RB Leipzig",          color:"#cc0000", abbr:"RBL"},
    {id:"leverkusen",name:"Bayer Leverkusen",    color:"#cc0000", abbr:"LEV"},
    {id:"bmgladbach",name:"B. Mönchengladbach",  color:"#1a1a1a", abbr:"BMG"},
    {id:"frankfurt", name:"Eintracht Frankfurt", color:"#cc0000", abbr:"SGE"},
    {id:"wolfsburg", name:"Wolfsburg",           color:"#006437", abbr:"WOB"},
    {id:"freiburg",  name:"Freiburg",            color:"#cc0000", abbr:"SCF"},
    {id:"unionberl", name:"Union Berlin",        color:"#cc0000", abbr:"UNI"},
    {id:"stuttg",    name:"VfB Stuttgart",       color:"#cc0000", abbr:"VFB"},
    {id:"hoffenheim",name:"Hoffenheim",          color:"#1e90ff", abbr:"HOF"},
    {id:"werderb",   name:"Werder Bremen",       color:"#006437", abbr:"SVW"},
    {id:"mainz",     name:"Mainz 05",            color:"#cc0000", abbr:"M05"},
    {id:"augsburg",  name:"Augsburg",            color:"#cc0000", abbr:"FCA"},
    {id:"koln",      name:"Köln",               color:"#cc0000", abbr:"KÖL"},
    {id:"bochum",    name:"VfL Bochum",          color:"#003399", abbr:"BOC"},
  ],
  l1:[
    {id:"psg",       name:"Paris Saint-Germain", color:"#004170", abbr:"PSG"},
    {id:"marseille", name:"Olympique Marseille", color:"#009ee0", abbr:"OM"},
    {id:"monaco",    name:"AS Monaco",           color:"#cc0000", abbr:"ASM"},
    {id:"lyon",      name:"Olympique Lyon",      color:"#1a1a1a", abbr:"OL"},
    {id:"nice",      name:"OGC Nice",            color:"#cc0000", abbr:"OGC"},
    {id:"rennes",    name:"Stade Rennais",       color:"#cc0000", abbr:"SRF"},
    {id:"lens",      name:"RC Lens",             color:"#f5c200", abbr:"RCL"},
    {id:"lille",     name:"Lille OSC",           color:"#cc0000", abbr:"LOI"},
    {id:"nantes",    name:"FC Nantes",           color:"#f5a623", abbr:"FCN"},
    {id:"montpell",  name:"Montpellier",         color:"#f87171", abbr:"MHC"},
    {id:"toulouse",  name:"Toulouse FC",         color:"#6633cc", abbr:"TFC"},
    {id:"reims",     name:"Stade de Reims",      color:"#cc0000", abbr:"SDR"},
    {id:"strasbourg",name:"RC Strasbourg",       color:"#003399", abbr:"RCS"},
    {id:"lorient",   name:"FC Lorient",          color:"#f5a623", abbr:"FCL"},
    {id:"brest",     name:"Stade Brest",         color:"#cc0000", abbr:"SB29"},
  ],
  laliga:[
    {id:"realmadrid",name:"Real Madrid",        color:"#c0a060", abbr:"RMA"},
    {id:"barcelona", name:"FC Barcelona",       color:"#004d99", abbr:"FCB"},
    {id:"atletico",  name:"Atlético de Madrid", color:"#cc0000", abbr:"ATM"},
    {id:"sevilla",   name:"Sevilla FC",         color:"#cc0000", abbr:"SEV"},
    {id:"realbetis", name:"Real Betis",         color:"#006437", abbr:"BET"},
    {id:"valencia",  name:"Valencia CF",        color:"#f5a623", abbr:"VCF"},
    {id:"villarreal",name:"Villarreal",         color:"#f5c200", abbr:"VIL"},
    {id:"realsoc",   name:"Real Sociedad",      color:"#1a1a1a", abbr:"RSO"},
    {id:"athletic",  name:"Athletic Bilbao",    color:"#cc0000", abbr:"ATH"},
    {id:"celta",     name:"Celta de Vigo",      color:"#6aafe6", abbr:"CEL"},
    {id:"osasuna",   name:"CA Osasuna",         color:"#cc0000", abbr:"OSA"},
    {id:"girona",    name:"Girona FC",          color:"#cc0000", abbr:"GIR"},
    {id:"getafe",    name:"Getafe CF",          color:"#003399", abbr:"GET"},
    {id:"mallorca",  name:"RCD Mallorca",       color:"#cc0000", abbr:"MLL"},
    {id:"rayo",      name:"Rayo Vallecano",     color:"#cc0000", abbr:"RAY"},
    {id:"espanyol",  name:"Espanyol",           color:"#003399", abbr:"ESP"},
  ],
  sel:[
    {id:"brasil_sel",    name:"Brasil",          color:"#009c3b", abbr:"BRA"},
    {id:"argentina_sel", name:"Argentina",       color:"#74acdf", abbr:"ARG"},
    {id:"franca_sel",    name:"França",          color:"#002395", abbr:"FRA"},
    {id:"alemanha_sel",  name:"Alemanha",        color:"#1a1a1a", abbr:"GER"},
    {id:"espanha_sel",   name:"Espanha",         color:"#cc0000", abbr:"ESP"},
    {id:"portugal_sel",  name:"Portugal",        color:"#006600", abbr:"POR"},
    {id:"inglaterra_sel",name:"Inglaterra",      color:"#003399", abbr:"ENG"},
    {id:"italia_sel",    name:"Itália",          color:"#003399", abbr:"ITA"},
    {id:"uruguai_sel",   name:"Uruguai",         color:"#003399", abbr:"URU"},
    {id:"colombia_sel",  name:"Colômbia",        color:"#f5c200", abbr:"COL"},
    {id:"mexico_sel",    name:"México",          color:"#006437", abbr:"MEX"},
    {id:"holanda_sel",   name:"Países Baixos",   color:"#f5a623", abbr:"NED"},
    {id:"croacia_sel",   name:"Croácia",         color:"#cc0000", abbr:"CRO"},
    {id:"marrocos_sel",  name:"Marrocos",        color:"#cc0000", abbr:"MAR"},
    {id:"japao_sel",     name:"Japão",           color:"#003399", abbr:"JAP"},
    {id:"eua_sel",       name:"Estados Unidos",  color:"#cc0000", abbr:"USA"},
    {id:"senegal_sel",   name:"Senegal",         color:"#009c3b", abbr:"SEN"},
    {id:"belgica_sel",   name:"Bélgica",         color:"#cc0000", abbr:"BEL"},
    {id:"dinamarca_sel", name:"Dinamarca",       color:"#cc0000", abbr:"DEN"},
    {id:"suica_sel",     name:"Suíça",           color:"#cc0000", abbr:"SUI"},
    {id:"australia_sel", name:"Austrália",       color:"#f5a623", abbr:"AUS"},
    {id:"coreia_sel",    name:"Coreia do Sul",   color:"#cc0000", abbr:"KOR"},
    {id:"ghana_sel",     name:"Gana",            color:"#1a1a1a", abbr:"GHA"},
    {id:"polonia_sel",   name:"Polônia",         color:"#cc0000", abbr:"POL"},
  ],
  outros:[
    {id:"bocajuniors",   name:"Boca Juniors",     color:"#f5c200", abbr:"BJU"},
    {id:"riverplate",    name:"River Plate",      color:"#cc0000", abbr:"RIV"},
    {id:"racing_ar",     name:"Racing Club",      color:"#6aafe6", abbr:"RAC"},
    {id:"indepediente",  name:"Independiente",    color:"#cc0000", abbr:"IND"},
    {id:"sanlorenzo",    name:"San Lorenzo",      color:"#003399", abbr:"SAN"},
    {id:"clubamerica",   name:"Club América",     color:"#f5c200", abbr:"AME"},
    {id:"chivas",        name:"Chivas Guadalajara",color:"#cc0000",abbr:"CHI"},
    {id:"azul",          name:"Cruz Azul",        color:"#003399", abbr:"CAZ"},
    {id:"pumas",         name:"Pumas UNAM",       color:"#f5c200", abbr:"PUM"},
    {id:"tigres",        name:"Tigres UANL",      color:"#f5c200", abbr:"TIG"},
    {id:"porto",         name:"FC Porto",         color:"#003399", abbr:"POR"},
    {id:"benfica",       name:"SL Benfica",       color:"#cc0000", abbr:"SLB"},
    {id:"sporting",      name:"Sporting CP",      color:"#006437", abbr:"SCP"},
    {id:"celtic",        name:"Celtic FC",        color:"#006437", abbr:"CEL"},
    {id:"rangers",       name:"Rangers FC",       color:"#003399", abbr:"RFC"},
    {id:"ajax",          name:"Ajax",             color:"#cc0000", abbr:"AJX"},
    {id:"psv",           name:"PSV Eindhoven",    color:"#cc0000", abbr:"PSV"},
    {id:"fenerbahce",    name:"Fenerbahçe",       color:"#f5c200", abbr:"FEN"},
    {id:"galatasaray",   name:"Galatasaray",      color:"#f5a623", abbr:"GLS"},
    {id:"shakhtar",      name:"Shakhtar Donetsk", color:"#f5a623", abbr:"SHA"},
  ],
};

const CATEGORIES = ["Camisa Titular","Camisa Reserva","Kit Treino","Camisa Retrô","Corta-Vento","Kit Infantil","Calção","Meias","Agasalho"];
const SIZES = ["PP","P","M","G","GG","XGG"];

/* Galerias da home — coloque fotos em public/categories/<pasta>/ */
const CATEGORY_GALLERIES = [
  { id: "kit-treino", label: "Kit Treino", productCategory: "Kit Treino", folder: "kit-treino" },
  { id: "camisas-retros", label: "Camisas Retrôs", productCategory: "Camisa Retrô", folder: "camisas-retros" },
  { id: "corta-vento", label: "Corta-Vento", productCategory: "Corta-Vento", folder: "corta-vento" },
  { id: "kit-infantil", label: "Kit Infantil", productCategory: "Kit Infantil", folder: "kit-infantil" },
];
const fmtBRL = v => `R$ ${Number(v).toFixed(2).replace(".",",")}`;

function buildWhatsAppOrderUrl(cart, total) {
  const lines = [
    "Olá! Gostaria de finalizar meu pedido na *Winning Eleven Store*:",
    "",
    ...cart.map((item, i) =>
      `${i + 1}. ${item.name} (${item.team})\n   Tam: ${item.size} · Qtd: ${item.qty} · ${fmtBRL(item.price * item.qty)}`
    ),
    "",
    `*Total: ${fmtBRL(total)}*`,
    "",
    "🚚 Gostaria de saber sobre entrega e formas de pagamento.",
    "Obrigado!",
  ];
  return `${STORE_CONTACT.whatsappUrl}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function buildWhatsAppInquiryUrl({ section, name, imageIndex, productName } = {}) {
  const lines = [
    "Olá! Tudo bem? 👋",
    "",
    "Vi no site da *Winning Eleven Store* e gostaria de mais informações sobre uma peça que me interessou.",
    "",
  ];

  if (productName) {
    lines.push(`🛍️ *Produto:* ${productName}`);
  }
  if (section && name) {
    lines.push(`📌 *${section}:* ${name}`);
  }
  if (imageIndex != null) {
    lines.push(`📷 *Referência da foto:* ${imageIndex + 1}`);
  }

  lines.push(
    "",
    "Poderia me informar, por favor:",
    "• Valor da peça",
    "• Tamanhos disponíveis (PP ao XGG)",
    "• Prazo e valor do frete",
    "• Formas de pagamento (Pix, cartão, etc.)",
    "",
    "🚚 Vi que vocês fazem entrega para todo o Brasil.",
    "",
    "Aguardo seu retorno! Obrigado. ⚽",
    "",
    "— Enviado pelo site Winning Eleven Store"
  );

  return `${STORE_CONTACT.whatsappUrl}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function openWhatsAppInquiry(ctx) {
  window.open(buildWhatsAppInquiryUrl(ctx), "_blank", "noopener,noreferrer");
}

function canShowAdmin() {
  if (import.meta.env.DEV) return true;
  return new URLSearchParams(window.location.search).get("admin") === "1";
}

/* Catálogo dinâmico — gerado a partir das pastas em public/teams/ */
const CATALOG_LEAGUES = teamsCatalog.leagues || [];

function getTeamImages(team) {
  if (!team) return [];
  if (team.flat) return imageManifest.flatTeams?.[team.id] || [];
  return imageManifest.teams?.[team.leaguePath]?.[team.teamPath || team.id] || [];
}

function findCatalogTeam(teamId) {
  for (const lg of CATALOG_LEAGUES) {
    const team = lg.teams.find((t) => t.id === teamId);
    if (team) return { ...team, leagueId: lg.id, leagueLabel: lg.label };
  }
  return null;
}

function findCatalogTeamLeague(teamId) {
  return findCatalogTeam(teamId)?.leagueId ?? null;
}

function catalogTeamForProduct(teamId) {
  const fromCatalog = findCatalogTeam(teamId);
  if (fromCatalog) return fromCatalog;
  for (const [leagueId, teams] of Object.entries(TEAMS)) {
    const t = teams.find((x) => x.id === teamId);
    if (t) return { ...t, leagueId, leagueLabel: LEAGUES.find((l) => l.id === leagueId)?.label };
  }
  return { id: teamId, name: teamId, abbr: "??", color: "#333333", leagueId: "outros" };
}

/* ───────── HELPERS ───────── */
function ContactBanner({ GOLD, compact = false, centered = true }) {
  const wrap = {
    textAlign: centered ? "center" : "left",
    padding: compact ? "12px 16px" : "16px 20px",
    background: "#1a1a1a",
    borderRadius: 12,
    border: `1px solid ${GOLD}44`,
  };
  return (
    <div style={wrap}>
      {!compact && (
        <p style={{ color: "#ccc", fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>
          Gostou desta peça? <strong style={{ color: GOLD }}>Entre em contato com o vendedor</strong> pelo WhatsApp ou Instagram.
        </p>
      )}
      {compact && (
        <p style={{ color: "#aaa", fontSize: 12, marginBottom: 10, lineHeight: 1.5 }}>
          Clique para ampliar · Fale com o vendedor no WhatsApp
        </p>
      )}
      <div style={{ display: "flex", gap: 10, justifyContent: centered ? "center" : "flex-start", flexWrap: "wrap", marginBottom: compact ? 0 : 10 }}>
        <a
          href={STORE_CONTACT.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-g"
          style={{ padding: compact ? "8px 14px" : "10px 18px", fontSize: compact ? 12 : 14, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}
          onClick={(e) => e.stopPropagation()}
        >
          📱 WhatsApp {STORE_CONTACT.whatsappDisplay}
        </a>
        <a
          href={STORE_CONTACT.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-o"
          style={{ padding: compact ? "8px 14px" : "10px 18px", fontSize: compact ? 12 : 14, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}
          onClick={(e) => e.stopPropagation()}
        >
          📷 @{STORE_CONTACT.instagramLabel}
        </a>
      </div>
      {!compact && (
        <p style={{ color: "#888", fontSize: 13, margin: 0 }}>
          🚚 Fazemos entregas para todo o Brasil
        </p>
      )}
    </div>
  );
}

function ImageLightbox({ images, index, onClose, onChange, GOLD, inquiryContext }) {
  const src = images[index];
  const whatsappUrl = buildWhatsAppInquiryUrl({
    ...inquiryContext,
    imageIndex: index,
    productName: inquiryContext?.productName,
  });

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && index > 0) onChange(index - 1);
      if (e.key === "ArrowRight" && index < images.length - 1) onChange(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [index, images.length, onClose, onChange]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,.94)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto"}}
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        style={{position:"fixed",top:20,right:20,background:"#1a1a1a",border:`2px solid ${GOLD}`,color:GOLD,borderRadius:10,width:44,height:44,cursor:"pointer",fontSize:22,zIndex:2002}}
      >
        ✕
      </button>

      {images.length > 1 && index > 0 && (
        <button
          type="button"
          aria-label="Anterior"
          onClick={(e) => { e.stopPropagation(); onChange(index - 1); }}
          style={{position:"fixed",left:16,top:"50%",transform:"translateY(-50%)",background:"#1a1a1acc",border:`2px solid ${GOLD}66`,color:GOLD,borderRadius:10,width:48,height:48,cursor:"pointer",fontSize:24,zIndex:2002}}
        >
          ‹
        </button>
      )}

      {images.length > 1 && index < images.length - 1 && (
        <button
          type="button"
          aria-label="Próxima"
          onClick={(e) => { e.stopPropagation(); onChange(index + 1); }}
          style={{position:"fixed",right:16,top:"50%",transform:"translateY(-50%)",background:"#1a1a1acc",border:`2px solid ${GOLD}66`,color:GOLD,borderRadius:10,width:48,height:48,cursor:"pointer",fontSize:24,zIndex:2002}}
        >
          ›
        </button>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, maxWidth: "min(96vw, 720px)", width: "100%", paddingTop: 56, paddingBottom: 24 }}
      >
        <img
          src={src}
          alt="Produto Winning Eleven Store"
          style={{ maxWidth: "100%", maxHeight: "min(50vh, 640px)", objectFit: "contain", borderRadius: 8, boxShadow: "0 8px 48px #000a" }}
        />

        <div style={{ width: "100%", textAlign: "center" }}>
          <p style={{ color: "#ccc", fontSize: 14, lineHeight: 1.6, marginBottom: 14 }}>
            Gostou desta peça? <strong style={{ color: GOLD }}>Fale conosco no WhatsApp</strong> para saber preço, tamanhos e entrega.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-g"
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", maxWidth: 420, padding: "14px 20px", fontSize: 16, textDecoration: "none", marginBottom: 10 }}
            onClick={(e) => e.stopPropagation()}
          >
            📱 QUERO COMPRAR — FALAR NO WHATSAPP
          </a>
          <p style={{ color: "#666", fontSize: 12, margin: 0 }}>🚚 Entregas para todo o Brasil · {STORE_CONTACT.whatsappDisplay}</p>
        </div>

        {images.length > 1 && (
          <div style={{ color: "#aaa", fontSize: 14, fontWeight: 700, letterSpacing: 1 }}>
            {index + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
}

function PhotoGallery({ images, label, GOLD, inquiryContext }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (!images?.length) return null;
  return (
    <div style={{marginBottom:40}}>
      {label && (
        <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:GOLD,letterSpacing:3,marginBottom:20}}>
          {label}
        </h2>
      )}
      <div className="photo-grid">
        {images.map((src, i) => (
          <div
            key={src}
            style={{background:"#161616",borderRadius:14,overflow:"hidden",border:`1px solid ${GOLD}22`,display:"block",width:"100%",textAlign:"left"}}
          >
            <div style={{aspectRatio:"1",overflow:"hidden",position:"relative"}}>
              <button
                type="button"
                onClick={() => openWhatsAppInquiry({ ...inquiryContext, imageIndex: i })}
                style={{width:"100%",height:"100%",padding:0,border:"none",cursor:"pointer",display:"block",background:"none"}}
                aria-label="Comprar via WhatsApp"
              >
                <img src={src} alt={`${label || inquiryContext?.name || "Foto"} ${i + 1}`} style={{width:"100%",height:"100%",objectFit:"cover",display:"block",pointerEvents:"none"}} loading="lazy"/>
              </button>
              <button
                type="button"
                title="Ampliar foto"
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                style={{position:"absolute",top:8,right:8,background:"#000c",border:`1px solid ${GOLD}66`,color:GOLD,borderRadius:8,padding:"6px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}
              >
                🔍 Ampliar
              </button>
            </div>
            <button
              type="button"
              onClick={() => openWhatsAppInquiry({ ...inquiryContext, imageIndex: i })}
              style={{width:"100%",padding:"10px 12px",border:"none",borderTop:`1px solid ${GOLD}22`,background:"#1a1a1a",cursor:"pointer",textAlign:"left"}}
            >
              <p style={{fontSize:11,color:GOLD,fontWeight:700,marginBottom:4}}>💬 QUERO COMPRAR</p>
              <p style={{fontSize:11,color:"#888",lineHeight:1.4,margin:0}}>Toque para falar no WhatsApp · preço, tamanhos e entrega</p>
            </button>
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChange={setLightboxIndex}
          GOLD={GOLD}
          inquiryContext={inquiryContext}
        />
      )}
    </div>
  );
}

function normalizeTeamColor(c) {
  if (!c) return "#333333";
  const hex = (c.startsWith("#") ? c : `#${c}`).slice(0, 7);
  return /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#333333";
}

function TeamCircle({ team, size=72, selected=false }) {
  const bg = normalizeTeamColor(team.color);
  return (
    <div className="team-circle" style={{
      width:size, height:size, borderRadius:"50%",
      background:bg,
      border:`2.5px solid ${selected?"#f5c200":"#f5c20066"}`,
      display:"flex", alignItems:"center", justifyContent:"center",
      flexDirection:"column", gap:1, flexShrink:0,
      boxShadow: selected?"0 0 16px #f5c200aa":"0 2px 8px #0006",
      transition:"all .2s",
    }}>
      <span style={{fontSize:size*0.24, fontWeight:900, color:"white", fontFamily:"Arial Black,sans-serif", lineHeight:1, textShadow:"0 1px 3px #0008"}}>
        {team.abbr}
      </span>
    </div>
  );
}

/* ───────── MAIN APP ───────── */
export default function App() {
  const [products, setProducts]       = useState([]);
  const [view, setView]               = useState("store");
  const [activeLeague, setActiveLeague] = useState(CATALOG_LEAGUES[0]?.id || "br");

  useEffect(() => {
    if (!CATALOG_LEAGUES.some((lg) => lg.id === activeLeague)) {
      setActiveLeague(CATALOG_LEAGUES[0]?.id || "br");
    }
  }, [activeLeague]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart]               = useState([]);
  const [cartOpen, setCartOpen]       = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminView, setAdminView]     = useState("list");
  const [editingProduct, setEditingProduct] = useState(null);
  const [toast, setToast]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [confirmDel, setConfirmDel]   = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const showAdmin = canShowAdmin();

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;1,400&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}
      body{background:#c87800}
      ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#111}::-webkit-scrollbar-thumb{background:#f5c200;border-radius:4px}
      input:focus,select:focus,textarea:focus{border-color:#f5c200!important;outline:none}
      .tc-inner{display:inline-flex;line-height:0;border-radius:50%}
      .team-circle{transition:transform .2s ease,box-shadow .2s ease}
      .tc:hover .team-circle{transform:scale(1.08);box-shadow:0 0 20px #f5c200aa,0 4px 12px rgba(0,0,0,.35)!important}
      .inp{background:#222;border:1px solid #333;border-radius:9px;padding:10px 14px;color:#f0f0f0;font-size:14px;width:100%;font-family:inherit}
      .btn-g{background:#f5c200;color:#000;border:none;border-radius:9px;padding:10px 20px;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit;transition:opacity .15s}
      .btn-g:hover{opacity:.88}
      .btn-o{background:transparent;color:#f5c200;border:1.5px solid #f5c200;border-radius:9px;padding:10px 20px;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit;transition:all .15s}
      .btn-o:hover{background:#f5c20022}
      .btn-d{background:transparent;color:#ef4444;border:1px solid #ef4444;border-radius:9px;padding:8px 16px;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit;transition:all .15s}
      .btn-d:hover{background:#ef444422}
      .sz{background:#222;border:1px solid #333;border-radius:6px;padding:6px 13px;color:#ccc;cursor:pointer;font-size:13px;font-weight:700;transition:all .15s;font-family:inherit}
      .sz:hover{border-color:#f5c200;color:#f5c200}
      .sz.on{background:#f5c200;border-color:#f5c200;color:#000}
      .lgtab{padding:10px 12px;border-radius:20px;font-size:13px;font-weight:700;cursor:pointer;transition:all .15s;border:1.5px solid #f5c20044;background:#1a1a1a;color:#aaa;font-family:inherit;white-space:nowrap;width:100%;text-align:center}
      .lgtab:hover{border-color:#f5c200;color:#f5c200}
      .lgtab.on{background:#f5c200;color:#000;border-color:#f5c200}
      .league-tabs-bar{width:100%;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,128px),1fr));gap:8px;padding:12px 16px;background:#111;border-bottom:1px solid #1e1e1e}
      .cat-btn{background:#1a1a1a;border:1.5px solid #f5c20044;border-radius:20px;padding:8px 18px;font-size:13px;font-weight:700;color:#f5c200;cursor:pointer;font-family:inherit;transition:all .2s}
      .cat-btn:hover{background:#f5c20022;border-color:#f5c200;transform:translateY(-2px)}
      .cat-btn.on{background:#f5c200;color:#000;border-color:#f5c200}
      .cat-row{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;width:100%;max-width:720px;margin:0 auto}
      .site-header{background:#111;border-bottom:2px solid #f5c20044;padding:0 16px;display:flex;align-items:center;justify-content:space-between;min-height:68px;position:sticky;top:0;z-index:100;gap:10px;flex-wrap:wrap}
      .header-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
      .header-contact{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
      .page-section{max-width:1200px;margin:0 auto;padding:24px 16px}
      .photo-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,220px),1fr));gap:16px}
      .product-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,220px),1fr));gap:16px}
      .product-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:start}
      .admin-stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
      .admin-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}
      .league-header{display:flex;align-items:center;gap:16px;margin-bottom:24px;flex-wrap:wrap}
      .league-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(28px,6vw,40px);color:#f5c200;letter-spacing:4px;word-break:break-word}
      .team-card-grid{display:flex;flex-wrap:wrap;gap:16px;justify-content:flex-start}
      .cart-drawer{position:fixed;right:0;top:0;bottom:0;width:min(390px,100vw);background:#0f0f0f;border-left:2px solid #f5c20044;z-index:201;display:flex;flex-direction:column;animation:slideIn .28s ease}
      @media(max-width:900px){
        .product-detail-grid{grid-template-columns:1fr;gap:24px}
        .admin-stats-grid{grid-template-columns:repeat(2,1fr)}
        .admin-form-grid{grid-template-columns:1fr}
      }
      @media(max-width:640px){
        .site-header{padding:10px 12px;min-height:auto}
        .header-admin{display:none!important}
        .header-logo-sub{display:none}
        .header-contact a{padding:6px 10px!important;font-size:11px!important}
        .header-actions .btn-o,.header-actions .btn-g{padding:6px 12px!important;font-size:11px!important}
        .league-tabs-bar{padding:10px 12px;grid-template-columns:repeat(auto-fit,minmax(min(100%,100px),1fr));gap:6px}
        .lgtab{padding:8px 6px;font-size:11px;border-radius:14px}
        .page-section{padding:20px 12px}
        .photo-grid,.product-grid{grid-template-columns:repeat(auto-fill,minmax(min(100%,140px),1fr));gap:12px}
        .admin-stats-grid{grid-template-columns:1fr 1fr}
        .team-card-grid{gap:12px;justify-content:center}
      }
      @keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
      @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      @keyframes spin{to{transform:rotate(360deg)}}
    `;
    document.head.appendChild(s);
    return () => { document.head.removeChild(s); };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(STORAGE_KEY);
        setProducts(r ? JSON.parse(r.value) : []);
      } catch { setProducts([]); }
      setLoading(false);
    })();
  }, []);

  const save = async p => { setProducts(p); try { await window.storage.set(STORAGE_KEY, JSON.stringify(p)); } catch {} };
  const toast$ = (msg,err) => { setToast({msg,err}); setTimeout(()=>setToast(null),3000); };
  const cartCount = cart.reduce((s,i)=>s+i.qty,0);
  const cartTotal = cart.reduce((s,i)=>s+i.price*i.qty,0);

  const openTeam = (team, leagueId) =>
    setSelectedTeam({ ...team, leagueId: leagueId || team.leagueId || findCatalogTeamLeague(team.id) });

  const addToCart = (product, size) => {
    setCart(c => { const ex=c.find(i=>i.id===product.id&&i.size===size); return ex?c.map(i=>i.id===product.id&&i.size===size?{...i,qty:i.qty+1}:i):[...c,{...product,size,qty:1}]; });
    toast$("Adicionado ao carrinho! ✅");
    setCartOpen(true);
  };

  const finalizeViaWhatsApp = () => {
    if (!cart.length) return;
    window.open(buildWhatsAppOrderUrl(cart, cartTotal), "_blank", "noopener,noreferrer");
    setCart([]);
    setCartOpen(false);
    toast$("Pedido enviado ao WhatsApp! 📱");
  };

  const FF = "'Bebas Neue',sans-serif";
  const FB = "'Barlow Condensed',sans-serif";
  const GOLD = "#f5c200";

  /* Star bg pattern (CSS) */
  const starBg = {
    background:"#c87800",
    backgroundImage:`radial-gradient(circle, #a86000 1px, transparent 1px)`,
    backgroundSize:"30px 30px",
  };

  /* — listagem de ligas/times — */
  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",...starBg}}>
      <div style={{textAlign:"center",fontFamily:FF}}>
        <div style={{width:52,height:52,border:"3px solid #f5c200",borderTopColor:"transparent",borderRadius:"50%",margin:"0 auto 16px",animation:"spin 1s linear infinite"}}/>
        <p style={{color:GOLD,fontSize:22,letterSpacing:3}}>CARREGANDO...</p>
      </div>
    </div>
  );

  return (
    <div style={{fontFamily:FB,background:"#0f0f0f",minHeight:"100vh",color:"#f0f0f0"}}>

      {/* HEADER */}
      <header className="site-header">
        <button onClick={()=>{setView("store");setSelectedTeam(null);setSelectedCategory(null);}} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:14,padding:0,flexShrink:0}}>
          <div style={{width:44,height:44,borderRadius:"50%",background:"#1a1a1a",border:"2px solid #f5c200",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontSize:22}}>⚽</span>
          </div>
          <div style={{textAlign:"left"}}>
            <div style={{fontFamily:FF,fontSize:20,color:GOLD,letterSpacing:3,lineHeight:1}}>WINNING ELEVEN</div>
            <div className="header-logo-sub" style={{fontFamily:FF,fontSize:11,color:"#888",letterSpacing:4,lineHeight:1}}>STORE</div>
          </div>
        </button>

        <div className="header-contact">
          <a href={STORE_CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-g" style={{padding:"7px 14px",fontSize:12,textDecoration:"none",whiteSpace:"nowrap"}}>
            📱 WhatsApp
          </a>
          <a href={STORE_CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn-o" style={{padding:"7px 14px",fontSize:12,textDecoration:"none",whiteSpace:"nowrap"}}>
            📷 Instagram
          </a>
        </div>

        <div className="header-actions">
          {showAdmin && (
          <button className="btn-o header-admin" style={{padding:"7px 16px",fontSize:12}} onClick={()=>adminLoggedIn?setView("admin"):setView("admin-login")}>
            {adminLoggedIn?"⚙ Admin":"🔐 Admin"}
          </button>
          )}
          <button className="btn-g" style={{padding:"7px 16px",fontSize:12,position:"relative"}} onClick={()=>setCartOpen(true)}>
            🛒 {cartCount>0&&<span style={{marginLeft:4,background:"#cc0000",borderRadius:10,padding:"1px 7px",fontSize:11}}>{cartCount}</span>}
          </button>
        </div>
      </header>

      {/* TOAST */}
      {toast&&<div style={{position:"fixed",top:76,right:20,zIndex:999,background:toast.err?"#7f1d1d":"#1c3a0c",border:`1px solid ${toast.err?"#ef4444":GOLD}`,color:"#fff",padding:"10px 18px",borderRadius:10,fontSize:14,fontWeight:700,animation:"fadeUp .3s ease",boxShadow:"0 4px 20px #0008"}}>{toast.msg}</div>}

      {/* CONFIRM DELETE */}
      {confirmDel&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:"#1a1a1a",border:`1px solid ${GOLD}44`,borderRadius:16,padding:32,width:340,textAlign:"center"}}>
            <div style={{fontSize:44,marginBottom:14}}>🗑️</div>
            <h3 style={{fontFamily:FF,fontSize:24,color:GOLD,letterSpacing:2,marginBottom:8}}>REMOVER PRODUTO?</h3>
            <p style={{color:"#888",fontSize:13,marginBottom:22}}>{confirmDel.name}</p>
            <div style={{display:"flex",gap:10}}>
              <button className="btn-d" style={{flex:1,padding:12}} onClick={()=>{save(products.filter(p=>p.id!==confirmDel.id));toast$("Produto removido 🗑️");setConfirmDel(null);}}>Remover</button>
              <button className="btn-o" style={{flex:1,padding:12}} onClick={()=>setConfirmDel(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── CATEGORY GALLERY ── */}
      {view==="store"&&selectedCategory&&(
        <CategoryGalleryView
          category={selectedCategory}
          images={imageManifest.categories?.[selectedCategory.folder] || []}
          products={products}
          onBack={()=>setSelectedCategory(null)}
          onSelectProduct={p=>{setSelectedProduct(p);setView("product");}}
          GOLD={GOLD}
          FF={FF}
        />
      )}

      {/* ── STORE VIEW ── */}
      {view==="store"&&!selectedTeam&&!selectedCategory&&(
        <>
          {/* HERO */}
          <section style={{...starBg,padding:"60px 24px 50px",textAlign:"center",position:"relative"}}>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,#c8780000,#0f0f0f)"}}/>
            <div style={{position:"relative"}}>
              <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:110,height:110,borderRadius:"50%",background:"#111",border:`3px solid ${GOLD}`,marginBottom:20,boxShadow:`0 0 40px ${GOLD}44`}}>
                <div style={{textAlign:"center"}}>
                  <div style={{fontFamily:FF,fontSize:11,color:GOLD,letterSpacing:3,lineHeight:1}}>WINNING</div>
                  <div style={{fontSize:30}}>⚽</div>
                  <div style={{fontFamily:FF,fontSize:11,color:GOLD,letterSpacing:3,lineHeight:1}}>ELEVEN</div>
                </div>
              </div>
              <h1 style={{fontFamily:FF,fontSize:"clamp(42px,7vw,88px)",color:"#fff",letterSpacing:4,lineHeight:.95,marginBottom:14}}>
                WINNING ELEVEN<br/><span style={{color:GOLD}}>STORE</span>
              </h1>
              <p style={{color:"#aaa",fontSize:16,marginBottom:12}}>Camisas e uniformes oficiais dos maiores clubes e seleções do mundo</p>
              <p style={{color:GOLD,fontSize:14,fontWeight:700,marginBottom:20}}>🚚 Fazemos entregas para todo o Brasil</p>
              <div style={{maxWidth:520,margin:"0 auto 24px"}}>
                <ContactBanner GOLD={GOLD} compact={false} centered />
              </div>
              <div className="cat-row">
                {CATEGORY_GALLERIES.map(cat=>(
                  <button
                    key={cat.id}
                    type="button"
                    className={`cat-btn${selectedCategory?.id===cat.id?" on":""}`}
                    onClick={()=>{setSelectedCategory(cat);setSelectedTeam(null);window.scrollTo({top:0,behavior:"smooth"});}}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* LEAGUE SECTIONS */}
          <>
            <div className="league-tabs-bar">
              {CATALOG_LEAGUES.map(lg=>(
                <button key={lg.id} className={`lgtab${activeLeague===lg.id?" on":""}`}
                  onClick={()=>setActiveLeague(lg.id)}>
                  {lg.icon} {lg.label}
                </button>
              ))}
            </div>

            <div className="page-section">
              {CATALOG_LEAGUES.filter(lg=>lg.id===activeLeague).map(lg=>(
                <section key={lg.id}>
                  <div className="league-header">
                    <span style={{fontSize:36}}>{lg.icon}</span>
                    <h2 className="league-title">{lg.label.toUpperCase()}</h2>
                    <div style={{flex:1,minWidth:40,height:1,background:"#f5c20033"}}/>
                    <span style={{color:"#555",fontSize:13,whiteSpace:"nowrap"}}>{lg.teams.length} times</span>
                  </div>
                  <div style={{background:"#151515",borderRadius:18,padding:"20px 16px",border:`1px solid ${GOLD}22`}}>
                    <div className="team-card-grid">
                      {lg.teams.map(team=>(
                        <div key={team.id} className="tc" style={{cursor:"pointer",textAlign:"center",width:80}}
                          onClick={()=>openTeam(team, lg.id)}>
                          <div className="tc-inner"><TeamCircle team={team} size={68}/></div>
                          <p style={{fontSize:10,color:"#bbb",marginTop:6,lineHeight:1.2,fontWeight:600}}>{team.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </>

          <footer style={{background:"#111",borderTop:`2px solid ${GOLD}33`,padding:"32px 24px",textAlign:"center"}}>
            <p style={{fontFamily:FF,fontSize:22,color:GOLD,letterSpacing:3,marginBottom:16}}>WINNING ELEVEN STORE</p>
            <div style={{maxWidth:480,margin:"0 auto"}}>
              <ContactBanner GOLD={GOLD} compact={false} centered />
            </div>
          </footer>
        </>
      )}

      {/* ── TEAM PRODUCTS VIEW ── */}
      {view==="store"&&selectedTeam&&(
        <TeamProductsView
          team={selectedTeam}
          images={getTeamImages(selectedTeam)}
          products={products}
          onBack={()=>setSelectedTeam(null)}
          onSelectProduct={p=>{setSelectedProduct(p);setView("product");}}
          GOLD={GOLD}
          FF={FF}
        />
      )}

      {/* ── PRODUCT DETAIL ── */}
      {view==="product"&&selectedProduct&&(
        <ProductDetail product={selectedProduct} onBack={()=>{setView("store");}} onAdd={addToCart} GOLD={GOLD} FF={FF}/>
      )}

      {/* ── ADMIN LOGIN ── */}
      {showAdmin&&view==="admin-login"&&(
        <AdminLogin FF={FF} GOLD={GOLD} onLogin={pwd=>{
          if(pwd===ADMIN_PWD){setAdminLoggedIn(true);setView("admin");toast$("Bem-vindo, admin! ✅");}
          else toast$("Senha incorreta ❌",true);
        }} onBack={()=>setView("store")}/>
      )}

      {/* ── ADMIN PANEL ── */}
      {showAdmin&&view==="admin"&&adminLoggedIn&&(
        <AdminPanel FF={FF} GOLD={GOLD} products={products} adminView={adminView} setAdminView={setAdminView}
          editingProduct={editingProduct} setEditingProduct={setEditingProduct}
          onSave={p=>{
            if(p.id&&products.find(x=>x.id===p.id)){save(products.map(x=>x.id===p.id?p:x));toast$("Atualizado! ✅");}
            else{save([...products,{...p,id:Date.now().toString()}]);toast$("Produto adicionado! ✅");}
            setAdminView("list");setEditingProduct(null);
          }}
          onDelete={p=>setConfirmDel(p)}
          onLogout={()=>{setAdminLoggedIn(false);setView("store");toast$("Sessão encerrada.");}}
        />
      )}

      {/* ── CART DRAWER ── */}
      {cartOpen&&(
        <>
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:200}} onClick={()=>setCartOpen(false)}/>
          <div className="cart-drawer" style={{borderLeft:`2px solid ${GOLD}44`}}>
            <div style={{padding:"18px 22px",borderBottom:`1px solid #1e1e1e`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <h2 style={{fontFamily:FF,fontSize:26,color:GOLD,letterSpacing:3}}>🛒 CARRINHO</h2>
              <button style={{background:"none",border:"none",color:"#888",cursor:"pointer",fontSize:22}} onClick={()=>setCartOpen(false)}>✕</button>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:16}}>
              {cart.length===0?(
                <div style={{textAlign:"center",padding:"60px 20px",color:"#555"}}>
                  <div style={{fontSize:52,marginBottom:12}}>🛒</div>
                  <p>Seu carrinho está vazio</p>
                </div>
              ):cart.map(item=>(
                <div key={`${item.id}-${item.size}`} style={{display:"flex",gap:12,padding:14,background:"#1a1a1a",borderRadius:12,marginBottom:10,border:`1px solid ${GOLD}22`}}>
                  <TeamCircle team={{color:item.teamColor||"#333",abbr:item.teamAbbr||"??"}} size={52}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:13,marginBottom:2,lineHeight:1.3}}>{item.name}</div>
                    <div style={{fontSize:11,color:"#666",marginBottom:4}}>{item.team} · Tam: {item.size} · Qtd: {item.qty}</div>
                    <div style={{fontSize:17,fontWeight:700,color:GOLD}}>{fmtBRL(item.price*item.qty)}</div>
                  </div>
                  <button style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:18,alignSelf:"flex-start"}} onClick={()=>setCart(c=>c.filter(i=>!(i.id===item.id&&i.size===item.size)))}>✕</button>
                </div>
              ))}
            </div>
            {cart.length>0&&(
              <div style={{padding:"18px 22px",borderTop:`1px solid #1e1e1e`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:16}}>
                  <span style={{color:"#888",fontSize:15}}>Total</span>
                  <span style={{fontFamily:FF,fontSize:30,color:GOLD,letterSpacing:1}}>{fmtBRL(cartTotal)}</span>
                </div>
                <button className="btn-g" style={{width:"100%",padding:15,fontSize:16,borderRadius:11}} onClick={finalizeViaWhatsApp}>
                  📱 FINALIZAR NO WHATSAPP
                </button>
                <p style={{textAlign:"center",fontSize:11,color:"#666",marginTop:8}}>Seu pedido será enviado para {STORE_CONTACT.whatsappDisplay}</p>
                <p style={{textAlign:"center",fontSize:11,color:"#444",marginTop:4}}>🚚 Entregas para todo o Brasil</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══ CATEGORY GALLERY ═══ */
function CategoryGalleryView({ category, images, products, onBack, onSelectProduct, GOLD, FF }) {
  const categoryProducts = products.filter(p => p.category === category.productCategory);
  const hasImages = images.length > 0;

  return (
    <div className="page-section" style={{animation:"fadeUp .3s ease"}}>
      <button className="btn-o" style={{marginBottom:24,padding:"8px 18px",fontSize:13}} onClick={onBack}>← Voltar</button>

      <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:32,padding:"24px 28px",background:"#151515",borderRadius:16,border:`1px solid ${GOLD}33`}}>
        <div style={{width:72,height:72,borderRadius:"50%",background:"#1a1a1a",border:`2px solid ${GOLD}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,flexShrink:0}}>👕</div>
        <div>
          <p style={{fontSize:12,letterSpacing:3,color:GOLD,fontWeight:700,marginBottom:4}}>COLEÇÃO</p>
          <h1 style={{fontFamily:FF,fontSize:44,letterSpacing:3,lineHeight:1}}>{category.label.toUpperCase()}</h1>
          {hasImages && <p style={{color:"#666",fontSize:14,marginTop:6}}>{images.length} foto{images.length!==1?"s":""}</p>}
        </div>
      </div>

      {hasImages ? (
        <>
          <PhotoGallery images={images} GOLD={GOLD} inquiryContext={{ section: "Categoria", name: category.label }}/>
          <div style={{marginTop:24}}>
            <ContactBanner GOLD={GOLD} compact={false} centered />
          </div>
        </>
      ) : (
        <div style={{textAlign:"center",padding:"56px 24px",background:"#151515",borderRadius:16,border:`1px dashed ${GOLD}44`,marginBottom:40}}>
          <div style={{fontSize:48,marginBottom:16}}>🖼️</div>
          <h3 style={{fontFamily:FF,fontSize:26,color:GOLD,letterSpacing:2,marginBottom:10}}>NENHUMA FOTO AINDA</h3>
          <p style={{color:"#888",fontSize:14,maxWidth:480,margin:"0 auto",lineHeight:1.6}}>
            Coloque imagens (.jpg, .png, .webp…) em{" "}
            <code style={{color:GOLD,background:"#222",padding:"2px 8px",borderRadius:6}}>
              public/categories/{category.folder}/
            </code>
            {" "}e salve — com <code style={{color:GOLD,background:"#222",padding:"2px 6px",borderRadius:6}}>npm run dev</code> rodando, a página atualiza sozinha.
          </p>
        </div>
      )}

      {categoryProducts.length > 0 && (
        <>
          <h2 style={{fontFamily:FF,fontSize:28,color:GOLD,letterSpacing:3,marginBottom:20}}>PRODUTOS</h2>
          <div className="product-grid">
            {categoryProducts.map(p => (
              <ProductCard key={p.id} product={p} onClick={() => onSelectProduct(p)} GOLD={GOLD} FF={FF}/>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══ TEAM PRODUCTS VIEW ═══ */
function TeamProductsView({ team, images, products, onBack, onSelectProduct, GOLD, FF }) {
  const teamProducts = products.filter(p=>p.teamId===team.id);
  const hasImages = images.length > 0;

  return (
    <div className="page-section" style={{animation:"fadeUp .3s ease"}}>
      <button className="btn-o" style={{marginBottom:24,padding:"8px 18px",fontSize:13}} onClick={onBack}>← Voltar</button>
      <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:32,padding:"20px 16px",background:"#151515",borderRadius:16,border:`1px solid ${GOLD}33`,flexWrap:"wrap"}}>
        <TeamCircle team={team} size={84} selected/>
        <div style={{flex:1,minWidth:200}}>
          <p style={{fontSize:12,letterSpacing:3,color:GOLD,fontWeight:700,marginBottom:4}}>COLEÇÃO OFICIAL</p>
          <h1 style={{fontFamily:FF,fontSize:"clamp(28px,6vw,44px)",letterSpacing:3,lineHeight:1}}>{team.name.toUpperCase()}</h1>
          <p style={{color:"#666",fontSize:14,marginTop:6}}>
            {hasImages && `${images.length} foto${images.length!==1?"s":""}`}
            {hasImages && teamProducts.length > 0 && " · "}
            {teamProducts.length > 0 && `${teamProducts.length} produto${teamProducts.length!==1?"s":""}`}
            {!hasImages && teamProducts.length === 0 && "Sem fotos nem produtos ainda"}
          </p>
        </div>
      </div>

      {hasImages && (
        <>
          <PhotoGallery images={images} label="FOTOS" GOLD={GOLD} inquiryContext={{ section: "Time", name: team.name }}/>
          <div style={{marginBottom:32}}>
            <ContactBanner GOLD={GOLD} compact={false} centered />
          </div>
        </>
      )}

      {teamProducts.length > 0 ? (
        <>
          {hasImages && <h2 style={{fontFamily:FF,fontSize:28,color:GOLD,letterSpacing:3,marginBottom:20}}>PRODUTOS</h2>}
          <div className="product-grid">
            {teamProducts.map(p=><ProductCard key={p.id} product={p} onClick={()=>onSelectProduct(p)} GOLD={GOLD} FF={FF}/>)}
          </div>
        </>
      ) : !hasImages ? (
        <div style={{textAlign:"center",padding:"80px 20px",background:"#151515",borderRadius:16,border:`1px solid #1e1e1e`}}>
          <div style={{marginBottom:20}}><TeamCircle team={team} size={80}/></div>
          <h3 style={{fontFamily:FF,fontSize:24,color:GOLD,letterSpacing:2,marginBottom:10}}>NENHUMA FOTO AINDA</h3>
          <p style={{color:"#555",fontSize:14,marginBottom:12}}>
            Coloque imagens em{" "}
            <code style={{color:GOLD,background:"#222",padding:"2px 8px",borderRadius:6}}>
              public/teams/{team.flat ? team.id : `${team.leaguePath}/${team.teamPath || team.id}`}/
            </code>
          </p>
          <p style={{color:"#444",fontSize:13}}>Coloque imagens na pasta do time em <code style={{color:GOLD}}>public/teams/</code></p>
        </div>
      ) : null}
    </div>
  );
}

/* ═══ PRODUCT CARD ═══ */
function ProductCard({ product, onClick, GOLD, FF }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const teamObj = catalogTeamForProduct(product.teamId);
  const disc = product.originalPrice?Math.round((1-product.price/product.originalPrice)*100):null;
  const inquiryContext = { section: "Produto", name: product.team, productName: product.name };
  return (
    <div onClick={onClick} style={{background:"#161616",borderRadius:14,overflow:"hidden",border:`1px solid #222`,cursor:"pointer",transition:"transform .2s,border-color .2s"}}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-5px)";e.currentTarget.style.borderColor=GOLD+"66";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.borderColor="#222";}}>
      <div style={{height:210,position:"relative",background:"#1a1a1a",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
        {product.image
          ?<>
            <button
              type="button"
              onClick={(e)=>{e.stopPropagation();openWhatsAppInquiry({ ...inquiryContext, imageIndex: 0 });}}
              style={{width:"100%",height:"100%",padding:0,border:"none",cursor:"pointer",display:"block",background:"none"}}
              aria-label="Comprar via WhatsApp"
            >
              <img src={product.image} alt={product.name} style={{width:"100%",height:"100%",objectFit:"cover",pointerEvents:"none"}}/>
            </button>
            <button
              type="button"
              title="Ampliar foto"
              onClick={(e)=>{e.stopPropagation();setLightboxOpen(true);}}
              style={{position:"absolute",top:8,right:8,background:"#000c",border:`1px solid ${GOLD}66`,color:GOLD,borderRadius:8,padding:"6px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}
            >
              🔍
            </button>
          </>
          :<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
            <TeamCircle team={teamObj} size={90} selected/>
            <span style={{color:"#444",fontSize:12,fontWeight:700,letterSpacing:2}}>{product.category?.toUpperCase()}</span>
          </div>
        }
        {product.badge&&<div style={{position:"absolute",top:12,left:12,background:product.badge==="Promoção"?"#ef4444":product.badge==="Novo"?GOLD:"#f59e0b",color:product.badge==="Novo"?"#000":"#fff",borderRadius:7,padding:"4px 12px",fontSize:11,fontWeight:700}}>{product.badge}</div>}
        {disc&&<div style={{position:"absolute",top:12,right:12,background:"#ef4444",color:"white",borderRadius:7,padding:"4px 10px",fontSize:11,fontWeight:700}}>-{disc}%</div>}
      </div>
      <div style={{padding:"14px 16px 16px"}}>
        <div style={{fontSize:11,color:GOLD,fontWeight:700,letterSpacing:1.5,marginBottom:5}}>{product.category?.toUpperCase()}</div>
        <h3 style={{fontSize:15,fontWeight:700,lineHeight:1.3,marginBottom:12,minHeight:38,overflow:"hidden"}}>{product.name}</h3>
        <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:10}}>
          <span style={{fontFamily:FF,fontSize:24,color:GOLD}}>{fmtBRL(product.price)}</span>
          {product.originalPrice&&<span style={{fontSize:12,color:"#555",textDecoration:"line-through"}}>{fmtBRL(product.originalPrice)}</span>}
        </div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {(product.sizes||[]).map(sz=><span key={sz} style={{background:"#222",border:"1px solid #2d2d2d",borderRadius:4,padding:"2px 7px",fontSize:10,color:"#888"}}>{sz}</span>)}
        </div>
      </div>
      {lightboxOpen && product.image && (
        <ImageLightbox
          images={[product.image]}
          index={0}
          onClose={()=>setLightboxOpen(false)}
          onChange={()=>{}}
          GOLD={GOLD}
          inquiryContext={inquiryContext}
        />
      )}
    </div>
  );
}

/* ═══ PRODUCT DETAIL ═══ */
function ProductDetail({ product, onBack, onAdd, GOLD, FF }) {
  const [sel,setSel]=useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const teamObj = catalogTeamForProduct(product.teamId);
  const inquiryContext = { section: "Produto", name: product.team, productName: product.name };
  return (
    <div className="page-section" style={{animation:"fadeUp .3s ease"}}>
      <button className="btn-o" style={{marginBottom:24,padding:"8px 18px",fontSize:13}} onClick={onBack}>← Voltar</button>
      <div className="product-detail-grid">
        <div style={{position:"relative",background:"#161616",borderRadius:18,aspectRatio:"1",border:`1px solid ${GOLD}33`,overflow:"hidden"}}>
          {product.image
            ?<>
              <button
                type="button"
                onClick={()=>openWhatsAppInquiry({ ...inquiryContext, imageIndex: 0 })}
                style={{width:"100%",height:"100%",padding:0,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",background:"none"}}
                aria-label="Comprar via WhatsApp"
              >
                <img src={product.image} alt={product.name} style={{width:"100%",height:"100%",objectFit:"cover",pointerEvents:"none"}}/>
              </button>
              <button
                type="button"
                title="Ampliar foto"
                onClick={()=>setLightboxOpen(true)}
                style={{position:"absolute",top:12,right:12,background:"#000c",border:`1px solid ${GOLD}66`,color:GOLD,borderRadius:8,padding:"6px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}
              >
                🔍 Ampliar
              </button>
            </>
            :<div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
              <TeamCircle team={teamObj} size={160} selected/>
              <span style={{color:"#555",fontSize:14,fontWeight:700,letterSpacing:2}}>{product.category?.toUpperCase()}</span>
            </div>
          }
        </div>
        <div>
          <div style={{fontSize:11,letterSpacing:3,color:GOLD,fontWeight:700,marginBottom:12}}>{product.team} · {product.category}</div>
          <h1 style={{fontFamily:FF,fontSize:"clamp(28px,6vw,40px)",lineHeight:1.1,marginBottom:20,letterSpacing:2}}>{product.name?.toUpperCase()}</h1>
          <div style={{display:"flex",alignItems:"baseline",gap:14,marginBottom:16}}>
            <span style={{fontFamily:FF,fontSize:44,color:GOLD,letterSpacing:1}}>{fmtBRL(product.price)}</span>
            {product.originalPrice&&<span style={{color:"#555",textDecoration:"line-through",fontSize:20}}>{fmtBRL(product.originalPrice)}</span>}
          </div>
          {product.originalPrice&&<div style={{display:"inline-block",background:"#ef444222",color:"#ef4444",border:"1px solid #ef444444",borderRadius:8,padding:"4px 12px",fontSize:13,fontWeight:700,marginBottom:20}}>{Math.round((1-product.price/product.originalPrice)*100)}% OFF</div>}
          <p style={{color:"#9ca3af",fontSize:15,lineHeight:1.7,marginBottom:28}}>{product.description||"Produto oficial do clube."}</p>
          <div style={{marginBottom:28}}>
            <p style={{fontSize:11,letterSpacing:2,color:"#888",fontWeight:700,marginBottom:12}}>TAMANHO {sel&&<span style={{color:GOLD}}>→ {sel}</span>}</p>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {(product.sizes||[]).map(sz=><button key={sz} className={`sz${sel===sz?" on":""}`} onClick={()=>setSel(sz)}>{sz}</button>)}
            </div>
          </div>
          <button className="btn-g" style={{width:"100%",padding:15,fontSize:17,borderRadius:12,opacity:sel?1:.5}} onClick={()=>{if(!sel){alert("Selecione um tamanho!");return;}onAdd({...product,teamColor:teamObj.color,teamAbbr:teamObj.abbr},sel);}}>
            🛒 ADICIONAR AO CARRINHO
          </button>
          <button
            type="button"
            className="btn-o"
            style={{width:"100%",padding:14,fontSize:15,borderRadius:12,marginTop:12}}
            onClick={()=>openWhatsAppInquiry({ ...inquiryContext, imageIndex: 0 })}
          >
            📱 COMPRAR PELO WHATSAPP
          </button>
          <div style={{display:"flex",gap:8,marginTop:12}}>
            {["🚚 Frete grátis acima de R$ 299","✅ Produto oficial licenciado"].map(t=>(
              <div key={t} style={{flex:1,background:"#1a1a1a",border:`1px solid ${GOLD}22`,borderRadius:10,padding:"9px 12px",fontSize:11,color:"#888",textAlign:"center"}}>{t}</div>
            ))}
          </div>
        </div>
      </div>
      {lightboxOpen && product.image && (
        <ImageLightbox
          images={[product.image]}
          index={0}
          onClose={()=>setLightboxOpen(false)}
          onChange={()=>{}}
          GOLD={GOLD}
          inquiryContext={inquiryContext}
        />
      )}
    </div>
  );
}

/* ═══ ADMIN LOGIN ═══ */
function AdminLogin({ onLogin, onBack, FF, GOLD }) {
  const [pwd,setPwd]=useState("");
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"calc(100vh - 68px)",padding:24,background:"#0f0f0f"}}>
      <div style={{background:"#161616",borderRadius:20,padding:"48px 44px",width:"100%",maxWidth:400,border:`1px solid ${GOLD}44`,animation:"fadeUp .3s ease"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:70,height:70,borderRadius:"50%",background:"#1a1a1a",border:`2px solid ${GOLD}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 16px"}}>🔐</div>
          <h2 style={{fontFamily:FF,fontSize:34,color:GOLD,letterSpacing:3,marginBottom:8}}>ÁREA ADMIN</h2>
          <p style={{color:"#555",fontSize:13}}>Senha padrão: <span style={{color:GOLD,fontWeight:700}}>admin123</span></p>
        </div>
        <label style={{fontSize:11,color:"#666",letterSpacing:2,display:"block",marginBottom:8}}>SENHA</label>
        <input className="inp" type="password" placeholder="Digite a senha..." value={pwd} onChange={e=>setPwd(e.target.value)} onKeyDown={e=>e.key==="Enter"&&onLogin(pwd)} style={{marginBottom:20}}/>
        <button className="btn-g" style={{width:"100%",padding:14,fontSize:16,marginBottom:12,borderRadius:11}} onClick={()=>onLogin(pwd)}>ENTRAR</button>
        <button className="btn-o" style={{width:"100%",padding:12,fontSize:14,borderRadius:11}} onClick={onBack}>Cancelar</button>
      </div>
    </div>
  );
}

/* ═══ ADMIN PANEL ═══ */
function AdminPanel({ FF, GOLD, products, adminView, setAdminView, editingProduct, setEditingProduct, onSave, onDelete, onLogout }) {
  const avgPrice = products.length?products.reduce((s,p)=>s+p.price,0)/products.length:0;
  const uniqTeams = [...new Set(products.map(p=>p.teamId))].length;
  const stats = [
    {icon:"👕",label:"Produtos",val:products.length},
    {icon:"⚽",label:"Times com produtos",val:uniqTeams},
    {icon:"💰",label:"Preço médio",val:fmtBRL(avgPrice)},
    {icon:"📦",label:"Categorias",val:[...new Set(products.map(p=>p.category))].length},
  ];
  return (
    <div className="page-section">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28,flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{fontFamily:FF,fontSize:40,color:GOLD,letterSpacing:3}}>⚙ PAINEL ADMIN</h1>
          <p style={{color:"#555",fontSize:14,marginTop:4}}>Gerencie produtos de todos os times</p>
        </div>
        <button className="btn-d" onClick={onLogout}>Sair</button>
      </div>
      <div className="admin-stats-grid" style={{marginBottom:28}}>
        {stats.map(s=>(
          <div key={s.label} style={{background:"#161616",borderRadius:14,padding:"20px 22px",border:`1px solid ${GOLD}22`}}>
            <div style={{fontSize:28,marginBottom:8}}>{s.icon}</div>
            <div style={{fontFamily:FF,fontSize:30,color:GOLD,letterSpacing:1}}>{s.val}</div>
            <div style={{fontSize:12,color:"#666",marginTop:4}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:10,marginBottom:24}}>
        <button className={adminView==="list"?"btn-g":"btn-o"} style={{padding:"10px 22px"}} onClick={()=>{setAdminView("list");setEditingProduct(null);}}>📋 Produtos</button>
        <button className={adminView==="add"?"btn-g":"btn-o"} style={{padding:"10px 22px"}} onClick={()=>{setAdminView("add");setEditingProduct(null);}}>+ Adicionar</button>
      </div>

      {adminView==="list"&&(
        <div>
          {products.length===0?(
            <div style={{textAlign:"center",padding:"70px 20px",color:"#555",background:"#161616",borderRadius:16,border:`1px solid #1e1e1e`}}>
              <div style={{fontSize:52,marginBottom:14}}>👕</div>
              <p>Nenhum produto cadastrado ainda.</p>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {products.map(p=>{
                const teamObj=catalogTeamForProduct(p.teamId);
                return (
                  <div key={p.id} style={{background:"#161616",borderRadius:12,padding:"13px 18px",border:`1px solid #1e1e1e`,display:"flex",alignItems:"center",gap:14}}>
                    <TeamCircle team={teamObj} size={52}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:14,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                      <div style={{fontSize:11,color:GOLD,fontWeight:600}}>{p.team} · {p.category}</div>
                    </div>
                    <div style={{fontFamily:FF,fontSize:20,color:GOLD,whiteSpace:"nowrap"}}>{fmtBRL(p.price)}</div>
                    <div style={{display:"flex",gap:8}}>
                      <button className="btn-o" style={{padding:"6px 14px",fontSize:12}} onClick={()=>{setEditingProduct(p);setAdminView("edit");}}>✏️</button>
                      <button className="btn-d" style={{padding:"6px 14px",fontSize:12}} onClick={()=>onDelete(p)}>🗑️</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {(adminView==="add"||adminView==="edit")&&(
        <ProductForm FF={FF} GOLD={GOLD} product={editingProduct}
          onSave={onSave} onCancel={()=>{setAdminView("list");setEditingProduct(null);}}/>
      )}
    </div>
  );
}

/* ═══ PRODUCT FORM ═══ */
function ProductForm({ FF, GOLD, product, onSave, onCancel }) {
  const allTeams = CATALOG_LEAGUES.flatMap((lg) =>
    lg.teams.map((t) => ({ ...t, leagueId: lg.id, leagueName: lg.label }))
  );
  const defaultTeam = allTeams[0] || { id: "flamengo", name: "Flamengo" };
  const [f,setF]=useState({
    name:product?.name||"",
    teamId:product?.teamId||defaultTeam.id,
    team:product?.team||defaultTeam.name,
    price:product?.price||"",
    originalPrice:product?.originalPrice||"",
    category:product?.category||"Camisa Titular",
    description:product?.description||"",
    sizes:product?.sizes||["M","G"],
    image:product?.image||null,
    badge:product?.badge||"",
    id:product?.id||null,
  });
  const fileRef=useRef();
  const toggleSz=sz=>setF(p=>({...p,sizes:p.sizes.includes(sz)?p.sizes.filter(s=>s!==sz):[...p.sizes,sz]}));
  const selTeam=allTeams.find(t=>t.id===f.teamId)||defaultTeam;

  return (
    <div style={{background:"#161616",borderRadius:18,padding:"30px 32px",border:`1px solid ${GOLD}33`,animation:"fadeUp .25s ease"}}>
      <h3 style={{fontFamily:FF,fontSize:28,color:GOLD,letterSpacing:2,marginBottom:26}}>{product?"✏️ EDITAR PRODUTO":"+ NOVO PRODUTO"}</h3>
      <div className="admin-form-grid">
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div>
            <label style={{fontSize:11,letterSpacing:2,color:"#666",display:"block",marginBottom:7}}>TIME *</label>
            <select className="inp" value={f.teamId} onChange={e=>{const t=allTeams.find(x=>x.id===e.target.value);setF(p=>({...p,teamId:e.target.value,team:t?.name||""}));}}>
              {CATALOG_LEAGUES.map(lg=>(
                <optgroup key={lg.id} label={`${lg.icon} ${lg.label}`}>
                  {lg.teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label style={{fontSize:11,letterSpacing:2,color:"#666",display:"block",marginBottom:7}}>NOME DO PRODUTO *</label>
            <input className="inp" placeholder="Ex: Camisa Flamengo Titular 24/25" value={f.name} onChange={e=>setF(p=>({...p,name:e.target.value}))}/>
          </div>
          <div>
            <label style={{fontSize:11,letterSpacing:2,color:"#666",display:"block",marginBottom:7}}>CATEGORIA</label>
            <select className="inp" value={f.category} onChange={e=>setF(p=>({...p,category:e.target.value}))}>
              {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,140px),1fr))",gap:12}}>
            <div>
              <label style={{fontSize:11,letterSpacing:2,color:"#666",display:"block",marginBottom:7}}>PREÇO (R$) *</label>
              <input className="inp" type="number" step="0.01" placeholder="299.90" value={f.price} onChange={e=>setF(p=>({...p,price:e.target.value}))}/>
            </div>
            <div>
              <label style={{fontSize:11,letterSpacing:2,color:"#666",display:"block",marginBottom:7}}>PREÇO ORIGINAL</label>
              <input className="inp" type="number" step="0.01" placeholder="349.90" value={f.originalPrice} onChange={e=>setF(p=>({...p,originalPrice:e.target.value}))}/>
            </div>
          </div>
          <div>
            <label style={{fontSize:11,letterSpacing:2,color:"#666",display:"block",marginBottom:7}}>BADGE</label>
            <select className="inp" value={f.badge} onChange={e=>setF(p=>({...p,badge:e.target.value}))}>
              <option value="">Sem badge</option>
              {["Novo","Promoção","Destaque","Retrô","Lançamento"].map(b=><option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div>
            <label style={{fontSize:11,letterSpacing:2,color:"#666",display:"block",marginBottom:7}}>DESCRIÇÃO</label>
            <textarea className="inp" style={{height:90,resize:"vertical"}} placeholder="Descreva o produto..." value={f.description} onChange={e=>setF(p=>({...p,description:e.target.value}))}/>
          </div>
          <div>
            <label style={{fontSize:11,letterSpacing:2,color:"#666",display:"block",marginBottom:10}}>TAMANHOS</label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {SIZES.map(sz=><button key={sz} type="button" className={`sz${f.sizes.includes(sz)?" on":""}`} onClick={()=>toggleSz(sz)}>{sz}</button>)}
            </div>
          </div>
          <div>
            <label style={{fontSize:11,letterSpacing:2,color:"#666",display:"block",marginBottom:10}}>FOTO DO PRODUTO</label>
            <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{
              const file=e.target.files[0];if(!file)return;
              const r=new FileReader();r.onload=ev=>setF(p=>({...p,image:ev.target.result}));r.readAsDataURL(file);
            }}/>
            <button type="button" className="btn-o" style={{width:"100%",padding:10,marginBottom:f.image?12:0}} onClick={()=>fileRef.current.click()}>
              📷 {f.image?"Trocar Imagem":"Selecionar Foto"}
            </button>
            {f.image&&(
              <div style={{position:"relative",borderRadius:10,overflow:"hidden",height:130}}>
                <img src={f.image} alt="preview" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                <button type="button" onClick={()=>setF(p=>({...p,image:null}))} style={{position:"absolute",top:8,right:8,background:"#000a",border:"none",borderRadius:6,color:"white",cursor:"pointer",padding:"3px 10px",fontSize:12,fontWeight:700}}>✕</button>
              </div>
            )}
          </div>
          {/* Preview */}
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:"#1a1a1a",borderRadius:10,border:`1px solid ${GOLD}22`}}>
            <TeamCircle team={selTeam||{color:"#333",abbr:"??"}} size={48}/>
            <div>
              <div style={{fontSize:12,color:GOLD,fontWeight:700}}>{selTeam?.name||"Time"}</div>
              <div style={{fontSize:11,color:"#555"}}>{f.category}</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{display:"flex",gap:12,marginTop:26}}>
        <button className="btn-g" style={{flex:1,padding:14,fontSize:16,borderRadius:11}} onClick={()=>{
          if(!f.name||!f.price){alert("Preencha nome e preço!");return;}
          onSave({...f,price:parseFloat(f.price),originalPrice:f.originalPrice?parseFloat(f.originalPrice):null,badge:f.badge||null});
        }}>{product?"✅ Salvar Alterações":"✅ Adicionar Produto"}</button>
        <button className="btn-o" style={{padding:"14px 26px",borderRadius:11}} onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}
