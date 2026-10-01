import React from "react";
import { Cast, Download } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function Group({ title, children }) {
  return (
    <div className="py-2.5 border-b border-white/5 last:border-0">
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">{title}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button onClick={onClick} className={`h-8 px-3 rounded-full text-xs transition-colors ${active ? "bg-primary text-white" : "bg-white/5 hover:bg-white/15 text-white/80"}`}>
      {children}
    </button>
  );
}

export default function PlayerMenu({ rate, setRate, qualities, quality, setQuality, subtitle, subtitleOn, setSubtitleOn, autoNext, setAutoNext, onDownload, downloading, castAvailable, casting, onCast, onStopCast }) {
  return (
    <div className="absolute bottom-16 right-2 sm:right-4 z-30 w-[260px] max-h-[70%] overflow-y-auto rounded-2xl bg-black/85 backdrop-blur-xl border border-white/10 px-4 py-2 text-white" onClick={(e) => e.stopPropagation()}>
      <Group title="Speed">
        {SPEEDS.map((s) => <Chip key={s} active={rate === s} onClick={() => setRate(s)}>{s === 1 ? "Normal" : `${s}x`}</Chip>)}
      </Group>
      {qualities.length > 0 && (
        <Group title="Quality">
          {qualities.map((q) => <Chip key={q} active={quality === q} onClick={() => setQuality(q)}>{q}</Chip>)}
        </Group>
      )}
      <Group title="Cast">
        {castAvailable ? (
          <button
            onClick={casting ? onStopCast : onCast}
            className={`h-8 px-3.5 rounded-full text-xs inline-flex items-center gap-1.5 ${casting ? "bg-primary text-white" : "bg-white/5 hover:bg-white/15 text-white/90"}`}
          >
            <Cast className="w-3.5 h-3.5" />
            {casting ? "Stop casting" : "Cast to device"}
          </button>
        ) : (
          <span className="text-xs text-white/40 self-center">Open on Chrome with a Cast device to enable</span>
        )}
      </Group>
      <Group title="Download">
        <button
          onClick={onDownload}
          disabled={downloading}
          className="h-8 px-3.5 rounded-full text-xs bg-white/5 hover:bg-white/15 disabled:opacity-50 inline-flex items-center gap-1.5 text-white/90"
        >
          <Download className="w-3.5 h-3.5" />
          {downloading ? "Preparing…" : `Download ${quality || "episode"}`}
        </button>
      </Group>
      <Group title="Subtitles">
        <Chip active={!subtitleOn} onClick={() => setSubtitleOn(false)}>Off</Chip>
        {subtitle ? <Chip active={subtitleOn} onClick={() => setSubtitleOn(true)}>{subtitle}</Chip> : <span className="text-xs text-white/40 self-center">None available</span>}
      </Group>
      <div className="py-3 flex items-center justify-between">
        <span className="text-sm">Auto-next</span>
        <Switch checked={autoNext} onCheckedChange={setAutoNext} />
      </div>
    </div>
  );
}