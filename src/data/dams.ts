// Curated major Australian water storages. The server matches these records to
// official Water Data Online storage-volume stations. Capacity is retained here
// as a transparent reference used to calculate percentage full.

export interface Dam {
  id: string;
  name: string;
  state: string;
  river: string;
  /** full supply capacity, GL */
  capacityGL: number;
  lon: number;
  lat: number;
}

export const DAMS: Dam[] = [
  { id: "warragamba", name: "Warragamba Dam", state: "NSW", river: "Warragamba River", capacityGL: 2031, lon: 150.6, lat: -33.88 },
  { id: "eucumbene", name: "Lake Eucumbene", state: "NSW", river: "Eucumbene River", capacityGL: 4798, lon: 148.63, lat: -36.13 },
  { id: "jindabyne", name: "Lake Jindabyne", state: "NSW", river: "Snowy River", capacityGL: 688, lon: 148.63, lat: -36.4 },
  { id: "hume", name: "Hume Dam", state: "NSW/VIC", river: "Murray River", capacityGL: 3005, lon: 147.03, lat: -36.1 },
  { id: "dartmouth", name: "Dartmouth Dam", state: "VIC", river: "Mitta Mitta River", capacityGL: 3856, lon: 147.52, lat: -36.58 },
  { id: "eildon", name: "Lake Eildon", state: "VIC", river: "Goulburn River", capacityGL: 3334, lon: 145.91, lat: -37.22 },
  { id: "thomson-dam", name: "Thomson Dam", state: "VIC", river: "Thomson River", capacityGL: 1068, lon: 146.4, lat: -37.78 },
  { id: "eppalock", name: "Lake Eppalock", state: "VIC", river: "Campaspe River", capacityGL: 305, lon: 144.55, lat: -36.87 },
  { id: "rocklands", name: "Rocklands Reservoir", state: "VIC", river: "Glenelg River", capacityGL: 296, lon: 142.03, lat: -37.18 },
  { id: "burrinjuck", name: "Burrinjuck Dam", state: "NSW", river: "Murrumbidgee River", capacityGL: 1026, lon: 148.58, lat: -35.0 },
  { id: "blowering", name: "Blowering Dam", state: "NSW", river: "Tumut River", capacityGL: 1628, lon: 148.25, lat: -35.4 },
  { id: "talbingo", name: "Talbingo Dam", state: "NSW", river: "Tumut River", capacityGL: 921, lon: 148.3, lat: -35.6 },
  { id: "wyangala", name: "Wyangala Dam", state: "NSW", river: "Lachlan River", capacityGL: 1220, lon: 148.95, lat: -33.98 },
  { id: "burrendong", name: "Burrendong Dam", state: "NSW", river: "Macquarie River", capacityGL: 1188, lon: 149.1, lat: -32.7 },
  { id: "keepit", name: "Keepit Dam", state: "NSW", river: "Namoi River", capacityGL: 425, lon: 150.5, lat: -30.88 },
  { id: "copeton", name: "Copeton Dam", state: "NSW", river: "Gwydir River", capacityGL: 1364, lon: 150.93, lat: -29.9 },
  { id: "glenbawn", name: "Glenbawn Dam", state: "NSW", river: "Hunter River", capacityGL: 750, lon: 151.0, lat: -32.1 },
  { id: "menindee", name: "Menindee Lakes", state: "NSW", river: "Darling River", capacityGL: 1731, lon: 142.4, lat: -32.42 },
  { id: "burdekin-falls", name: "Burdekin Falls Dam", state: "QLD", river: "Burdekin River", capacityGL: 1860, lon: 146.2, lat: -20.65 },
  { id: "fairbairn", name: "Fairbairn Dam", state: "QLD", river: "Nogoa River", capacityGL: 1301, lon: 148.1, lat: -23.65 },
  { id: "wivenhoe", name: "Wivenhoe Dam", state: "QLD", river: "Brisbane River", capacityGL: 1165, lon: 152.6, lat: -27.4 },
  { id: "somerset", name: "Somerset Dam", state: "QLD", river: "Stanley River", capacityGL: 904, lon: 152.55, lat: -27.12 },
  { id: "awoonga", name: "Awoonga Dam", state: "QLD", river: "Boyne River", capacityGL: 777, lon: 151.3, lat: -24.1 },
  { id: "tinaroo", name: "Lake Tinaroo", state: "QLD", river: "Barron River", capacityGL: 407, lon: 145.55, lat: -17.15 },
  { id: "argyle", name: "Lake Argyle", state: "WA", river: "Ord River", capacityGL: 10760, lon: 128.75, lat: -16.4 },
  { id: "wellington-wa", name: "Wellington Dam", state: "WA", river: "Collie River", capacityGL: 185, lon: 115.98, lat: -33.4 },
  { id: "gordon-dam", name: "Gordon Dam", state: "TAS", river: "Gordon River", capacityGL: 2934, lon: 146.05, lat: -42.73 },
  { id: "burbury", name: "Lake Burbury", state: "TAS", river: "King River", capacityGL: 1081, lon: 145.66, lat: -42.1 },
  { id: "darwin-river", name: "Darwin River Dam", state: "NT", river: "Darwin River", capacityGL: 259, lon: 130.97, lat: -12.84 },
];
