import React from "react";
import Section from "./Section";
import EpisodeTile from "./EpisodeTile";
import { useStored, KEYS, removeHistory } from "@/lib/storage";
import { episodeUrl, formatTime } from "@/lib/anime";

export function useContinueWatching(animeList) {
  const history = useStored(KEYS.history);
  const byId = Object.fromEntries((animeList || []).map((a) => [a.id, a]));
  return Object.entries(history)
    .map(([episodeId, h]) => ({ episodeId, ...h, anime: byId[h.anime_id] }))
    .filter((h) => h.anime && !h.completed)
    .sort((a, b) => b.updated_at - a.updated_at);
}

export default function ContinueWatchingRow({ animeList }) {
  const items = useContinueWatching(animeList);
  if (!items.length) return null;
  return (
    <Section title="Continue Watching" subtitle="Pick up right where you left off" viewAll="/my-list">
      <div className="flex gap-4 md:gap-5 overflow-x-auto no-scrollbar snap-x -mx-4 px-4 md:mx-0 md:px-0 pb-2">
        {items.slice(0, 12).map((h) => (
          <EpisodeTile
            key={h.episodeId}
            className="w-[72vw] sm:w-[300px] shrink-0 snap-start"
            to={episodeUrl(h.anime.slug, h.episode_number)}
            image={h.thumbnail_url || h.anime.banner_url}
            title={h.anime.title}
            subtitle={`Episode ${h.episode_number} · ${formatTime(h.progress)} of ${formatTime(h.duration)}`}
            progress={h.duration ? h.progress / h.duration : 0}
            onRemove={() => removeHistory(h.episodeId)}
          />
        ))}
      </div>
    </Section>
  );
}