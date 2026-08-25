import { DAMS } from "../src/data/dams.js";
import { RIVERS, type River } from "../src/data/rivers.js";

export type Condition =
  | "extreme-low"
  | "low"
  | "below-normal"
  | "normal"
  | "above-normal"
  | "high"
  | "extreme-high";

export interface ObservationValue {
  timestamp: string;
  value: number;
  qualityCode: number | null;
}

export interface RiverConditionDto {
  riverId: string;
  stationNumber: string | null;
  stationName: string | null;
  stationLongitude: number | null;
  stationLatitude: number | null;
  sourceUrl: string | null;
  observedAt: string | null;
  flowMlDay: number | null;
  medianMlDay: number | null;
  ratio: number | null;
  percentile: number | null;
  condition: Condition | null;
  levelM: number | null;
  qualityCode: number | null;
  dataState: "observed" | "unavailable";
}

export interface DamConditionDto {
  damId: string;
  stationNumber: string | null;
  stationName: string | null;
  sourceUrl: string | null;
  observedAt: string | null;
  storagePercent: number | null;
  volumeGl: number | null;
  change7Days: number | null;
  change30Days: number | null;
  qualityCode: number | null;
  dataState: "observed" | "unavailable";
}

export interface ConditionsSnapshotDto {
  status: "live" | "partial" | "unavailable";
  targetDate: string;
  generatedAt: string;
  baselineYears: number;
  observedRiverCount: number;
  observedDamCount: number;
  rivers: Record<string, RiverConditionDto>;
  dams: Record<string, DamConditionDto>;
  source: {
    observations: string;
    stations: string;
    attribution: string;
    observationsUrl: string;
    stationsUrl: string;
  };
}

export interface RiverDetailDto {
  summary: RiverConditionDto;
  history: Array<{ date: string; flowMlDay: number; qualityCode: number | null }>;
}

interface CacheEntry<T> {
  expiresAt: number;
  value?: T;
  promise?: Promise<T>;
}

interface MatrixRow {
  [key: string]: string;
}

interface TimeseriesRow extends MatrixRow {
  station_no: string;
  station_name: string;
  ts_id: string;
  ts_name: string;
}

interface TimeseriesResponse {
  ts_id: string;
  columns: string;
  data: Array<Array<string | number | null>>;
}

interface GaugeProperties {
  stationno: string;
  stnname: string;
  wdo_link: string | null;
  upstrdarea: number | null;
  displaylevel: number | null;
}

interface GaugeFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: GaugeProperties;
}

interface GaugeFeatureCollection {
  type: "FeatureCollection";
  features: GaugeFeature[];
}

interface RiverStation {
  river: River;
  gauge: GaugeFeature;
  flowTimeseriesId: string;
  dailyFlowTimeseriesId: string;
  levelTimeseriesId: string | null;
}

interface DamStation {
  damId: string;
  stationNumber: string;
  stationName: string;
  longitude: number;
  latitude: number;
  sourceUrl: string;
  volumeTimeseriesId: string;
  dailyVolumeTimeseriesId: string | null;
}

const WDO_URL = "https://www.bom.gov.au/waterdata/services";
const WDO_STATION_URL = "https://www.bom.gov.au/waterdata/station.html";
const GEOFABRIC_GAUGES_URL =
  "https://hosting.wsapi.cloud.bom.gov.au/arcgis/rest/services/ahgf/Geofabric_V3x_All_Products/FeatureServer/2/query";
const GEOFABRIC_SERVICE_URL =
  "https://hosting.wsapi.cloud.bom.gov.au/arcgis/rest/services/ahgf/Geofabric_V3x_All_Products/FeatureServer";
const FLOW_PARAMETER = "Water Course Discharge";
const LEVEL_PARAMETER = "Water Course Level";
const STORAGE_PARAMETER = "Storage Volume";
const AS_STORED = "DMQaQc.Merged.AsStored.1";
const DAILY_MEAN = "DMQaQc.Merged.DailyMean.24HR";
const BASELINE_YEARS = Math.max(3, Math.min(30, Number(process.env.BASELINE_YEARS ?? 10)));
const REQUEST_TIMEOUT_MS = Math.max(5_000, Number(process.env.UPSTREAM_TIMEOUT_MS ?? 45_000));
const cache = new Map<string, CacheEntry<unknown>>();

