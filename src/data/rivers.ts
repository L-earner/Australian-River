// Curated display network for Australia.
// Geometry is deliberately simplified; official live gauge locations are loaded
// by the server from BoM Geofabric V3.3.
// All polylines are oriented UPSTREAM -> DOWNSTREAM so flow animation follows the array order.

export type ClimateZone =
  | "tropical"
  | "subtropical-east"
  | "temperate"
  | "mediterranean"
  | "arid";

export interface River {
  id: string;
  name: string;
  state: string;
  catchment: string;
  zone: ClimateZone;
  /** typical mean flow magnitude, ML/day */
  scale: number;
  /** visual weight 1..5 */
  width: number;
  ephemeral?: boolean;
  /** [lon, lat] from source to mouth */
  points: [number, number][];
}

export const RIVERS: River[] = [
  // ── Murray–Darling Basin ──────────────────────────────────────────────
  { id: "murray", name: "Murray River", state: "NSW/VIC/SA", catchment: "Murray", zone: "temperate", scale: 20000, width: 5,
    points: [[147.9,-36.8],[148.3,-36.4],[147.3,-36.0],[146.92,-36.08],[146.3,-36.0],[145.4,-36.15],[144.75,-36.15],[144.1,-35.9],[143.56,-35.34],[142.9,-34.7],[142.16,-34.19],[141.92,-34.1],[141.0,-34.0],[140.75,-34.17],[140.2,-34.3],[139.8,-34.35],[139.7,-34.0],[139.4,-34.6],[139.27,-35.12],[139.1,-35.4],[138.95,-35.5],[138.78,-35.5]] },
  { id: "darling", name: "Darling River", state: "NSW", catchment: "Darling", zone: "arid", scale: 3000, width: 5,
    points: [[146.86,-29.96],[146.4,-29.9],[145.94,-30.09],[145.4,-30.2],[145.12,-30.53],[144.42,-30.93],[144.0,-31.2],[143.38,-31.56],[142.8,-32.0],[142.42,-32.39],[142.35,-32.9],[142.57,-33.38],[142.3,-33.9],[141.92,-34.1]] },
  { id: "barwon", name: "Barwon River", state: "NSW", catchment: "Barwon", zone: "arid", scale: 2500, width: 4,
    points: [[148.99,-28.97],[148.58,-29.55],[148.12,-30.02],[147.9,-30.1],[147.3,-30.0],[146.86,-29.96]] },
  { id: "macintyre", name: "Macintyre River", state: "QLD/NSW", catchment: "Border Rivers", zone: "subtropical-east", scale: 1200, width: 3,
    points: [[151.17,-28.85],[150.31,-28.55],[149.7,-28.7],[148.99,-28.97]] },
  { id: "namoi", name: "Namoi River", state: "NSW", catchment: "Namoi", zone: "subtropical-east", scale: 2000, width: 3,
    points: [[151.3,-31.5],[150.93,-31.09],[150.25,-30.98],[149.9,-30.6],[149.78,-30.32],[149.44,-30.2],[149.0,-30.0],[148.12,-30.02]] },
  { id: "gwydir", name: "Gwydir River", state: "NSW", catchment: "Gwydir", zone: "subtropical-east", scale: 1500, width: 3,
    points: [[151.67,-30.2],[151.0,-29.9],[150.35,-29.58],[149.84,-29.46],[149.4,-29.5],[148.9,-29.6],[148.6,-29.5]] },
  { id: "macquarie", name: "Macquarie River", state: "NSW", catchment: "Macquarie", zone: "temperate", scale: 2500, width: 3,
    points: [[149.58,-33.42],[149.1,-32.9],[148.95,-32.55],[148.6,-32.25],[148.24,-32.23],[147.84,-31.7],[147.6,-31.2],[147.6,-30.9],[147.5,-30.5],[147.3,-30.05]] },
  { id: "lachlan", name: "Lachlan River", state: "NSW", catchment: "Lachlan", zone: "temperate", scale: 3000, width: 4,
    points: [[149.7,-34.6],[149.47,-34.46],[148.68,-33.84],[148.01,-33.39],[147.15,-33.09],[146.4,-33.2],[145.53,-33.48],[144.9,-34.05],[144.1,-34.3],[143.6,-34.6],[143.7,-34.7]] },
  { id: "murrumbidgee", name: "Murrumbidgee River", state: "NSW/ACT", catchment: "Murrumbidgee", zone: "temperate", scale: 8000, width: 5,
    points: [[148.5,-35.9],[148.2,-35.55],[147.85,-35.3],[148.1,-35.05],[147.36,-35.11],[146.9,-34.9],[146.55,-34.75],[146.4,-34.55],[146.0,-34.57],[144.85,-34.5],[144.2,-34.4],[143.56,-34.65],[143.1,-34.5],[142.9,-34.65]] },
  { id: "goulburn", name: "Goulburn River", state: "VIC", catchment: "Goulburn", zone: "temperate", scale: 4000, width: 4,
    points: [[145.6,-37.3],[145.42,-37.21],[145.13,-37.03],[145.15,-36.78],[145.4,-36.38],[144.85,-36.12]] },
  { id: "ovens", name: "Ovens River", state: "VIC", catchment: "Ovens", zone: "temperate", scale: 2500, width: 3,
    points: [[146.98,-36.73],[146.72,-36.56],[146.31,-36.36],[146.1,-36.1],[146.0,-36.02]] },
  { id: "mitta", name: "Mitta Mitta River", state: "VIC", catchment: "Upper Murray", zone: "temperate", scale: 1800, width: 3,
    points: [[147.4,-36.6],[147.2,-36.35],[147.18,-36.22],[147.05,-36.1]] },
  { id: "kiewa", name: "Kiewa River", state: "VIC", catchment: "Kiewa", zone: "temperate", scale: 1200, width: 2,
    points: [[147.2,-36.8],[147.0,-36.4],[146.95,-36.1]] },
  { id: "snowy", name: "Snowy River", state: "NSW/VIC", catchment: "Snowy", zone: "temperate", scale: 3000, width: 3,
    points: [[148.4,-36.45],[148.62,-36.41],[148.83,-36.5],[148.6,-36.9],[148.5,-37.2],[148.45,-37.7],[148.55,-37.8]] },
  { id: "loddon", name: "Loddon River", state: "VIC", catchment: "Loddon", zone: "temperate", scale: 800, width: 2,
    points: [[144.1,-37.4],[144.22,-37.07],[144.0,-36.8],[143.95,-36.6],[143.9,-36.2],[143.92,-35.73],[143.9,-35.5]] },
  { id: "campaspe", name: "Campaspe River", state: "VIC", catchment: "Campaspe", zone: "temperate", scale: 700, width: 2,
    points: [[144.6,-37.3],[144.45,-37.25],[144.6,-36.8],[144.7,-36.36],[144.75,-36.14]] },
  { id: "wimmera", name: "Wimmera River", state: "VIC", catchment: "Wimmera", zone: "temperate", scale: 500, width: 2,
    points: [[143.1,-37.0],[142.78,-37.06],[142.2,-36.71],[142.03,-36.46],[141.98,-36.14],[141.88,-36.05]] },
  { id: "glenelg", name: "Glenelg River", state: "VIC", catchment: "Glenelg", zone: "temperate", scale: 800, width: 2,
    points: [[142.3,-37.3],[141.4,-37.58],[141.2,-37.8],[141.3,-37.92],[141.01,-38.05]] },
];

