import { useEffect, useState } from "react";
import { ExternalLink, LoaderCircle, ShieldAlert, X } from "lucide-react";
import type { River } from "@/data/rivers";
import { getRiverDetail, type RiverCondition, type RiverDetail } from "@/lib/api";
import { CONDITION_META, formatMLday, formatObservedAt } from "@/lib/engine";

function Sparkline({ values, median, color }: { values: number[]; median: number | null; color: string }) {
  const width = 260;
  const height = 64;
  const padding = 6;
  if (values.length < 2) {
    return <div className="h-16 flex items-center justify-center text-xs text-slate-600">History unavailable</div>;
  }
  const comparable = median === null ? values : [...values, median];
  const max = Math.max(...comparable) * 1.08;
  const min = Math.min(...values) * 0.9;
  const x = (index: number) => padding + (index / (values.length - 1)) * (width - 2 * padding);
  const y = (value: number) => height - padding - ((value - min) / (max - min || 1)) * (height - 2 * padding);
  const path = values
    .map((value, index) => `${index === 0 ? "M" : "L"}${x(index).toFixed(1)},${y(value).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      {median !== null && (
        <line
          x1={padding}
          x2={width - padding}
          y1={y(median)}
          y2={y(median)}
          stroke="#5b6b7d"
          strokeDasharray="4 3"
          strokeWidth="1"
        />
      )}
      <path d={path} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx={x(values.length - 1)} cy={y(values.at(-1)!)} r="3" fill={color} />
    </svg>
  );
}

interface Props {
  river: River;
  date: Date;
  dateKey: string;
  summary: RiverCondition | null;
  onClose: () => void;
}

export default function RiverPanel({ river, date, dateKey, summary, onClose }: Props) {
  const [detail, setDetail] = useState<RiverDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    void getRiverDetail(river.id, dateKey, controller.signal)
      .then(setDetail)
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError(requestError instanceof Error ? requestError.message : "Unable to load river history.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [river.id, dateKey]);

  const observation = detail?.summary ?? summary;
  const meta = observation?.condition ? CONDITION_META[observation.condition] : null;
  const color = meta?.color ?? "#64748b";
  const history = detail?.history ?? [];

  return (
    <div className="absolute top-24 right-4 bottom-28 w-80 rounded-xl border border-slate-700/60 bg-[#0a111c]/95 backdrop-blur-md shadow-2xl flex flex-col overflow-hidden z-20">
      <div className="p-4 pb-3 border-b border-slate-800">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-slate-100 font-semibold tracking-wide uppercase text-sm">{river.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{river.state} · {river.catchment} catchment</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 transition-colors p-1" aria-label="Close river details">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto">
        {loading && !observation && (
          <div className="h-40 flex items-center justify-center gap-2 text-sm text-sky-300">
            <LoaderCircle size={16} className="animate-spin" /> Loading BoM observations
          </div>
        )}

        {error && <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-3 text-xs text-orange-200">{error}</div>}

        {observation?.dataState !== "observed" && !loading && (
          <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
            <p className="text-sm font-semibold text-slate-200">No live observation available</p>
            <p className="text-xs text-slate-500 mt-1">
              No suitable Water Data Online discharge or level series was found for this displayed river reach.
            </p>
          </div>
        )}

        {observation?.dataState === "observed" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Observed flow</p>
                <p className="text-lg font-semibold text-slate-100 font-mono">{formatMLday(observation.flowMlDay)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Seasonal median</p>
                <p className="text-lg font-semibold text-slate-400 font-mono">{formatMLday(observation.medianMlDay)}</p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
              <p className="text-2xl font-bold font-mono" style={{ color }}>
                {observation.ratio === null ? "No baseline" : `${Math.round(observation.ratio * 100)}% of normal`}
              </p>
              {meta && (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color }}>
                    {observation.ratio !== null && observation.ratio >= 1 ? "▲" : "▼"} {meta.label}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {Math.round(observation.percentile ?? 0)}th percentile in the seasonal comparison window ({meta.band})
                  </p>
                </>
              )}
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">90 days · daily mean ML/day</p>
              <Sparkline values={history.map((point) => point.flowMlDay)} median={observation.medianMlDay} color={color} />
              <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                <span>{history[0]?.date ?? "—"}</span>
                <span className="text-slate-500">— seasonal median</span>
                <span>{date.toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {[
                ["Observed level", observation.levelM === null ? "Not available" : `${observation.levelM.toFixed(2)} m`],
                ["Gauge", observation.stationName ?? observation.stationNumber ?? "Unknown"],
                ["Observation time", formatObservedAt(observation.observedAt)],
                ["BoM quality code", observation.qualityCode === null ? "Not supplied" : String(observation.qualityCode)],
              ].map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4 border-b border-slate-800/70 pb-1.5">
                  <span className="text-slate-500 shrink-0">{key}</span>
                  <span className="font-mono text-slate-300 text-right text-xs">{value}</span>
                </div>
              ))}
            </div>

            {observation.sourceUrl && (
              <a
                href={observation.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-sky-300 hover:text-sky-200"
              >
                Open official gauge record <ExternalLink size={12} />
              </a>
            )}
          </>
        )}

        <a
          href="https://www.bom.gov.au/australia/flood/"
          target="_blank"
          rel="noreferrer"
          className="flex gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] text-amber-200/80 hover:bg-amber-500/10"
        >
          <ShieldAlert size={15} className="shrink-0 mt-0.5" />
          <span>This map does not determine flood status. Check official BoM warnings before making safety decisions.</span>
        </a>
      </div>
    </div>
  );
}
