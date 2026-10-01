import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, History, X } from "lucide-react";
import AnimeCard from "@/components/anime/AnimeCard";
import CardSkeleton from "@/components/anime/CardSkeleton";
import EpisodeTile from "@/components/home/EpisodeTile";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import { useAnimeList } from "@/lib/queries";
import { useStored, KEYS, toggleWatchlist, removeHistory, clearHistory } from "@/lib/storage";
import { episodeUrl, formatTime } from "@/lib/anime";
import usePageMeta from "@/hooks/usePageMeta";

export default function MyList() {
  usePageMeta({ title: "My List" });
  const [tab, setTab] = useState("watchlist");
  const { data: list = [], isLoading, isError, refetch } = useAnimeList();
  const watchlist = useStored(KEYS.watchlist);
  const history = useStored(KEYS.history);
  const byId = Object.fromEntries(list.map((a) => [a.id, a]));
  const saved = watchlist.map((id) => byId[id]).filter(Boolean);
  const watched = Object.entries(history).map(([id, h]) => ({ id, ...h, anime: byId[h.anime_id] })).filter((h) => h.anime).sort((a, b) => b.updated_at - a.updated_at);

  const tabs = [["watchlist", "Watchlist", saved.length], ["history", "History", watched.length]];

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-24 md:pt-32">
      <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">My List</h1>
      <p className="text-white/45 mt-2 text-sm">Saved on this device.</p>
      <div className="flex gap-2 mt-8">
        {tabs.map(([k, label, n]) => (
          <button key={k} onClick={() => setTab(k)} className={`h-11 px-5 rounded-full text-sm transition-all ${tab === k ? "bg-primary text-white glow" : "glass text-white/60 hover:text-white"}`}>
            {label} <span className="opacity-60 ml-1">{n}</span>
          </button>
        ))}
        {tab === "history" && watched.length > 0 && (
          <button onClick={clearHistory} className="ml-auto text-xs text-white/50 hover:text-white">Clear history</button>
        )}
      </div>
      <div className="mt-10">
        {isError ? <ErrorState onRetry={refetch} /> : isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">{Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}</div>
        ) : tab === "watchlist" ? (
          saved.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {saved.map((a) => (
                <div key={a.id} className="relative group">
                  <AnimeCard anime={a} />
                  <button onClick={() => toggleWatchlist(a.id)} aria-label={`Remove ${a.title}`} className="absolute top-2 right-2 w-8 h-8 rounded-full glass grid place-items-center md:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Bookmark} title="Your watchlist is empty" text="Save anime to watch later."><Link to="/browse" className="btn-primary">Browse anime</Link></EmptyState>
          )
        ) : watched.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {watched.map((h) => (
              <EpisodeTile key={h.id} to={episodeUrl(h.anime.slug, h.episode_number)} image={h.thumbnail_url || h.anime.banner_url} title={`${h.anime.title} · EP ${h.episode_number}`} subtitle={h.completed ? "Completed" : `${formatTime(h.progress)} of ${formatTime(h.duration)}`} progress={h.completed ? 1 : h.duration ? h.progress / h.duration : 0} onRemove={() => removeHistory(h.id)} />
            ))}
          </div>
        ) : (
          <EmptyState icon={History} title="No watch history" text="Episodes you watch will show up here." />
        )}
      </div>
    </div>
  );
}