// ── Victoria & NSW coastal ─────────────────────────────────────────────
RIVERS.push(
  { id: "yarra", name: "Yarra River", state: "VIC", catchment: "Port Phillip", zone: "temperate", scale: 1200, width: 2,
    points: [[146.0,-37.7],[145.6,-37.7],[145.2,-37.73],[145.0,-37.8],[144.9,-37.85]] },
  { id: "latrobe", name: "Latrobe River", state: "VIC", catchment: "Gippsland", zone: "temperate", scale: 1500, width: 3,
    points: [[146.3,-37.85],[146.5,-38.0],[146.53,-38.2],[147.07,-38.1],[147.4,-38.0]] },
  { id: "mitchell-vic", name: "Mitchell River (VIC)", state: "VIC", catchment: "Gippsland", zone: "temperate", scale: 900, width: 2,
    points: [[147.2,-37.3],[147.61,-37.83],[147.7,-37.95]] },
  { id: "thomson-vic", name: "Thomson River (VIC)", state: "VIC", catchment: "Gippsland", zone: "temperate", scale: 1200, width: 2,
    points: [[146.5,-37.8],[146.7,-38.0],[146.9,-38.15]] },
  { id: "hunter", name: "Hunter River", state: "NSW", catchment: "Hunter", zone: "subtropical-east", scale: 1500, width: 3,
    points: [[151.3,-31.9],[150.9,-32.25],[151.17,-32.57],[151.55,-32.73],[151.79,-32.93]] },
  { id: "hawkesbury", name: "Hawkesbury–Nepean River", state: "NSW", catchment: "Hawkesbury–Nepean", zone: "subtropical-east", scale: 2500, width: 3,
    points: [[150.6,-34.3],[150.7,-34.05],[150.7,-33.75],[150.82,-33.6],[151.0,-33.5],[151.2,-33.55],[151.3,-33.55]] },
  { id: "shoalhaven", name: "Shoalhaven River", state: "NSW", catchment: "Shoalhaven", zone: "subtropical-east", scale: 1800, width: 2,
    points: [[149.9,-35.4],[150.2,-35.0],[150.6,-34.87],[150.75,-34.85]] },
  { id: "clarence", name: "Clarence River", state: "NSW", catchment: "Clarence", zone: "subtropical-east", scale: 5000, width: 4,
    points: [[152.3,-28.6],[152.57,-28.9],[152.7,-29.2],[152.94,-29.69],[153.1,-29.7],[153.35,-29.43]] },
  { id: "richmond", name: "Richmond River", state: "NSW", catchment: "Richmond", zone: "subtropical-east", scale: 2000, width: 3,
    points: [[153.0,-28.62],[153.05,-28.86],[153.28,-28.81],[153.28,-28.99],[153.57,-28.87]] },
  { id: "macleay", name: "Macleay River", state: "NSW", catchment: "Macleay", zone: "subtropical-east", scale: 1800, width: 3,
    points: [[151.9,-30.9],[152.2,-30.8],[152.5,-30.9],[152.83,-31.08],[153.05,-31.05]] },
  { id: "manning", name: "Manning River", state: "NSW", catchment: "Manning", zone: "subtropical-east", scale: 1200, width: 2,
    points: [[151.9,-31.6],[152.37,-31.87],[152.47,-31.9],[152.52,-31.9]] },
  { id: "hastings", name: "Hastings River", state: "NSW", catchment: "Hastings", zone: "subtropical-east", scale: 800, width: 2,
    points: [[152.3,-31.2],[152.73,-31.46],[152.9,-31.43]] },
  { id: "tweed", name: "Tweed River", state: "NSW", catchment: "Tweed", zone: "subtropical-east", scale: 700, width: 2,
    points: [[153.2,-28.3],[153.39,-28.33],[153.55,-28.2]] },
  { id: "bellinger", name: "Bellinger River", state: "NSW", catchment: "Bellinger", zone: "subtropical-east", scale: 600, width: 2,
    points: [[152.6,-30.3],[152.9,-30.45],[153.0,-30.5]] },
);

