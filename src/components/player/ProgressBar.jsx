import React from "react";

export default function ProgressBar({ time, duration, buffered, onSeek, markers = [] }) {
  const pct = duration ? (time / duration) * 100 : 0;
  const buf = duration ? (buffered / duration) * 100 : 0;
  return (
    <div className="group/bar relative h-5 flex items-center">
      <div className="relative w-full h-1 group-hover/bar:h-1.5 transition-all rounded-full bg-white/20 overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-white/25" style={{ width: `${buf}%` }} />
        <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent" style={{ width: `${pct}%` }} />
        {duration > 0 && markers.map((m) => (
          <div key={m} className="absolute inset-y-0 w-0.5 bg-amber-300/80" style={{ left: `${(m / duration) * 100}%` }} />
        ))}
      </div>
      <span className="pointer-events-none absolute w-3.5 h-3.5 -ml-[7px] rounded-full bg-white shadow-[0_0_12px_hsl(var(--primary))] scale-0 group-hover/bar:scale-100 transition-transform" style={{ left: `${pct}%` }} />
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={time}
        onChange={(e) => onSeek(Number(e.target.value))}
        aria-label="Seek"
        className="range-invisible absolute inset-0 w-full h-full"
      />
    </div>
  );
}