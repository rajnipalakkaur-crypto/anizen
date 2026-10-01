import React, { useEffect, useState } from "react";
import { Play, X } from "lucide-react";

const SECONDS = 8;

export default function NextUpOverlay({ nextTitle, autoNext, onPlay, onCancel }) {
  const [left, setLeft] = useState(SECONDS);
  useEffect(() => {
    if (!autoNext) return;
    if (left <= 0) {
      onPlay();
      return;
    }
    const t = setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [left, autoNext, onPlay]);

  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-black/70 backdrop-blur-sm p-6" onClick={(e) => e.stopPropagation()}>
      <div className="text-center max-w-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Up next</p>
        <p className="font-display text-lg sm:text-2xl mt-3 line-clamp-2">{nextTitle}</p>
        {autoNext && (
          <div className="mx-auto mt-5 w-16 h-16 relative">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
              <circle cx="18" cy="18" r="16" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="100.5" strokeDashoffset={100.5 * (left / SECONDS)} style={{ transition: "stroke-dashoffset 1s linear" }} />
            </svg>
            <span className="absolute inset-0 grid place-items-center font-display">{left}</span>
          </div>
        )}
        <div className="flex gap-3 justify-center mt-6">
          <button onClick={onPlay} className="btn-primary h-11"><Play className="w-4 h-4 fill-white" /> Play now</button>
          <button onClick={onCancel} className="btn-ghost h-11"><X className="w-4 h-4" /> Cancel</button>
        </div>
      </div>
    </div>
  );
}