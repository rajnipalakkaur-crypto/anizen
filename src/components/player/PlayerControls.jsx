import React from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize, Minimize, PictureInPicture2, Settings, Subtitles, RotateCcw, RotateCw, Smartphone, Monitor, Cast, Download } from "lucide-react";
import ProgressBar from "./ProgressBar";
import { formatTime } from "@/lib/anime";

const Btn = ({ label, onClick, disabled, children, className = "" }) => (
  <button onClick={onClick} disabled={disabled} aria-label={label} title={label} className={`w-8 h-8 sm:w-10 sm:h-10 shrink-0 grid place-items-center rounded-full hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-transparent transition-colors ${className}`}>
    {children}
  </button>
);

export default function PlayerControls({ s, a }) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 px-2 sm:px-5 pb-2 sm:pb-3 pt-12 sm:pt-16 bg-gradient-to-t from-black/90 via-black/50 to-transparent" onClick={(e) => e.stopPropagation()}>
      <ProgressBar time={s.time} duration={s.duration} buffered={s.buffered} onSeek={a.seek} markers={s.markers} />
      <div className="flex flex-wrap items-center gap-y-1 gap-x-0 sm:gap-x-1 mt-1 text-white">
        <Btn label="Previous episode (Shift+P)" onClick={a.prev} disabled={!a.prev}><SkipBack className="w-4 h-4 fill-current" /></Btn>
        <Btn label={s.playing ? "Pause (K)" : "Play (K)"} onClick={a.toggle}>
          {s.playing ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
        </Btn>
        <Btn label="Next episode (Shift+N)" onClick={a.next} disabled={!a.next}><SkipForward className="w-4 h-4 fill-current" /></Btn>
        <Btn label="Back 10s (←)" onClick={() => a.skip(-10)} className="hidden sm:grid"><RotateCcw className="w-4 h-4" /></Btn>
        <Btn label="Forward 10s (→)" onClick={() => a.skip(10)} className="hidden sm:grid"><RotateCw className="w-4 h-4" /></Btn>
        <div className="group/vol flex items-center">
          <Btn label="Mute (M)" onClick={a.toggleMute}>
            {s.muted || s.volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Btn>
          <input type="range" min={0} max={1} step={0.05} value={s.muted ? 0 : s.volume} onChange={(e) => a.setVolume(Number(e.target.value))} aria-label="Volume" className="hidden sm:block w-0 group-hover/vol:w-20 focus:w-20 transition-all accent-[hsl(256,100%,68%)] h-1" />
        </div>
        <span className="text-[10px] sm:text-xs tabular-nums text-white/80 ml-1 sm:ml-1.5 whitespace-nowrap">{formatTime(s.time)} <span className="text-white/40 hidden sm:inline">/ {formatTime(s.duration)}</span></span>
        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
          {s.hasSubtitle && (
            <Btn label="Subtitles (C)" onClick={a.toggleSubtitle} className={s.subtitleOn ? "text-accent" : ""}><Subtitles className="w-5 h-5" /></Btn>
          )}
          <Btn label="Settings" onClick={a.toggleMenu} className={s.menuOpen ? "bg-white/15" : ""}><Settings className={`w-5 h-5 transition-transform duration-500 ${s.menuOpen ? "rotate-90" : ""}`} /></Btn>
          <Btn label="Download episode (D)" onClick={a.download} disabled={s.downloading} className="hidden sm:grid"><Download className="w-5 h-5" /></Btn>
          <Btn label={s.casting ? "Stop casting" : "Cast to device"} onClick={s.casting ? a.stopCast : a.cast} className={`hidden sm:grid ${s.casting ? "text-accent" : ""}`}>
            <Cast className="w-5 h-5" />
          </Btn>
          {s.pipSupported && <Btn label="Picture in picture" onClick={a.pip} className="hidden sm:grid"><PictureInPicture2 className="w-5 h-5" /></Btn>}
          <Btn label="Toggle portrait / landscape" onClick={a.togglePortrait} className={s.portrait ? "text-accent" : ""}>
            {s.portrait ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          </Btn>
          <Btn label="Fullscreen (F)" onClick={a.fullscreen}>
            {s.fullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </Btn>
        </div>
      </div>
    </div>
  );
}