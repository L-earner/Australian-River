import { CONDITION_META, type Condition } from "@/lib/engine";
import type { MapMode } from "./RiverMap";

const ORDER: Condition[] = [
  "extreme-high", "high", "above-normal", "normal", "below-normal", "low", "extreme-low",
];

const DAM_RAMP = [
  { color: "#3b8bff", label: "> 85%" },
  { color: "#74c476", label: "70–85%" },
  { color: "#fdad45", label: "50–70%" },
  { color: "#f16913", label: "30–50%" },
  { color: "#d7301f", label: "< 30%" },
];

const LEVEL_RAMP = [
  { color: "#5ee7ff", label: "> 4.5 m" },
  { color: "#38c9de", label: "3.5–4.5 m" },
  { color: "#3fb3c4", label: "2.5–3.5 m" },
  { color: "#4f93a8", label: "1.5–2.5 m" },
  { color: "#5f7488", label: "< 1.5 m" },
];

export default function Legend({ mode, baselineYears }: { mode: MapMode; baselineYears: number }) {
  const items = mode === "dams"
    ? DAM_RAMP
    : mode === "level"
      ? LEVEL_RAMP
      : ORDER.map((c) => ({ color: CONDITION_META[c].color, label: `${CONDITION_META[c].label} · ${CONDITION_META[c].band}` }));
  return (
    <div className="absolute left-4 bottom-28 rounded-lg border border-slate-800 bg-[#0a111c]/90 backdrop-blur-md px-3 py-2.5 z-10">
      <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">
        {mode === "dams" ? "Storage level" : mode === "level" ? "Observed river level" : `Flow vs ${baselineYears}-yr seasonal normal`}
      </p>
      <div className="space-y-1.5">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-2">
            <span className="inline-block w-5 h-[3px] rounded-full" style={{ background: it.color }} />
            <span className="text-[11px] text-slate-300">{it.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="inline-block w-5 h-[3px] rounded-full bg-slate-600" />
          <span className="text-[11px] text-slate-400">No observation</span>
        </div>
      </div>
    </div>
  );
}
