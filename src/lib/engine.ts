// Presentation helpers only. All hydrology values come from the live API.

export type Condition =
  | "extreme-low"
  | "low"
  | "below-normal"
  | "normal"
  | "above-normal"
  | "high"
  | "extreme-high";

export const CONDITION_META: Record<
  Condition,
  { label: string; color: string; band: string }
> = {
  "extreme-low": { label: "Extremely low", color: "#d7301f", band: "0–5th percentile" },
  low: { label: "Very low", color: "#f16913", band: "5–20th" },
  "below-normal": { label: "Below normal", color: "#fdad45", band: "20–40th" },
  normal: { label: "Normal", color: "#9db2c7", band: "40–60th" },
  "above-normal": { label: "Above normal", color: "#74c476", band: "60–80th" },
  high: { label: "Very high", color: "#31a354", band: "80–95th" },
  "extreme-high": { label: "Extremely high", color: "#3b8bff", band: "95–100th" },
};

export function formatMLday(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "No observation";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)} TL/day`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)} GL/day`;
  return `${Math.round(value).toLocaleString()} ML/day`;
}

export function formatObservedAt(value: string | null): string {
  if (!value) return "No observation";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