const RIVER_ALIASES: Record<string, string[]> = {
  "hawkesbury": ["hawkesbury river", "nepean river"],
  "condamine-balonne": ["condamine river", "balonne river"],
  "swan-avon": ["swan river", "avon river"],
  "derwent": ["derwent river"],
  "torrens": ["torrens river"],
  "johnstone": ["johnstone river", "north johnstone river", "south johnstone river"],
};

function normalise(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function padded(value: string): string {
  return ` ${normalise(value)} `;
}

function dateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

function startOfUtcDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return (sorted[middle - 1]! + sorted[middle]!) / 2;
  return sorted[middle]!;
}

function classify(percentile: number): Condition {
  if (percentile < 5) return "extreme-low";
  if (percentile < 20) return "low";
  if (percentile < 40) return "below-normal";
  if (percentile < 60) return "normal";
  if (percentile < 80) return "above-normal";
  if (percentile < 95) return "high";
  return "extreme-high";
}

function chunks<T>(values: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size));
  }
  return result;
}

async function mapLimit<T, R>(values: T[], limit: number, mapper: (value: T) => Promise<R>): Promise<R[]> {
  const result = new Array<R>(values.length);
  let cursor = 0;
  async function worker() {
    while (cursor < values.length) {
      const index = cursor++;
      result[index] = await mapper(values[index]!);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, () => worker()));
  return result;
}

async function cached<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const existing = cache.get(key) as CacheEntry<T> | undefined;
  if (existing?.value !== undefined && existing.expiresAt > Date.now()) return existing.value;
  if (existing?.promise) return existing.promise;

  const entry: CacheEntry<T> = { expiresAt: Date.now() + ttlMs };
  entry.promise = loader()
    .then((value) => {
      entry.value = value;
      entry.promise = undefined;
      entry.expiresAt = Date.now() + ttlMs;
      return value;
    })
    .catch((error: unknown) => {
      cache.delete(key);
      throw error;
    });
  cache.set(key, entry as CacheEntry<unknown>);
  return entry.promise;
}

async function fetchJson<T>(url: URL): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json", "User-Agent": "rivers-au-live/1.0" },
    });
    if (!response.ok) throw new Error(`Upstream request failed (${response.status})`);
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

async function queryWdo(params: Record<string, string>): Promise<unknown> {
  const url = new URL(WDO_URL);
  url.search = new URLSearchParams({
    service: "kisters",
    type: "QueryServices",
    format: "json",
    ...params,
  }).toString();
  return fetchJson<unknown>(url);
}

function matrixToRows(payload: unknown): MatrixRow[] {
  if (!Array.isArray(payload) || payload.length < 2 || !Array.isArray(payload[0])) return [];
  const headers = payload[0].map(String);
  return payload.slice(1).filter(Array.isArray).map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, String(row[index] ?? "")])),
  );
}

export function parseWaterDataNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function getTimeseriesList(
  parameter: string,
  stationNumbers: string[],
  timeseriesName?: string,
): Promise<TimeseriesRow[]> {
  const uniqueStations = [...new Set(stationNumbers)].filter(Boolean);
  const pages = await mapLimit(chunks(uniqueStations, 70), 4, async (page) => {
    const payload = await queryWdo({
      request: "getTimeseriesList",
      parametertype_name: parameter,
      station_no: page.join(","),
      ...(timeseriesName ? { ts_name: timeseriesName } : {}),
    });
    return matrixToRows(payload) as TimeseriesRow[];
  });
  return pages.flat();
}