// ── Queensland ──────────────────────────────────────────────────────────
RIVERS.push(
  { id: "condamine-balonne", name: "Condamine–Balonne River", state: "QLD", catchment: "Condamine–Balonne", zone: "subtropical-east", scale: 2200, width: 4,
    points: [[152.3,-28.2],[152.03,-28.22],[151.6,-27.9],[151.26,-27.18],[150.9,-27.1],[150.13,-26.93],[149.07,-27.15],[148.7,-27.6],[148.58,-28.03],[148.3,-28.5],[148.23,-28.58],[148.1,-28.9],[148.0,-29.4]] },
  { id: "moonie", name: "Moonie River", state: "QLD", catchment: "Moonie", zone: "subtropical-east", scale: 500, width: 2,
    points: [[150.3,-27.9],[149.4,-28.2],[148.83,-28.36],[148.5,-28.9],[148.4,-29.2]] },
  { id: "brisbane", name: "Brisbane River", state: "QLD", catchment: "Brisbane", zone: "subtropical-east", scale: 1500, width: 3,
    points: [[152.3,-27.2],[152.6,-27.4],[152.75,-27.6],[152.9,-27.5],[153.03,-27.47],[153.15,-27.4]] },
  { id: "logan", name: "Logan River", state: "QLD", catchment: "Logan–Albert", zone: "subtropical-east", scale: 500, width: 2,
    points: [[153.0,-27.9],[152.9,-27.7],[153.2,-27.7]] },
  { id: "mary", name: "Mary River (QLD)", state: "QLD", catchment: "Mary", zone: "subtropical-east", scale: 1500, width: 2,
    points: [[152.85,-26.75],[152.85,-26.5],[152.67,-26.19],[152.75,-25.8],[152.7,-25.53],[152.8,-25.4]] },
  { id: "burnett", name: "Burnett River", state: "QLD", catchment: "Burnett", zone: "subtropical-east", scale: 2500, width: 3,
    points: [[151.7,-25.7],[151.3,-25.6],[151.6,-25.63],[151.9,-25.5],[152.3,-25.1],[152.35,-24.87],[152.4,-24.77]] },
  { id: "pioneer", name: "Pioneer River", state: "QLD", catchment: "Pioneer", zone: "subtropical-east", scale: 700, width: 2,
    points: [[148.9,-21.3],[149.1,-21.2],[149.2,-21.14]] },
  { id: "proserpine", name: "Proserpine River", state: "QLD", catchment: "Proserpine", zone: "subtropical-east", scale: 500, width: 2,
    points: [[148.4,-20.4],[148.6,-20.4]] },
  { id: "burdekin", name: "Burdekin River", state: "QLD", catchment: "Burdekin", zone: "tropical", scale: 9000, width: 5,
    points: [[145.9,-19.0],[146.0,-19.5],[146.3,-20.3],[146.2,-20.65],[146.5,-20.8],[147.0,-20.0],[147.2,-19.8],[147.4,-19.58],[147.55,-19.65]] },
  { id: "fitzroy-qld", name: "Fitzroy River (QLD)", state: "QLD", catchment: "Fitzroy", zone: "subtropical-east", scale: 8000, width: 5,
    points: [[149.7,-23.6],[149.9,-23.4],[150.51,-23.38],[150.7,-23.3],[150.85,-23.4]] },
  { id: "dawson", name: "Dawson River", state: "QLD", catchment: "Fitzroy", zone: "subtropical-east", scale: 2000, width: 3,
    points: [[150.1,-25.6],[150.08,-24.95],[149.97,-24.57],[149.81,-24.18],[149.75,-23.65]] },
  { id: "mackenzie", name: "Mackenzie River", state: "QLD", catchment: "Fitzroy", zone: "subtropical-east", scale: 2500, width: 3,
    points: [[147.6,-22.4],[148.2,-23.0],[148.55,-23.6],[149.4,-23.65],[149.7,-23.6]] },
  { id: "herbert", name: "Herbert River", state: "QLD", catchment: "Herbert", zone: "tropical", scale: 2500, width: 3,
    points: [[145.5,-18.5],[145.9,-18.5],[146.16,-18.65],[146.33,-18.53]] },
  { id: "tully", name: "Tully River", state: "QLD", catchment: "Tully", zone: "tropical", scale: 1500, width: 2,
    points: [[145.6,-17.9],[145.92,-17.93],[146.0,-17.93]] },
  { id: "johnstone", name: "Johnstone River", state: "QLD", catchment: "Johnstone", zone: "tropical", scale: 1800, width: 2,
    points: [[145.8,-17.6],[146.0,-17.5],[146.03,-17.52]] },
  { id: "barron", name: "Barron River", state: "QLD", catchment: "Barron", zone: "tropical", scale: 800, width: 2,
    points: [[145.4,-17.25],[145.6,-17.1],[145.7,-16.9],[145.75,-16.85]] },
  { id: "daintree", name: "Daintree River", state: "QLD", catchment: "Daintree", zone: "tropical", scale: 500, width: 2,
    points: [[145.3,-16.25],[145.45,-16.28]] },
  { id: "endeavour", name: "Endeavour River", state: "QLD", catchment: "Endeavour", zone: "tropical", scale: 300, width: 1,
    points: [[145.2,-15.5],[145.25,-15.45]] },
  { id: "mitchell-qld", name: "Mitchell River (QLD)", state: "QLD", catchment: "Mitchell", zone: "tropical", scale: 6000, width: 4,
    points: [[145.4,-16.9],[144.8,-16.5],[143.8,-16.4],[142.6,-15.9],[141.8,-15.5],[141.6,-15.3]] },
  { id: "gilbert", name: "Gilbert River", state: "QLD", catchment: "Gilbert", zone: "tropical", scale: 3000, width: 3,
    points: [[143.8,-18.9],[143.4,-18.3],[142.9,-18.0],[142.24,-18.2],[141.8,-17.8],[141.4,-17.3]] },
  { id: "flinders-qld", name: "Flinders River (QLD)", state: "QLD", catchment: "Flinders", zone: "tropical", scale: 4000, width: 4,
    points: [[143.2,-19.3],[144.2,-20.85],[143.5,-20.7],[143.14,-20.73],[142.0,-19.8],[141.5,-19.0],[141.08,-17.67],[140.85,-17.55]] },
  { id: "cloncurry", name: "Cloncurry River", state: "QLD", catchment: "Cloncurry", zone: "tropical", scale: 800, width: 2,
    points: [[140.5,-20.9],[140.5,-20.7],[140.3,-19.5],[141.2,-18.2]] },
  { id: "leichhardt", name: "Leichhardt River", state: "QLD", catchment: "Leichhardt", zone: "tropical", scale: 1000, width: 2,
    points: [[139.5,-20.8],[139.6,-19.5],[139.8,-18.2],[139.9,-17.6]] },
  { id: "nicholson", name: "Nicholson River", state: "QLD/NT", catchment: "Nicholson", zone: "tropical", scale: 1500, width: 2,
    points: [[137.9,-19.2],[138.5,-18.3],[139.4,-17.8],[139.6,-17.7]] },
  { id: "norman", name: "Norman River", state: "QLD", catchment: "Norman", zone: "tropical", scale: 2000, width: 3,
    points: [[143.5,-19.3],[142.5,-18.5],[141.5,-17.9],[141.0,-17.7],[140.84,-17.49]] },
  { id: "archer", name: "Archer River", state: "QLD", catchment: "Archer", zone: "tropical", scale: 800, width: 2,
    points: [[142.9,-13.4],[141.9,-13.4]] },
  { id: "wenlock", name: "Wenlock River", state: "QLD", catchment: "Wenlock", zone: "tropical", scale: 500, width: 1,
    points: [[142.6,-12.8],[141.95,-12.7]] },
  { id: "jardine", name: "Jardine River", state: "QLD", catchment: "Jardine", zone: "tropical", scale: 400, width: 1,
    points: [[142.7,-11.2],[142.2,-11.1]] },
);

