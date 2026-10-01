import React from "react";
import { Link } from "react-router-dom";
import { Play, Star } from "lucide-react";
import { Image } from "@/components/ui/image";
import WatchlistButton from "@/components/home/WatchlistButton";
import ShareButton from "./ShareButton";
import { episodeUrl } from "@/lib/anime";

export default function DetailHeader({ anime, firstEpisode, resume }) {
  const meta = [
    ["Studio", anime.studio],
    ["Released", anime.release_year],
    ["Status", anime.status],
    ["Type", anime.type],
    ["Episodes", anime.total_episodes],
  ].filter(([, v]) => v);
  const watchTo = resume ? episodeUrl(anime.slug, resume) : firstEpisode ? episodeUrl(anime.slug, firstEpisode) : null;

  return (
    <section className="relative">
      <div className="absolute inset-0 h-[70vh] overflow-hidden">
        <Image src={anime.banner_url || anime.poster_url} alt="" className="w-full h-full opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
      </div>
      <div className="relative max-w-[1400px] mx-auto px-4 md:px-8 pt-28 md:pt-40 flex flex-col md:flex-row gap-8 md:gap-12">
        <Image src={anime.poster_url} alt={anime.title} className="w-44 md:w-64 aspect-[2/3] rounded-2xl shrink-0 glow" />
        <div className="max-w-3xl">
          <h1 className="font-display text-3xl md:text-5xl font-semibold tracking-tight leading-tight">{anime.title}</h1>
          {anime.alt_title && <p className="text-white/50 mt-2">{anime.alt_title}</p>}
          <div className="flex flex-wrap items-center gap-2 mt-5">
            <span className="flex items-center gap-1 px-3 py-1 rounded-full glass text-sm"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {Number(anime.rating || 0).toFixed(1)}</span>
            {anime.has_sub && <span className="text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground font-semibold">SUB</span>}
            {anime.has_dub && <span className="text-xs px-2.5 py-1 rounded-full bg-primary text-white font-semibold">DUB</span>}
            {(anime.genres || []).map((g) => (
              <Link key={g} to={`/browse?genre=${encodeURIComponent(g)}`} className="text-xs px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white/80">{g}</Link>
            ))}
          </div>
          <p className="mt-6 text-white/70 leading-relaxed">{anime.description}</p>
          <dl className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-8">
            {meta.map(([k, v]) => (
              <div key={k}>
                <dt className="text-[11px] uppercase tracking-[0.18em] text-white/40">{k}</dt>
                <dd className="text-sm mt-1">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap gap-3 mt-8">
            {watchTo ? (
              <Link to={watchTo} className="btn-primary"><Play className="w-4 h-4 fill-white" /> {resume ? `Resume EP ${resume}` : "Watch Now"}</Link>
            ) : (
              <span className="btn-ghost opacity-60 cursor-not-allowed">No episodes yet</span>
            )}
            <WatchlistButton anime={anime} />
            <ShareButton title={anime.title} />
          </div>
        </div>
      </div>
    </section>
  );
}