async function getTimeseriesValues(
  timeseriesIds: string[],
  from: Date,
  to: Date,
): Promise<Map<string, ObservationValue[]>> {
  const uniqueIds = [...new Set(timeseriesIds)].filter(Boolean);
  const pages = await mapLimit(chunks(uniqueIds, 90), 4, async (page) => {
    const payload = await queryWdo({
      request: "getTimeseriesValues",
      ts_id: page.join(","),
      from: from.toISOString(),
      to: to.toISOString(),
      returnfields: "Timestamp,Value,Quality Code",
    });
    return Array.isArray(payload) ? (payload as TimeseriesResponse[]) : [];
  });

  const result = new Map<string, ObservationValue[]>();
  for (const item of pages.flat()) {
    const columns = item.columns.split(",");
    const timestampIndex = columns.indexOf("Timestamp");
    const valueIndex = columns.indexOf("Value");
    const qualityIndex = columns.indexOf("Quality Code");
    const values = item.data
      .map((row) => {
        const value = parseWaterDataNumber(row[valueIndex]);
        if (value === null) return null;
        const rawQuality = row[qualityIndex];
        const quality = rawQuality === null ? null : Number(rawQuality);
        return {
          timestamp: String(row[timestampIndex]),
          value,
          qualityCode: Number.isFinite(quality) ? quality : null,
        } satisfies ObservationValue;
      })
      .filter((value): value is ObservationValue => value !== null)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    result.set(String(item.ts_id), values);
  }
  return result;
}

function latestOnOrBefore(values: ObservationValue[], targetDate: string): ObservationValue | null {
  const eligible = values.filter((value) => value.timestamp.slice(0, 10) <= targetDate);
  return eligible.at(-1) ?? null;
}

function valueNearDate(values: ObservationValue[], target: Date): ObservationValue | null {
  const targetMs = target.getTime();
  return values
    .filter((item) => new Date(item.timestamp).getTime() <= targetMs + 86_400_000)
    .sort(
      (a, b) =>
        Math.abs(new Date(a.timestamp).getTime() - targetMs) -
        Math.abs(new Date(b.timestamp).getTime() - targetMs),
    )[0] ?? null;
}

function riverPhrases(river: River): string[] {
  const aliases = RIVER_ALIASES[river.id] ?? [];
  const full = normalise(river.name.replace(/\([^)]*\)/g, ""));
  const waterType = full.includes("creek") ? "creek" : "river";
  const base = full.replace(/\b(river|creek)\b/g, "").trim();
  const componentPhrases = base
    .split(/\b(?:and)\b/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 4)
    .map((part) => `${part} ${waterType}`);
  const reversed = full.startsWith("river ") ? `${full.slice(6)} river` : full;
  return [...new Set([full, reversed, ...aliases, ...componentPhrases])].map(normalise).filter(Boolean);
}