// ── Channel Country & interior ──────────────────────────────────────────
RIVERS.push(
  { id: "cooper", name: "Cooper Creek", state: "QLD/SA", catchment: "Cooper Creek", zone: "arid", scale: 5000, width: 4, ephemeral: true,
    points: [[142.65,-25.42],[141.8,-25.6],[141.0,-26.0],[140.5,-26.5],[140.4,-27.0],[140.73,-27.7],[139.9,-27.8],[138.5,-28.1],[137.8,-28.5]] },
  { id: "barcoo", name: "Barcoo River", state: "QLD", catchment: "Cooper Creek", zone: "arid", scale: 1500, width: 3, ephemeral: true,
    points: [[146.2,-23.6],[145.47,-24.42],[144.9,-24.3],[144.43,-24.26],[143.8,-24.4],[143.2,-24.9],[142.65,-25.42]] },
  { id: "thomson", name: "Thomson River (QLD)", state: "QLD", catchment: "Cooper Creek", zone: "arid", scale: 1500, width: 3, ephemeral: true,
    points: [[145.9,-23.3],[144.25,-23.45],[143.8,-23.8],[143.3,-24.35],[143.07,-24.83],[142.65,-25.42]] },
  { id: "diamantina", name: "Diamantina River", state: "QLD/SA", catchment: "Diamantina", zone: "arid", scale: 2500, width: 3, ephemeral: true,
    points: [[143.4,-21.7],[143.04,-22.39],[142.5,-22.8],[141.7,-23.3],[141.2,-23.8],[140.4,-24.6],[139.6,-25.3],[139.35,-25.9],[139.3,-26.2],[138.7,-27.0],[138.0,-28.2]] },
  { id: "georgina", name: "Georgina River", state: "NT/QLD", catchment: "Georgina", zone: "arid", scale: 2000, width: 3, ephemeral: true,
    points: [[138.1,-19.9],[138.3,-21.0],[138.3,-21.6],[138.8,-22.8],[139.4,-24.1],[139.47,-24.35],[139.2,-25.3],[138.6,-26.5],[138.0,-27.5],[137.7,-28.1]] },
  { id: "finke", name: "Finke River", state: "NT/SA", catchment: "Finke", zone: "arid", scale: 1000, width: 2, ephemeral: true,
    points: [[132.6,-24.6],[133.2,-24.9],[134.0,-25.3],[134.6,-25.7],[135.5,-26.2],[136.4,-26.9],[136.8,-27.3]] },
  { id: "todd", name: "Todd River", state: "NT", catchment: "Todd", zone: "arid", scale: 200, width: 1, ephemeral: true,
    points: [[133.4,-24.0],[133.87,-23.7],[134.2,-23.4],[134.5,-23.1]] },
);

