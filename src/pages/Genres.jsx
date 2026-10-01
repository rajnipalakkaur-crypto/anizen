import React from "react";
import { Tags } from "lucide-react";
import GenreGrid from "@/components/home/GenreGrid";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import { useAnimeList } from "@/lib/queries";
import { allGenres } from "@/lib/anime";
import usePageMeta from "@/hooks/usePageMeta";

export default function Genres() {
  usePageMeta({ title: "Genres", description: "Explore anime by genre on AniZen." });
  const { data: list = [], isLoading, isError, refetch } = useAnimeList();
  const genres = allGenres(list);
  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-24 md:pt-32">
      <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">Genres</h1>
      <p className="text-white/45 mt-2 text-sm">Find your next obsession by mood.</p>
      <div className="mt-10">
        {isError ? <ErrorState onRetry={refetch} /> : isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
          </div>
        ) : genres.length ? <GenreGrid genres={genres} /> : <EmptyState icon={Tags} title="No genres yet" />}
      </div>
    </div>
  );
}