function pointDistance(a: [number, number], b: [number, number]): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function gaugeCandidates(river: River, gauges: GaugeFeature[]): GaugeFeature[] {
  const phrases = riverPhrases(river);
  return gauges
    .map((gauge) => {
      const stationName = padded(gauge.properties.stnname);
      let score = 0;
      phrases.forEach((phrase, index) => {
        if (stationName.includes(` ${phrase} `)) score = Math.max(score, index === 0 ? 100 : 82);
      });
      const distance = Math.min(...river.points.map((point) => pointDistance(point, gauge.geometry.coordinates)));
      if (score === 0 || distance > 1.5) return null;
      const areaBonus = Math.min(10, Math.log10(Math.max(1, gauge.properties.upstrdarea ?? 1) / 1_000_000));
      const displayPenalty = gauge.properties.displaylevel ?? 9;
      return { gauge, score: score + areaBonus - distance * 5 - displayPenalty };
    })
    .filter((candidate): candidate is { gauge: GaugeFeature; score: number } => candidate !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((candidate) => candidate.gauge);
}

async function loadGauges(): Promise<GaugeFeature[]> {
  return cached("geofabric:gauges:v3.3", 24 * 60 * 60_000, async () => {
    const url = new URL(GEOFABRIC_GAUGES_URL);
    url.search = new URLSearchParams({
      where: "displaylevel<=4",
      outFields: "stationno,stnname,wdo_link,upstrdarea,displaylevel",
      returnGeometry: "true",
      outSR: "4326",
      f: "geojson",
    }).toString();
    const collection = await fetchJson<GaugeFeatureCollection>(url);
    return collection.features.filter(
      (feature) =>
        feature.geometry?.type === "Point" &&
        Number.isFinite(feature.geometry.coordinates[0]) &&
        Number.isFinite(feature.geometry.coordinates[1]) &&
        Boolean(feature.properties.stationno),
    );
  });
}

async function resolveRiverStations(): Promise<Map<string, RiverStation>> {
  return cached("mapping:rivers:v3", 6 * 60 * 60_000, async () => {
    const gauges = await loadGauges();
    const candidates = new Map(RIVERS.map((river) => [river.id, gaugeCandidates(river, gauges)]));
    const stationNumbers = [...new Set([...candidates.values()].flat().map((gauge) => gauge.properties.stationno))];

    const [flowRows, dailyRows] = await Promise.all([
      getTimeseriesList(FLOW_PARAMETER, stationNumbers, AS_STORED),
      getTimeseriesList(FLOW_PARAMETER, stationNumbers, DAILY_MEAN),
    ]);
    const flowByStation = new Map(flowRows.map((row) => [row.station_no, row]));
    const dailyByStation = new Map(dailyRows.map((row) => [row.station_no, row]));

    const selected = new Map<string, RiverStation>();
    for (const river of RIVERS) {
      const gauge = candidates
        .get(river.id)
        ?.find((candidate) => flowByStation.has(candidate.properties.stationno) && dailyByStation.has(candidate.properties.stationno));
      if (!gauge) continue;
      const flow = flowByStation.get(gauge.properties.stationno)!;
      const daily = dailyByStation.get(gauge.properties.stationno)!;
      selected.set(river.id, {
        river,
        gauge,
        flowTimeseriesId: flow.ts_id,
        dailyFlowTimeseriesId: daily.ts_id,
        levelTimeseriesId: null,
      });
    }

    const selectedStationNumbers = [...selected.values()].map((item) => item.gauge.properties.stationno);
    const levelRows = await getTimeseriesList(LEVEL_PARAMETER, selectedStationNumbers, AS_STORED);
    const levelByStation = new Map(levelRows.map((row) => [row.station_no, row]));
    for (const station of selected.values()) {
      station.levelTimeseriesId = levelByStation.get(station.gauge.properties.stationno)?.ts_id ?? null;
    }
    return selected;
  });
}

function emptyRiverCondition(riverId: string): RiverConditionDto {
  return {
    riverId,
    stationNumber: null,
    stationName: null,
    stationLongitude: null,
    stationLatitude: null,
    sourceUrl: null,
    observedAt: null,
    flowMlDay: null,
    medianMlDay: null,
    ratio: null,
    percentile: null,
    condition: null,
    levelM: null,
    qualityCode: null,
    dataState: "unavailable",
  };
}

async function buildRiverConditions(targetDate: string): Promise<Record<string, RiverConditionDto>> {
  const stations = await resolveRiverStations();
  const target = startOfUtcDate(targetDate);
  const stationValues = [...stations.values()];
  const flowIds = stationValues.map((station) => station.flowTimeseriesId);
  const levelIds = stationValues.flatMap((station) => (station.levelTimeseriesId ? [station.levelTimeseriesId] : []));
  const dailyIds = stationValues.map((station) => station.dailyFlowTimeseriesId);

  const [currentFlow, currentLevel] = await Promise.all([
    getTimeseriesValues(flowIds, addDays(target, -3), addDays(target, 2)),
    getTimeseriesValues(levelIds, addDays(target, -3), addDays(target, 2)),
  ]);

  const baselineWindows = Array.from({ length: BASELINE_YEARS }, (_, index) => {
    const year = target.getUTCFullYear() - index - 1;
    const centre = new Date(Date.UTC(year, target.getUTCMonth(), target.getUTCDate()));
    return { from: addDays(centre, -7), to: addDays(centre, 8) };
  });
  const baselineResponses = await mapLimit(baselineWindows, 3, (window) =>
    getTimeseriesValues(dailyIds, window.from, window.to),
  );

  const baselineById = new Map<string, number[]>();
  for (const response of baselineResponses) {
    for (const [timeseriesId, values] of response) {
      const bucket = baselineById.get(timeseriesId) ?? [];
      bucket.push(...values.map((value) => value.value).filter(Number.isFinite));
      baselineById.set(timeseriesId, bucket);
    }
  }

  const result = Object.fromEntries(RIVERS.map((river) => [river.id, emptyRiverCondition(river.id)]));
  for (const station of stationValues) {
    const flow = latestOnOrBefore(currentFlow.get(station.flowTimeseriesId) ?? [], targetDate);
    const level = station.levelTimeseriesId
      ? latestOnOrBefore(currentLevel.get(station.levelTimeseriesId) ?? [], targetDate)
      : null;
    const baseline = baselineById.get(station.dailyFlowTimeseriesId) ?? [];
    const baselineMedian = median(baseline);
    const percentile = flow && baseline.length > 0
      ? (baseline.filter((value) => value <= flow.value).length / baseline.length) * 100
      : null;
    const flowMlDay = flow ? flow.value * 86.4 : null;
    const medianMlDay = baselineMedian === null ? null : baselineMedian * 86.4;
    const [longitude, latitude] = station.gauge.geometry.coordinates;

    result[station.river.id] = {
      riverId: station.river.id,
      stationNumber: station.gauge.properties.stationno,
      stationName: station.gauge.properties.stnname,
      stationLongitude: longitude,
      stationLatitude: latitude,
      sourceUrl: station.gauge.properties.wdo_link?.replace(/^http:/, "https:") ?? null,
      observedAt: flow?.timestamp ?? level?.timestamp ?? null,
      flowMlDay,
      medianMlDay,
      ratio: flowMlDay !== null && medianMlDay !== null && medianMlDay > 0 ? flowMlDay / medianMlDay : null,
      percentile,
      condition: percentile === null ? null : classify(percentile),
      levelM: level?.value ?? null,
      qualityCode: flow?.qualityCode ?? level?.qualityCode ?? null,
      dataState: flow || level ? "observed" : "unavailable",
    };
  }
  return result;
}

async function getStorageStations(): Promise<MatrixRow[]> {
  return cached("wdo:storage-stations", 24 * 60 * 60_000, async () => {
    const payload = await queryWdo({
      request: "getStationList",
      parameterType_name: STORAGE_PARAMETER,
      returnfields: "station_name,station_no,station_id,station_latitude,station_longitude",
    });
    return matrixToRows(payload);
  });
}

function damBaseName(name: string): string {
  return normalise(name).replace(/\b(lake|dam|reservoir|falls)\b/g, " ").replace(/\s+/g, " ").trim();
}

function damCandidateRows(
  dam: (typeof DAMS)[number],
  stations: MatrixRow[],
): Array<MatrixRow & { score: number }> {
  const base = damBaseName(dam.name);
  const name = normalise(dam.name);
  return stations
    .map((station) => {
      const stationName = padded(station.station_name ?? "");
      let nameScore = 0;
      if (stationName.includes(` ${name} `)) nameScore = 110;
      else if (base.length >= 4 && stationName.includes(` ${base} `)) nameScore = 90;
      if (nameScore === 0) return null;
      const longitude = Number(station.station_longitude);
      const latitude = Number(station.station_latitude);
      const validCoordinate = longitude >= 110 && longitude <= 160 && latitude >= -46 && latitude <= -8;
      const distance = validCoordinate ? Math.hypot(longitude - dam.lon, latitude - dam.lat) : 5;
      if (validCoordinate && distance > 2) return null;
      return { ...station, score: nameScore - distance * 8 };
    })
    .filter((candidate): candidate is MatrixRow & { score: number } => candidate !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

const STORAGE_CURRENT_PREFERENCE = [
  "PR02AVQaQc.Merged.AsStored.1",
  "DMQaQc.Merged.AsStored.1",
  "Harmonised.Combined.AsStored.1",
  "ObsPOR.Merged.AsStored.1",
];
const STORAGE_DAILY_PREFERENCE = [
  "PR02AVQaQc.Merged.DailyMean.24HR",
  "DMQaQc.Merged.DailyMean.24HR",
  "PR02TVQaQc.Merged.DailyMean.24HR",
];

function preferredTimeseries(rows: TimeseriesRow[], names: string[]): TimeseriesRow | null {
  for (const name of names) {
    const row = rows.find((candidate) => candidate.ts_name === name);
    if (row) return row;
  }
  return null;
}

async function resolveDamStations(): Promise<Map<string, DamStation>> {
  return cached("mapping:dams:v2", 6 * 60 * 60_000, async () => {
    const storageStations = await getStorageStations();
    const candidates = new Map(DAMS.map((dam) => [dam.id, damCandidateRows(dam, storageStations)]));
    const stationNumbers = [...new Set([...candidates.values()].flat().map((station) => station.station_no))];
    const rows = await getTimeseriesList(STORAGE_PARAMETER, stationNumbers);
    const rowsByStation = new Map<string, TimeseriesRow[]>();
    for (const row of rows) {
      const bucket = rowsByStation.get(row.station_no) ?? [];
      bucket.push(row);
      rowsByStation.set(row.station_no, bucket);
    }

    const result = new Map<string, DamStation>();
    for (const dam of DAMS) {
      for (const candidate of candidates.get(dam.id) ?? []) {
        const stationRows = rowsByStation.get(candidate.station_no) ?? [];
        const current = preferredTimeseries(stationRows, STORAGE_CURRENT_PREFERENCE);
        if (!current) continue;
        const daily = preferredTimeseries(stationRows, STORAGE_DAILY_PREFERENCE);
        result.set(dam.id, {
          damId: dam.id,
          stationNumber: candidate.station_no,
          stationName: candidate.station_name,
          longitude: Number(candidate.station_longitude),
          latitude: Number(candidate.station_latitude),
          sourceUrl: `${WDO_STATION_URL}?station=${encodeURIComponent(candidate.station_no)}`,
          volumeTimeseriesId: current.ts_id,
          dailyVolumeTimeseriesId: daily?.ts_id ?? null,
        });
        break;
      }
    }
    return result;
  });
}

function emptyDamCondition(damId: string): DamConditionDto {
  return {
    damId,
    stationNumber: null,
    stationName: null,
    sourceUrl: null,
    observedAt: null,
    storagePercent: null,
    volumeGl: null,
    change7Days: null,
    change30Days: null,
    qualityCode: null,
    dataState: "unavailable",
  };
}

async function buildDamConditions(targetDate: string): Promise<Record<string, DamConditionDto>> {
  const stations = await resolveDamStations();
  const target = startOfUtcDate(targetDate);
  const stationValues = [...stations.values()];
  const currentIds = stationValues.map((station) => station.volumeTimeseriesId);
  const dailyIds = stationValues.flatMap((station) =>
    station.dailyVolumeTimeseriesId ? [station.dailyVolumeTimeseriesId] : [],
  );
  const [currentResponses, dailyResponses] = await Promise.all([
    getTimeseriesValues(currentIds, addDays(target, -3), addDays(target, 2)),
    getTimeseriesValues(dailyIds, addDays(target, -35), addDays(target, 2)),
  ]);

  const result = Object.fromEntries(DAMS.map((dam) => [dam.id, emptyDamCondition(dam.id)]));
  for (const dam of DAMS) {
    const station = stations.get(dam.id);
    if (!station) continue;
    const dailyValues = station.dailyVolumeTimeseriesId
      ? dailyResponses.get(station.dailyVolumeTimeseriesId) ?? []
      : [];
    const current = latestOnOrBefore(currentResponses.get(station.volumeTimeseriesId) ?? [], targetDate)
      ?? latestOnOrBefore(dailyValues, targetDate);
    if (!current) {
      result[dam.id] = {
        ...emptyDamCondition(dam.id),
        stationNumber: station.stationNumber,
        stationName: station.stationName,
        sourceUrl: station.sourceUrl,
      };
      continue;
    }

    const volumeGl = current.value / 1_000;
    const storagePercent = (volumeGl / dam.capacityGL) * 100;
    const prior7 = valueNearDate(dailyValues, addDays(target, -7));
    const prior30 = valueNearDate(dailyValues, addDays(target, -30));
    result[dam.id] = {
      damId: dam.id,
      stationNumber: station.stationNumber,
      stationName: station.stationName,
      sourceUrl: station.sourceUrl,
      observedAt: current.timestamp,
      storagePercent,
      volumeGl,
      change7Days: prior7 ? storagePercent - (prior7.value / 1_000 / dam.capacityGL) * 100 : null,
      change30Days: prior30 ? storagePercent - (prior30.value / 1_000 / dam.capacityGL) * 100 : null,
      qualityCode: current.qualityCode,
      dataState: "observed",
    };
  }
  return result;
}

export async function getConditionsSnapshot(targetDate: string): Promise<ConditionsSnapshotDto> {
  const today = dateOnly(new Date());
  const ttl = targetDate === today ? 15 * 60_000 : 12 * 60 * 60_000;
  return cached(`snapshot:${targetDate}:baseline-${BASELINE_YEARS}`, ttl, async () => {
    const [rivers, dams] = await Promise.all([
      buildRiverConditions(targetDate),
      buildDamConditions(targetDate),
    ]);
    const observedRiverCount = Object.values(rivers).filter((river) => river.dataState === "observed").length;
    const observedDamCount = Object.values(dams).filter((dam) => dam.dataState === "observed").length;
    const status = observedRiverCount === 0 && observedDamCount === 0
      ? "unavailable"
      : observedRiverCount === RIVERS.length && observedDamCount === DAMS.length
        ? "live"
        : "partial";
    return {
      status,
      targetDate,
      generatedAt: new Date().toISOString(),
      baselineYears: BASELINE_YEARS,
      observedRiverCount,
      observedDamCount,
      rivers,
      dams,
      source: {
        observations: "Bureau of Meteorology Water Data Online",
        stations: "Australian Hydrological Geospatial Fabric V3.3",
        attribution: "© Commonwealth of Australia (Bureau of Meteorology) 2022–2026",
        observationsUrl: "https://www.bom.gov.au/waterdata/",
        stationsUrl: GEOFABRIC_SERVICE_URL,
      },
    };
  });
}

export async function getRiverDetail(riverId: string, targetDate: string): Promise<RiverDetailDto | null> {
  const river = RIVERS.find((candidate) => candidate.id === riverId);
  if (!river) return null;
  const snapshot = await getConditionsSnapshot(targetDate);
  const summary = snapshot.rivers[riverId] ?? emptyRiverCondition(riverId);
  const station = (await resolveRiverStations()).get(riverId);
  if (!station) return { summary, history: [] };

  const target = startOfUtcDate(targetDate);
  const response = await getTimeseriesValues(
    [station.dailyFlowTimeseriesId],
    addDays(target, -90),
    addDays(target, 2),
  );
  const history = (response.get(station.dailyFlowTimeseriesId) ?? [])
    .filter((value) => value.timestamp.slice(0, 10) <= targetDate)
    .map((value) => ({
      date: value.timestamp.slice(0, 10),
      flowMlDay: value.value * 86.4,
      qualityCode: value.qualityCode,
    }));
  return { summary, history };
}

export function getLiveDataConfig() {
  return {
    baselineYears: BASELINE_YEARS,
    rivers: RIVERS.length,
    dams: DAMS.length,
    upstreamTimeoutMs: REQUEST_TIMEOUT_MS,
  };
}
