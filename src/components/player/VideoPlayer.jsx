import React, { useEffect, useRef, useState } from "react";
import { Loader2, Play } from "lucide-react";
import PlayerControls from "./PlayerControls";
import PlayerMenu from "./PlayerMenu";
import NextUpOverlay from "./NextUpOverlay";
import SourceError from "./SourceError";
import ServerBar from "./ServerBar";
import useFullscreen from "./useFullscreen";
import usePlayerKeys from "./usePlayerKeys";
import useCast from "./useCast";
import { toast } from "sonner";
import { useStored, KEYS, setPref } from "@/lib/storage";

export default function VideoPlayer({ servers, episode, title, startTime = 0, onPrev, onNext, nextTitle, onProgress, onPlayback, remoteCommand }) {
  const videoRef = useRef(null);
  const wrapRef = useRef(null);
  const pendingSeek = useRef(startTime);
  const lastSaved = useRef(0);
  const lastPush = useRef(0);
  const hideTimer = useRef(null);
  const prefs = useStored(KEYS.prefs);

  const [serverName, setServerName] = useState(servers[0].server_name);
  const [quality, setQuality] = useState(servers[0].quality);
  const [st, setSt] = useState({ playing: false, time: 0, duration: episode.duration || 0, buffered: 0, loading: true });
  const [volume, setVolumeState] = useState(prefs.volume ?? 1);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState(false);
  const [ended, setEnded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showUi, setShowUi] = useState(true);
  const [subtitleOn, setSubtitleOn] = useState(true);
  const [portrait, setPortrait] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [fullscreen, toggleFullscreen] = useFullscreen(wrapRef, videoRef);
  const { available: castAvailable, casting, castMedia, stopCast } = useCast();

  const group = servers.filter((s) => s.server_name === serverName);
  const source = group.find((s) => s.quality === quality) || group[0];
  const qualities = [...new Set(group.map((s) => s.quality).filter(Boolean))];
  const v = () => videoRef.current;

  const switchSource = (name, q) => {
    pendingSeek.current = v()?.currentTime || pendingSeek.current;
    const g = servers.filter((s) => s.server_name === name);
    setServerName(name);
    setQuality(q && g.some((s) => s.quality === q) ? q : g[0].quality);
    setError(false);
    setSt((p) => ({ ...p, loading: true }));
  };

  useEffect(() => {
    const el = v();
    if (!el) return;
    el.volume = volume;
    el.muted = muted;
  }, [volume, muted]);

  // Watch party: a guest follows the host's playhead, server and pause state.
  useEffect(() => {
    if (!remoteCommand) return;
    const el = v();
    if (!el) return;
    if (remoteCommand.server && remoteCommand.server !== serverName && servers.some((s) => s.server_name === remoteCommand.server)) {
      switchSource(remoteCommand.server, quality);
    }
    const t = Number(remoteCommand.time);
    if (isFinite(t) && Math.abs(el.currentTime - t) > 2.5) el.currentTime = t;
    if (remoteCommand.playing && el.paused) {
      const start = () => el.play().catch(() => {
        // Browsers block unmuted autoplay — start muted so the party stays in sync.
        if (el.muted) return;
        el.muted = true;
        setMuted(true);
        toast.message("Playing in sync — tap the volume icon for sound");
        el.play().catch(() => {});
      });
      if (el.readyState >= 2) start();
      else el.addEventListener("canplay", start, { once: true });
    }
    if (!remoteCommand.playing && !el.paused) el.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteCommand?.nonce]);

  useEffect(() => {
    const tracks = v()?.textTracks;
    if (tracks?.[0]) tracks[0].mode = subtitleOn ? "showing" : "hidden";
  }, [subtitleOn, source?.subtitle_url]);

  const bump = () => {
    setShowUi(true);
    clearTimeout(hideTimer.current);
    // Auto-hide only where a pointer can bring the controls back (mouse or touch).
    // TVs/keyboard-only devices keep them on screen permanently.
    hideTimer.current = setTimeout(() => {
      const canPoint = window.matchMedia("(hover: hover)").matches || "ontouchstart" in window;
      if (canPoint && !v()?.paused) setShowUi(false);
    }, 3000);
  };
  useEffect(() => () => clearTimeout(hideTimer.current), []);

  // Keep controls visible while the window is being resized
  useEffect(() => {
    const onResize = () => bump();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = (completed = false) => {
    const el = v();
    if (el && el.duration) onProgress(completed ? el.duration : el.currentTime, el.duration, completed || el.currentTime / el.duration > 0.92);
  };

  // Save the current server/quality file: real download when the host allows it,
  // otherwise open it so the browser can still save it.
  const download = () => {
    const ext = (source.video_url.split("?")[0].match(/\.(mp4|mkv|webm|m4v|mov)$/i)?.[1] || "mp4").toLowerCase();
    if (/\.m3u8(\?|$)/i.test(source.video_url)) {
      toast.error("This server streams in HLS. Pick another server to download.");
      return;
    }
    const name = `${title} - EP ${episode.episode_number} [${source.quality}]`.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim() + `.${ext}`;
    const save = (href, revoke) => {
      const a = document.createElement("a");
      a.href = href;
      a.download = name;
      a.target = "_blank";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      if (revoke) setTimeout(() => URL.revokeObjectURL(href), 60000);
    };
    const id = toast.loading("Preparing download…");
    setDownloading(true);
    fetch(source.video_url)
      .then((r) => { if (!r.ok) throw new Error("failed"); return r.blob(); })
      .then((blob) => { save(URL.createObjectURL(blob), true); toast.success("Download started", { id }); })
      .catch(() => { save(source.video_url, false); toast.message("Opened in a new tab — save the file from there.", { id }); })
      .finally(() => setDownloading(false));
  };

  const actions = {
    toggle: () => { const el = v(); if (!el) return; el.paused ? el.play().catch(() => {}) : el.pause(); },
    seek: (t) => {
      const el = v();
      if (el) el.currentTime = t;
      setSt((p) => ({ ...p, time: t }));
      onPlayback?.({ playing: el ? !el.paused : false, time: t, server: serverName });
    },
    skip: (d) => { const el = v(); if (el) el.currentTime = Math.max(0, Math.min(el.duration || 0, el.currentTime + d)); },
    setVolume: (val) => { setVolumeState(val); setMuted(val === 0); setPref({ volume: val }); },
    volumeBy: (d) => actions.setVolume(Math.max(0, Math.min(1, Math.round((volume + d) * 100) / 100))),
    toggleMute: () => setMuted((m) => !m),
    toggleSubtitle: () => source?.subtitle_url && setSubtitleOn((s) => !s),
    toggleMenu: () => setMenuOpen((o) => !o),
    togglePortrait: () => setPortrait((p) => !p),
    download,
    fullscreen: toggleFullscreen,
    pip: () => { const el = v(); if (!el) return; document.pictureInPictureElement ? document.exitPictureInPicture() : el.requestPictureInPicture().catch(() => {}); },
    cast: async () => {
      const ok = await castMedia({ url: source.video_url, title, poster: episode.thumbnail_url || episode.poster_url });
      if (ok) {
        v()?.pause();
        toast.success("Casting to your device");
      } else {
        toast.error("Cast isn't ready yet. Make sure you're on Chrome with a Cast device nearby.");
      }
    },
    stopCast,
    prev: onPrev,
    next: onNext,
    bump,
  };
  usePlayerKeys(actions);

  const introEnd = episode.intro_end || 0;
  const inIntro = introEnd > 0 && st.time >= (episode.intro_start || 0) && st.time < introEnd;
  const outro = episode.outro_start || 0;
  const inOutro = outro > 0 && st.time >= outro && st.time < st.duration - 1 && !ended;
  const skipOutro = () => (onNext ? onNext() : actions.seek(st.duration));

  return (
    <div>
      <div
        ref={wrapRef}
        className={`relative w-full bg-black overflow-hidden select-none ${fullscreen ? "h-screen" : portrait ? "aspect-[9/16] max-w-[460px] mx-auto rounded-3xl glow" : "aspect-video rounded-none sm:rounded-3xl glow"} ${showUi || !st.playing ? "" : "cursor-none"}`}
        onMouseMove={bump}
        onTouchStart={bump}
        onClick={() => { if (menuOpen) setMenuOpen(false); else actions.toggle(); }}
        onDoubleClick={toggleFullscreen}
      >
        <video
          ref={videoRef}
          key={source.id}
          src={source.video_url}
          className="absolute inset-0 w-full h-full object-contain"
          playsInline
          preload="metadata"
          crossOrigin={source.subtitle_url ? "anonymous" : undefined}
          onLoadedMetadata={(e) => {
            const el = e.currentTarget;
            el.playbackRate = prefs.rate || 1;
            el.volume = volume;
            el.muted = muted;
            if (pendingSeek.current > 0 && pendingSeek.current < el.duration - 5) el.currentTime = pendingSeek.current;
            pendingSeek.current = 0;
            setSt((p) => ({ ...p, duration: el.duration, loading: false }));
            el.play().catch(() => {});
          }}
          onTimeUpdate={(e) => {
            const el = e.currentTarget;
            const buffered = el.buffered.length ? el.buffered.end(el.buffered.length - 1) : 0;
            setSt((p) => ({ ...p, time: el.currentTime, buffered }));
            if (Math.abs(el.currentTime - lastSaved.current) >= 5) { lastSaved.current = el.currentTime; save(); }
            if (!el.paused && Date.now() - lastPush.current > 2000) {
              lastPush.current = Date.now();
              onPlayback?.({ playing: true, time: el.currentTime, server: serverName });
            }
          }}
          onPlay={(e) => { setSt((p) => ({ ...p, playing: true })); setEnded(false); bump(); onPlayback?.({ playing: true, time: e.currentTarget.currentTime, server: serverName }); }}
          onPause={(e) => { setSt((p) => ({ ...p, playing: false })); setShowUi(true); save(); onPlayback?.({ playing: false, time: e.currentTarget.currentTime, server: serverName }); }}
          onWaiting={() => setSt((p) => ({ ...p, loading: true }))}
          onPlaying={() => setSt((p) => ({ ...p, loading: false }))}
          onEnded={() => { save(true); setEnded(true); setShowUi(true); }}
          onError={() => { setError(true); setSt((p) => ({ ...p, loading: false })); }}
        >
          {source.subtitle_url && <track kind="subtitles" src={source.subtitle_url} srcLang="en" label={source.subtitle_label || "Subtitles"} default />}
        </video>

        <div className={`absolute top-0 inset-x-0 z-20 p-4 sm:p-6 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 ${showUi ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <p className="text-[11px] uppercase tracking-[0.25em] text-accent">Episode {episode.episode_number}</p>
          <p className="font-display text-sm sm:text-lg mt-1 truncate">{title}</p>
        </div>

        {st.loading && !error && <Loader2 className="absolute inset-0 m-auto w-10 h-10 animate-spin text-primary z-10" />}
        {!st.playing && !st.loading && !ended && !error && (
          <span className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/90 grid place-items-center z-10 glow pointer-events-none">
            <Play className="w-7 h-7 fill-white ml-1" />
          </span>
        )}

        {(inIntro || inOutro) && (
          <button onClick={(e) => { e.stopPropagation(); inIntro ? actions.seek(introEnd) : skipOutro(); }} className="absolute right-4 sm:right-6 bottom-24 z-20 h-10 px-5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition">
            {inIntro ? "Skip Intro" : "Skip Outro"}
          </button>
        )}

        <div className={`transition-opacity duration-300 ${showUi ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <PlayerControls
            s={{ ...st, volume, muted, fullscreen, portrait, menuOpen, subtitleOn, downloading, hasSubtitle: !!source.subtitle_url, pipSupported: !!document.pictureInPictureEnabled, castAvailable, casting, markers: [introEnd, outro].filter(Boolean) }}
            a={actions}
          />
        </div>

        {menuOpen && (
          <PlayerMenu
            rate={prefs.rate || 1}
            setRate={(r) => { setPref({ rate: r }); if (v()) v().playbackRate = r; }}
            qualities={qualities}
            quality={source.quality}
            onDownload={actions.download}
            downloading={downloading}
            castAvailable={castAvailable}
            casting={casting}
            onCast={actions.cast}
            onStopCast={stopCast}
            setQuality={(q) => switchSource(serverName, q)}
            subtitle={source.subtitle_url ? source.subtitle_label || "Subtitles" : null}
            subtitleOn={subtitleOn}
            setSubtitleOn={setSubtitleOn}
            autoNext={prefs.autoNext}
            setAutoNext={(val) => setPref({ autoNext: val })}
          />
        )}

        {error && (
          <SourceError
            others={[...new Set(servers.map((s) => s.server_name))].filter((n) => n !== serverName)}
            onSwitch={(n) => switchSource(n, quality)}
            onRetry={() => { setError(false); setSt((p) => ({ ...p, loading: true })); v()?.load(); }}
          />
        )}

        {ended && onNext && (
          <NextUpOverlay nextTitle={nextTitle} autoNext={prefs.autoNext} onPlay={onNext} onCancel={() => setEnded(false)} />
        )}
      </div>
      <ServerBar servers={servers} current={serverName} onSelect={(n) => switchSource(n, quality)} />
    </div>
  );
}