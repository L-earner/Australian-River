import type { Condition } from "@/lib/engine";

export interface RiverCondition {
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

export interface DamCondition {
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

export interface ConditionsSnapshot {
  status: "live" | "partial" | "unavailable";
  targetDate: string;
  generatedAt: string;
  baselineYears: number;
  observedRiverCount: number;
  observedDamCount: number;
  rivers: Record<string, RiverCondition>;
  dams: Record<string, DamCondition>;
  source: {
    observations: string;
    stations: string;
    attribution: string;
    observationsUrl: string;
    stationsUrl: string;
  };
}

export interface RiverDetail {
  summary: RiverCondition;
  history: Array<{ date: string; flowMlDay: number; qualityCode: number | null }>;
}

async function apiRequest<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, { signal, headers: { Accept: "application/json" } });
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error ?? `Request failed (${response.status})`);
  return payload;
}

export function getConditions(date: string, signal?: AbortSignal): Promise<ConditionsSnapshot> {
  return apiRequest<ConditionsSnapshot>(`/api/conditions?date=${encodeURIComponent(date)}`, signal);
}

export function getRiverDetail(riverId: string, date: string, signal?: AbortSignal): Promise<RiverDetail> {
  return apiRequest<RiverDetail>(
    `/api/rivers/${encodeURIComponent(riverId)}?date=${encodeURIComponent(date)}`,
    signal,
  );
}
