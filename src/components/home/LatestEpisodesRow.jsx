import React from "react";
import Section from "./Section";
import EpisodeTile from "./EpisodeTile";
import { useLatestEpisodes } from "@/lib/queries";
import { episodeUrl, formatDuration } from "@/lib/anime";

export default function LatestEpisodesRow({ animeList }) {
  const { data: episodes = [], isLoading } = useLatestEpisodes();
  const byId = Object.fromEntries((animeList || []).map((a) => [a.id, a]));
  const items = episodes.filter((e) => byId[e.anime_id]);
  if (!isLoading && !items.length) return null;
  return (
    <Section title="Latest Episodes" subtitle="Fresh drops from the universe">
      <div className="flex gap-4 md:gap-5 overflow-x-auto no-scrollbar snap-x -mx-4 px-4 md:mx-0 md:px-0 pb-2">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton w-[72vw] sm:w-[300px] aspect-video rounded-2xl shrink-0" />)
          : items.map((e) => {
              const a = byId[e.anime_id];
              return (
                <EpisodeTile
                  key={e.id}
                  className="w-[72vw] sm:w-[300px] shrink-0 snap-start"
                  to={episodeUrl(a.slug, e.episode_number)}
                  image={e.thumbnail_url || a.banner_url}
                  title={`${a.title} · EP ${e.episode_number}`}
                  subtitle={`${e.title}${e.duration ? " · " + formatDuration(e.duration) : ""}`}
                />
              );
            })}
      </div>
    </Section>
  );
}