// ── Northern Territory ──────────────────────────────────────────────────
RIVERS.push(
  { id: "daly", name: "Daly River", state: "NT", catchment: "Daly", zone: "tropical", scale: 3500, width: 3,
    points: [[131.6,-14.9],[131.8,-14.2],[130.9,-13.9],[130.5,-13.6],[130.3,-13.55]] },
  { id: "katherine", name: "Katherine River", state: "NT", catchment: "Daly", zone: "tropical", scale: 1200, width: 2,
    points: [[132.5,-14.9],[132.26,-14.47],[131.9,-14.4],[131.6,-14.3]] },
  { id: "victoria-nt", name: "Victoria River", state: "NT", catchment: "Victoria", zone: "tropical", scale: 2500, width: 3,
    points: [[131.0,-16.5],[130.8,-15.8],[130.48,-15.65],[130.0,-15.3],[129.7,-15.1],[129.55,-14.95]] },
  { id: "roper", name: "Roper River", state: "NT", catchment: "Roper", zone: "tropical", scale: 2000, width: 3,
    points: [[133.07,-14.93],[133.8,-14.8],[134.53,-14.93],[135.2,-14.9],[135.6,-14.85]] },
  { id: "mcarthur", name: "McArthur River", state: "NT", catchment: "McArthur", zone: "tropical", scale: 1200, width: 2,
    points: [[135.7,-16.9],[136.2,-16.4],[136.3,-16.07],[136.6,-15.9]] },
  { id: "adelaide-nt", name: "Adelaide River", state: "NT", catchment: "Adelaide", zone: "tropical", scale: 700, width: 2,
    points: [[131.1,-13.3],[131.2,-12.9],[131.6,-12.5],[131.8,-12.3]] },
  { id: "south-alligator", name: "South Alligator River", state: "NT", catchment: "South Alligator", zone: "tropical", scale: 600, width: 2,
    points: [[132.5,-13.0],[132.5,-12.6],[132.4,-12.2]] },
  { id: "east-alligator", name: "East Alligator River", state: "NT", catchment: "East Alligator", zone: "tropical", scale: 600, width: 2,
    points: [[132.9,-12.9],[133.0,-12.5],[132.9,-12.15]] },
);

