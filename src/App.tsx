import { useEffect, useMemo, useState } from "react";
import RiverMap, { type MapMode } from "@/components/RiverMap";
import RiverPanel from "@/components/RiverPanel";
import DamPanel from "@/components/DamPanel";
import Legend from "@/components/Legend";
import TimeSlider from "@/components/TimeSlider";
import Header from "@/components/Header";
import type { River } from "@/data/rivers";
import { getConditions, type ConditionsSnapshot } from "@/lib/api";

const MAX_DAYS = 180;

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function App() {
  const [daysBack, setDaysBack] = useState(0);
  const [mode, setMode] = useState<MapMode>("flow");
  const [river, setRiver] = useState<River | null>(null);
  const [damId, setDamId] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<ConditionsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const date = useMemo(() => new Date(Date.now() - daysBack * 86400000), [daysBack]);
  const dateKey = useMemo(() => localDateKey(date), [date]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      void getConditions(dateKey, controller.signal)
        .then(setSnapshot)
        .catch((requestError: unknown) => {
          if (requestError instanceof DOMException && requestError.name === "AbortError") return;
          setSnapshot(null);
          setError(requestError instanceof Error ? requestError.message : "Unable to load live water data.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [dateKey]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#05080e]">
      <RiverMap
        mode={mode}
        snapshot={snapshot}
        selectedId={river?.id ?? null}
        onSelectRiver={(r) => { setRiver(r); setDamId(null); }}
        onSelectDam={(id) => { setDamId(id); setRiver(null); }}
      />
      <Header mode={mode} onMode={setMode} snapshot={snapshot} loading={loading} error={error} />
      <Legend mode={mode} baselineYears={snapshot?.baselineYears ?? 10} />
      {river && (
        <RiverPanel
          river={river}
          date={date}
          dateKey={dateKey}
          summary={snapshot?.rivers[river.id] ?? null}
          onClose={() => setRiver(null)}
        />
      )}
      {damId && (
        <DamPanel
          damId={damId}
          summary={snapshot?.dams[damId] ?? null}
          onClose={() => setDamId(null)}
        />
      )}
      <TimeSlider daysBack={daysBack} maxDays={MAX_DAYS} onChange={setDaysBack} />
    </div>
  );
}

export default App;
