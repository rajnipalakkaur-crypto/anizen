import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SearchX } from "lucide-react";
import FilterBar from "@/components/browse/FilterBar";
import AnimeCard from "@/components/anime/AnimeCard";
import CardSkeleton from "@/components/anime/CardSkeleton";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import { useAnimeList } from "@/lib/queries";
import { allGenres } from "@/lib/anime";
import { filterAnime } from "@/lib/filterAnime";
import { addRecentSearch } from "@/lib/storage";
import usePageMeta from "@/hooks/usePageMeta";

const KEYS = ["q", "genre", "year", "rating", "status", "type", "lang", "sort"];
const PAGE = 24;
const TITLES = { latest: "Latest", popular: "Popular", rating: "Top Rated" };

export default function Browse() {
  const [sp, setSp] = useSearchParams();
  const params = Object.fromEntries(KEYS.map((k) => [k, sp.get(k) || ""]));
  const [q, setQ] = useState(params.q);
  const [limit, setLimit] = useState(PAGE);
  const { data: list = [], isLoading, isError, refetch } = useAnimeList();

  const heading = params.q ? `Results for “${params.q}”` : params.genre || TITLES[params.sort] || "Browse";
  usePageMeta({ title: heading });

  const set = (k, v) => {
    const next = new URLSearchParams(sp);
    v ? next.set(k, v) : next.delete(k);
    setSp(next, { replace: true });
    setLimit(PAGE);
  };

  useEffect(() => setQ(params.q), [params.q]);
  useEffect(() => {
    const t = setTimeout(() => {
      if (q.trim() !== params.q) {
        set("q", q.trim());
        if (q.trim().length > 1) addRecentSearch(q);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  const genres = useMemo(() => allGenres(list).map((g) => g.name), [list]);
  const years = useMemo(() => [...new Set(list.map((a) => a.release_year).filter(Boolean))].sort((a, b) => b - a), [list]);
  const results = useMemo(() => filterAnime(list, params), [list, sp]); // eslint-disable-line react-hooks/exhaustive-deps
  const hasFilters = KEYS.some((k) => params[k]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-24 md:pt-32">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">{heading}</h1>
          <p className="text-white/45 mt-2 text-sm">{isLoading ? "Loading catalog…" : `${results.length} ${results.length === 1 ? "title" : "titles"}`}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <label className="flex items-center gap-3 h-12 px-5 rounded-full glass focus-within:ring-2 ring-primary/50 transition">
          <Search className="w-4 h-4 text-white/50" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title, alt title, genre or studio" className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/30" maxLength={80} />
        </label>
        <FilterBar params={params} set={set} genres={genres} years={years} />
        {hasFilters && (
          <button onClick={() => { setSp({}); setQ(""); }} className="self-start text-xs text-primary hover:underline">Clear all filters</button>
        )}
      </div>

      <div className="mt-10">
        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : results.length === 0 ? (
          <EmptyState icon={SearchX} title="No anime found" text="Try a different title or loosen your filters." />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {results.slice(0, limit).map((a) => <AnimeCard key={a.id} anime={a} />)}
            </div>
            {results.length > limit && (
              <div className="flex justify-center mt-12">
                <button onClick={() => setLimit((l) => l + PAGE)} className="btn-ghost">Load more</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}