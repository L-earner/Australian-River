import { useEffect, useRef, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Play, Pause } from "lucide-react";

interface Props {
  daysBack: number; // 0 = today
  maxDays: number;
  onChange: (daysBack: number) => void;
}

const DAY = 86400000;

export default function TimeSlider({ daysBack, maxDays, onChange }: Props) {
  const [playing, setPlaying] = useState(false);
  const ref = useRef({ daysBack, onChange });
  ref.current = { daysBack, onChange };

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      const next = ref.current.daysBack - 1;
      if (next <= 0) {
        ref.current.onChange(0);
        setPlaying(false);
      } else {
        ref.current.onChange(next);
      }
    }, 130);
    return () => clearInterval(id);
  }, [playing]);

  const date = new Date(Date.now() - daysBack * DAY);

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[min(680px,72vw)] rounded-xl border border-slate-800 bg-[#0a111c]/90 backdrop-blur-md px-5 py-3 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            if (!playing && daysBack === 0) onChange(maxDays);
            setPlaying(!playing);
          }}
          className="shrink-0 w-8 h-8 rounded-full border border-slate-600 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-400 transition-colors"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
        </button>
        <Slider
          value={[maxDays - daysBack]}
          min={0}
          max={maxDays}
          step={1}
          onValueChange={([v]) => { setPlaying(false); onChange(maxDays - v); }}
          className="flex-1 [&_[data-slot=slider-track]]:bg-slate-700/70 [&_[data-slot=slider-range]]:bg-sky-500 [&_[data-slot=slider-thumb]]:border-sky-400"
        />
      </div>
      <div className="flex justify-between items-center mt-1.5 px-12">
        <span className="text-[10px] text-slate-500 font-mono">
          {new Date(Date.now() - maxDays * DAY).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
        </span>
        <span className="text-xs font-mono tracking-wider text-sky-300">
          {daysBack === 0 ? "TODAY · " : ""}
          {date.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }).toUpperCase()}
        </span>
        <span className="text-[10px] text-slate-500 font-mono">today</span>
      </div>
    </div>
  );
}