// ── Western Australia ───────────────────────────────────────────────────
RIVERS.push(
  { id: "ord", name: "Ord River", state: "WA/NT", catchment: "Ord", zone: "tropical", scale: 6000, width: 4,
    points: [[128.9,-16.9],[128.7,-16.4],[128.74,-15.77],[128.5,-15.3],[128.3,-14.9]] },
  { id: "fitzroy-wa", name: "Fitzroy River (WA)", state: "WA", catchment: "Fitzroy (Kimberley)", zone: "tropical", scale: 5000, width: 4,
    points: [[125.6,-18.3],[125.57,-18.2],[125.0,-18.0],[124.3,-17.7],[123.8,-17.5],[123.63,-17.45]] },
  { id: "gascoyne", name: "Gascoyne River", state: "WA", catchment: "Gascoyne", zone: "arid", scale: 1200, width: 3, ephemeral: true,
    points: [[119.3,-25.1],[118.2,-25.3],[116.7,-25.4],[115.4,-25.3],[114.6,-25.0],[113.66,-24.88]] },
  { id: "murchison", name: "Murchison River", state: "WA", catchment: "Murchison", zone: "arid", scale: 800, width: 3, ephemeral: true,
    points: [[118.2,-26.5],[117.2,-26.7],[116.3,-27.1],[115.2,-27.4],[114.6,-27.6],[114.16,-27.71]] },
  { id: "ashburton", name: "Ashburton River", state: "WA", catchment: "Ashburton", zone: "arid", scale: 600, width: 2, ephemeral: true,
    points: [[117.0,-23.3],[116.5,-22.9],[115.8,-22.4],[115.2,-21.9],[115.1,-21.7]] },
  { id: "fortescue", name: "Fortescue River", state: "WA", catchment: "Fortescue", zone: "arid", scale: 700, width: 2, ephemeral: true,
    points: [[119.9,-22.4],[119.0,-22.0],[118.0,-21.5],[117.0,-21.2],[116.2,-21.0]] },
  { id: "de-grey", name: "De Grey River", state: "WA", catchment: "De Grey", zone: "arid", scale: 500, width: 2, ephemeral: true,
    points: [[119.8,-20.6],[119.6,-20.2],[119.5,-19.9]] },
  { id: "swan-avon", name: "Swan–Avon River", state: "WA", catchment: "Swan–Avon", zone: "mediterranean", scale: 800, width: 3,
    points: [[117.5,-32.0],[117.1,-31.8],[116.67,-31.65],[116.3,-31.75],[116.1,-31.9],[115.86,-31.95],[115.74,-32.05]] },
  { id: "blackwood", name: "Blackwood River", state: "WA", catchment: "Blackwood", zone: "mediterranean", scale: 900, width: 2,
    points: [[117.9,-33.5],[117.6,-33.7],[116.13,-33.96],[115.77,-33.98],[115.16,-34.32]] },
);

