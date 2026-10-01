import React, { useMemo } from "react";
import PosterCarousel from "@/components/home/PosterCarousel";
import AnimeRow from "@/components/home/AnimeRow";
import ContinueWatchingRow from "@/components/home/ContinueWatchingRow";
import LatestEpisodesRow from "@/components/home/LatestEpisodesRow";
import GenreGrid from "@/components/home/GenreGrid";
import Section from "@/components/home/Section";
import ErrorState from "@/components/common/ErrorState";
import { useAnimeList } from "@/lib/queries";
import { allGenres } from "@/lib/anime";
import { useStored, KEYS } from "@/lib/storage";
import usePageMeta from "@/hooks/usePageMeta";

const by = (key) => (a, b) => (b[key] || 0) - (a[key] || 0);

export default function Home() {
  usePageMeta({});
  const { data: list = [], isLoading, isError, refetch } = useAnimeList();
  const watchlist = useStored(KEYS.watchlist);

  const rows = useMemo(() => {
    const featured = list.filter((a) => a.featured);
    const liked = new Set(list.filter((a) => watchlist.includes(a.id)).flatMap((a) => a.genres || []));
    const recommended = list
      .filter((a) => !watchlist.includes(a.id))
      .map((a) => ({ a, score: (a.genres || []).filter((g) => liked.has(g)).length * 10 + (a.rating || 0) }))
      .sort((x, y) => y.score - x.score)
      .map((x) => x.a);
    return {
      hero: (featured.length ? featured : list).slice(0, 5),
      trending: list.filter((a) => a.status === "Ongoing").sort(by("views")),
      recent: list,
      popular: [...list].sort(by("views")),
      topRated: [...list].sort(by("rating")),
      recommended,
      genres: allGenres(list).slice(0, 12),
    };
  }, [list, watchlist]);

  if (isError) return <div className="pt-28"><ErrorState onRetry={refetch} /></div>;

  return (
    <div>
      <PosterCarousel items={rows.hero} loading={isLoading} />
      <div className="relative">
        <ContinueWatchingRow animeList={list} />
        <AnimeRow title="Trending Now" subtitle="What everyone is watching this week" items={rows.trending} loading={isLoading} viewAll="/browse?status=Ongoing&sort=popular" />
        <AnimeRow title="Recently Added" items={rows.recent} loading={isLoading} viewAll="/browse?sort=latest" />
        <LatestEpisodesRow animeList={list} />
        <AnimeRow title="Popular Anime" items={rows.popular} loading={isLoading} viewAll="/browse?sort=popular" />
        <AnimeRow title="Recommended for You" subtitle="Based on your list" items={rows.recommended} loading={isLoading} />
        <AnimeRow title="Top Rated" items={rows.topRated} loading={isLoading} viewAll="/browse?sort=rating" />
        {rows.genres.length > 0 && (
          <Section title="Genres" viewAll="/genres">
            <GenreGrid genres={rows.genres} />
          </Section>
        )}
      </div>
    </div>
  );
}