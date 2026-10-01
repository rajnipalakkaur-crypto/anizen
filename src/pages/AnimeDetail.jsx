import React from "react";
import { useParams, Link } from "react-router-dom";
import { Film } from "lucide-react";
import DetailHeader from "@/components/anime/DetailHeader";
import EpisodeList from "@/components/anime/EpisodeList";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import { useAnime, useEpisodes } from "@/lib/queries";
import { useStored, KEYS } from "@/lib/storage";
import usePageMeta from "@/hooks/usePageMeta";

export default function AnimeDetail() {
  const { slug } = useParams();
  const { data: anime, isLoading, isError, refetch } = useAnime(slug);
  const eps = useEpisodes(anime?.id);
  const history = useStored(KEYS.history);
  usePageMeta({ title: anime?.title, description: anime?.description, image: anime?.banner_url });

  if (isLoading) return <div className="skeleton h-[70vh] w-full" />;
  if (isError) return <div className="pt-32"><ErrorState onRetry={refetch} /></div>;
  if (!anime)
    return (
      <div className="pt-32">
        <EmptyState icon={Film} title="Anime not found" text="It may have been removed or the link is incorrect.">
          <Link to="/browse" className="btn-primary">Browse anime</Link>
        </EmptyState>
      </div>
    );

  const episodes = eps.data || [];
  const last = Object.values(history).filter((h) => h.anime_id === anime.id).sort((a, b) => b.updated_at - a.updated_at)[0];

  return (
    <div>
      <DetailHeader anime={anime} firstEpisode={episodes[0]?.episode_number} resume={last && !last.completed ? last.episode_number : null} />
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 mt-16">
        <h2 className="font-display text-xl md:text-2xl font-semibold mb-6">Episodes <span className="text-white/40 text-base">({episodes.length})</span></h2>
        <div className="max-w-4xl">
          {eps.isLoading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
          ) : eps.isError ? (
            <ErrorState onRetry={eps.refetch} />
          ) : episodes.length ? (
            <EpisodeList anime={anime} episodes={episodes} />
          ) : (
            <EmptyState icon={Film} title="No episodes yet" text="Episodes will appear here once they're published." />
          )}
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "TVSeries", name: anime.title, description: anime.description, image: anime.poster_url, numberOfEpisodes: anime.total_episodes }) }} />
    </div>
  );
}