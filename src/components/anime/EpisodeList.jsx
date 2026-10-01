import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Play } from "lucide-react";
import { Image } from "@/components/ui/image";
import { useStored, KEYS } from "@/lib/storage";
import { episodeUrl, formatDuration } from "@/lib/anime";

export default function EpisodeList({ anime, episodes, currentId, compact }) {
  const [q, setQ] = useState("");
  const [lang, setLang] = useState("all");
  const history = useStored(KEYS.history);
  const shown = episodes.filter(
    (e) =>
      (!q || String(e.episode_number) === q.trim() || e.title.toLowerCase().includes(q.toLowerCase())) &&
      (lang === "all" || (lang === "dub" ? e.has_dub : e.has_sub))
  );

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <label className="flex-1 min-w-0 flex items-center gap-2 h-10 px-4 rounded-full glass">
          <Search className="w-4 h-4 text-white/40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Episode # or title" className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder:text-white/30" />
        </label>
        {["all", "sub", "dub"].map((l) => (
          <button key={l} onClick={() => setLang(l)} className={`h-10 px-3.5 rounded-full text-xs uppercase tracking-wider transition-colors ${lang === l ? "bg-primary text-white" : "glass text-white/60"}`}>{l}</button>
        ))}
      </div>
      {shown.length === 0 && <p className="text-sm text-white/40 py-8 text-center">No episodes match.</p>}
      <ul className={`space-y-2 ${compact ? "max-h-[70vh] overflow-y-auto pr-1" : ""}`}>
        {shown.map((e) => {
          const h = history[e.id];
          const pct = h?.completed ? 1 : h?.duration ? h.progress / h.duration : 0;
          const active = e.id === currentId;
          return (
            <li key={e.id}>
              <Link to={episodeUrl(anime.slug, e.episode_number)} className={`group flex gap-4 p-2.5 rounded-2xl transition-colors ${active ? "bg-primary/15 ring-1 ring-primary/40" : "hover:bg-white/5"}`}>
                <div className="relative w-32 sm:w-40 aspect-video rounded-xl overflow-hidden bg-secondary shrink-0">
                  <Image src={e.thumbnail_url || anime.banner_url} alt="" className="absolute inset-0 w-full h-full" />
                  <span className="absolute bottom-1.5 right-1.5 text-[10px] px-1.5 py-0.5 rounded bg-black/70">{formatDuration(e.duration)}</span>
                  {pct > 0 && <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20"><div className="h-full bg-primary" style={{ width: `${pct * 100}%` }} /></div>}
                </div>
                <div className="min-w-0 flex-1 py-1">
                  <p className="text-xs text-primary font-medium">Episode {e.episode_number}</p>
                  <p className="text-sm font-medium truncate mt-0.5">{e.title}</p>
                  <div className="flex gap-1.5 mt-2">
                    {e.has_sub && <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/15 text-accent">SUB</span>}
                    {e.has_dub && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">DUB</span>}
                  </div>
                </div>
                {!compact && (
                  <span className="hidden sm:flex self-center items-center gap-2 h-9 px-4 rounded-full bg-white/5 group-hover:bg-primary text-xs transition-colors">
                    <Play className="w-3.5 h-3.5 fill-current" /> Watch
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}