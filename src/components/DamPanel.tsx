import { DAMS } from "@/data/dams";
import type { DamCondition } from "@/lib/api";
import { formatObservedAt } from "@/lib/engine";
import { ExternalLink, X } from "lucide-react";

interface Props {
  damId: string;
  summary: DamCondition | null;
  onClose: () => void;
}

function formatChange(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "Not available";
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)} pp`;
}

function changeColour(value: number | null): string {
  if (value === null) return "text-slate-500";
  return value >= 0 ? "text-emerald-400" : "text-orange-400";
}

export default function DamPanel({ damId, summary, onClose }: Props) {
  const dam = DAMS.find((candidate) => candidate.id === damId);
  if (!dam) return null;

  const observed = summary?.dataState === "observed" && summary.storagePercent !== null;
  const displayPercent = observed ? Math.max(0, Math.min(100, summary.storagePercent!)) : 0;

  return (
    <div className="absolute top-24 right-4 w-80 rounded-xl border border-slate-700/60 bg-[#0a111c]/95 backdrop-blur-md shadow-2xl overflow-hidden z-20">
      <div className="p-4 pb-3 border-b border-slate-800">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-slate-100 font-semibold tracking-wide uppercase text-sm">{dam.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{dam.state} · {dam.river}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 transition-colors p-1" aria-label="Close storage details">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {observed ? (
          <>
            <div>
              <div className="h-4 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-600 to-sky-400 transition-all duration-500"
                  style={{ width: `${displayPercent}%` }}
                />
              </div>
              <p className="text-right text-sm font-mono text-sky-300 mt-1">
                {summary.storagePercent!.toFixed(1)}%
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Observed volume</p>
                <p className="text-lg font-semibold text-slate-100 font-mono">
                  {summary.volumeGl?.toLocaleString("en-AU", { maximumFractionDigits: 1 }) ?? "—"} GL
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Reference capacity</p>
                <p className="text-lg font-semibold text-slate-400 font-mono">{dam.capacityGL.toLocaleString()} GL</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-slate-800/70 pb-1.5">
                <span className="text-slate-500">7 day change</span>
                <span className={`font-mono ${changeColour(summary.change7Days)}`}>{formatChange(summary.change7Days)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/70 pb-1.5">
                <span className="text-slate-500">30 day change</span>
                <span className={`font-mono ${changeColour(summary.change30Days)}`}>{formatChange(summary.change30Days)}</span>
              </div>
              <div className="flex justify-between gap-3 pb-1.5">
                <span className="text-slate-500">Observed</span>
                <span className="font-mono text-right text-slate-300">{formatObservedAt(summary.observedAt)}</span>
              </div>
              {summary.qualityCode !== null && (
                <div className="flex justify-between gap-3 pb-1.5">
                  <span className="text-slate-500">Quality code</span>
                  <span className="font-mono text-slate-300">{summary.qualityCode}</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <p className="text-sm text-slate-300">No matching storage-volume observation is available for this date.</p>
            <p className="text-xs text-slate-500 mt-1">The map leaves unavailable storages grey; it does not generate replacement values.</p>
          </div>
        )}

        {summary?.stationName && (
          <p className="text-[11px] text-slate-500">
            Gauge: <span className="text-slate-400">{summary.stationName}</span>
            {summary.stationNumber ? ` (${summary.stationNumber})` : ""}
          </p>
        )}
        {summary?.sourceUrl && (
          <a
            href={summary.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300"
          >
            Open official Water Data Online station <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
}