// ── South Australia ─────────────────────────────────────────────────────
RIVERS.push(
  { id: "torrens", name: "River Torrens", state: "SA", catchment: "Torrens", zone: "mediterranean", scale: 300, width: 2,
    points: [[138.9,-34.8],[138.7,-34.9],[138.6,-34.93],[138.5,-34.9]] },
  { id: "onkaparinga", name: "Onkaparinga River", state: "SA", catchment: "Onkaparinga", zone: "mediterranean", scale: 250, width: 2,
    points: [[138.9,-35.2],[138.7,-35.1],[138.5,-35.15]] },
);

// ── Tasmania ────────────────────────────────────────────────────────────
RIVERS.push(
  { id: "derwent", name: "River Derwent", state: "TAS", catchment: "Derwent", zone: "temperate", scale: 2500, width: 3,
    points: [[146.2,-42.1],[146.5,-42.4],[146.9,-42.6],[147.06,-42.78],[147.33,-42.88],[147.4,-42.95]] },
  { id: "huon", name: "Huon River", state: "TAS", catchment: "Huon", zone: "temperate", scale: 1500, width: 2,
    points: [[146.5,-43.1],[146.9,-43.0],[147.05,-43.03],[147.1,-43.15],[147.0,-43.3]] },
  { id: "tamar", name: "Tamar River", state: "TAS", catchment: "Tamar", zone: "temperate", scale: 2000, width: 3,
    points: [[147.13,-41.45],[147.0,-41.2],[146.85,-41.0],[146.8,-40.9]] },
  { id: "north-esk", name: "North Esk River", state: "TAS", catchment: "Tamar", zone: "temperate", scale: 800, width: 2,
    points: [[147.4,-41.5],[147.13,-41.45]] },
  { id: "gordon", name: "Gordon River", state: "TAS", catchment: "Gordon", zone: "temperate", scale: 1800, width: 2,
    points: [[145.9,-42.6],[145.7,-42.5],[145.45,-42.4],[145.4,-42.3]] },
  { id: "franklin", name: "Franklin River", state: "TAS", catchment: "Gordon", zone: "temperate", scale: 900, width: 1,
    points: [[146.1,-42.5],[145.9,-42.5]] },
  { id: "mersey", name: "Mersey River", state: "TAS", catchment: "Mersey", zone: "temperate", scale: 1000, width: 2,
    points: [[146.2,-41.7],[146.4,-41.6],[146.35,-41.18]] },
  { id: "arthur", name: "Arthur River", state: "TAS", catchment: "Arthur", zone: "temperate", scale: 800, width: 2,
    points: [[145.6,-41.3],[145.2,-41.1],[144.8,-41.05]] },
);

/** Major rivers that get an on-map name label */
export const LABEL_RIVERS: Record<string, [number, number]> = {
  murray: [142.3, -34.4],
  darling: [144.3, -31.5],
  murrumbidgee: [146.3, -34.55],
  lachlan: [145.9, -33.6],
  burdekin: [146.6, -20.3],
  "fitzroy-qld": [150.1, -23.45],
  cooper: [140.6, -26.6],
  diamantina: [140.9, -24.0],
  ord: [128.55, -15.5],
  "fitzroy-wa": [124.6, -17.75],
  gascoyne: [116.0, -25.35],
  murchison: [116.5, -27.2],
  "swan-avon": [116.4, -31.8],
  "mitchell-qld": [143.3, -16.1],
  "flinders-qld": [142.6, -19.6],
  daly: [131.15, -14.15],
  roper: [134.4, -14.85],
  derwent: [146.7, -42.55],
  clarence: [152.8, -29.3],
  hunter: [151.0, -32.3],
  snowy: [148.55, -37.0],
  "condamine-balonne": [149.7, -27.2],
  georgina: [138.8, -22.9],
  norman: [142.5, -18.1],
};
