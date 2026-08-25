import { RIVERS } from "@/data/rivers";
import { DAMS } from "@/data/dams";
import type { MapMode } from "./RiverMap";
import { Waves, Droplets, Database, Info, LoaderCircle, Radio, TriangleAlert } from "lucide-react";
import { useState } from "react";
import type { ConditionsSnapshot } from "@/lib/api";

const MODES: { id: MapMode; label: string; icon: React.ReactNode }[] = [
  { id: "flow", label: "Flow vs normal", icon: <Waves size={13} /> },
  { id: "level", label: "River level", icon: <Droplets size={13} /> },
  { id: "dams", label: "Dam storage", icon: <Database size={13} /> },
];

interface Props {
  mode: MapMode;
  onMode: (mode: MapMode) => void;
  snapshot: ConditionsSnapshot | null;
  loading: boolean;
  error: string | null;
}

export default function Header({ mode, onMode, snapshot, loading, error }: Props) {
  const [showInfo, setShowInfo] = useState(false);
  const status = loading
    ? { label: "Loading observations", color: "text-sky-300", icon: <LoaderCircle size={11} className="animate-spin" /> }
    : error
      ? { label: "Data unavailable", color: "text-orange-300", icon: <TriangleAlert size={11} /> }
      : snapshot
        ? { label: snapshot.status === "live" ? "Live" : snapshot.status === "partial" ? "Live · partial coverage" : "Data unavailable", color: snapshot.status === "unavailable" ? "text-orange-300" : "text-emerald-300", icon: snapshot.status === "unavailable" ? <TriangleAlert size={11} /> : <Radio size={11} /> }
        : { label: "Data unavailable", color: "text-orange-300", icon: <TriangleAlert size={11} /> };
  return (
    <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
      <div className="flex items-start justify-between p-4">
        <div className="pointer-events-auto rounded-xl border border-slate-800 bg-[#0a111c]/90 backdrop-blur-md px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.25em] text-sky-400/80">rivers.au · concept</p>
          <h1 className="text-slate-100 font-semibold text-lg leading-tight tracking-wide">
            Australian River Conditions
          </h1>
          <div className="flex items-center gap-2 mt-1 text-[11px] font-mono">
            <span className={`inline-flex items-center gap-1 ${status.color}`}>{status.icon}{status.label}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">
              {snapshot?.observedRiverCount ?? 0}/{RIVERS.length} rivers · {snapshot?.observedDamCount ?? 0}/{DAMS.length} storages
            </span>
          </div>
          <div className="flex gap-1 mt-3">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => onMode(m.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] uppercase tracking-wider transition-colors ${
                  mode === m.id
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                    : "text-slate-400 border border-transparent hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                {m.icon}
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowInfo(!showInfo)}
          className="pointer-events-auto w-9 h-9 rounded-lg border border-slate-800 bg-[#0a111c]/90 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="About"
        >
          <Info size={15} />
        </button>
      </div>

      {showInfo && (
        <div className="pointer-events-auto mx-4 mt-1 max-w-md rounded-xl border border-slate-800 bg-[#0a111c]/95 backdrop-blur-md p-4 text-xs text-slate-400 leading-relaxed">
          <p className="text-slate-200 font-semibold mb-1.5">About this map</p>
          <p>
            Live national river observations from Bureau of Meteorology Water Data Online. Each
            coloured reach uses a representative official gauge and compares its observed flow with
            the same seasonal window across the previous {snapshot?.baselineYears ?? 10} years.
          </p>
          <p className="mt-2">
            Gauge locations and station links come from BoM Geofabric V3.3. River lines are simplified
            display geometry; they are not individual gauge reaches. Missing observations remain grey
            and are never replaced with generated values. Flood status is not inferred—always use
            official BoM warnings for safety decisions.
          </p>
          {snapshot && (
            <p className="mt-2 text-[10px] text-slate-500">
              {snapshot.source.attribution}
            </p>
          )}
          {error && <p className="mt-2 text-orange-300">{error}</p>}
        </div>
      )}
    </div>
  );
}
