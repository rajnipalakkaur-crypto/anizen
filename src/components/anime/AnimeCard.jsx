import React from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Image } from "@/components/ui/image";
import TiltCard from "@/components/common/TiltCard";

export default function AnimeCard({ anime, className = "" }) {
  return (
    <Link to={`/anime/${anime.slug}`} className={`group block scene-3d ${className}`}>
      <TiltCard
        max={8}
        className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-secondary shadow-[0_12px_30px_-20px_rgba(0,0,0,0.95)] group-hover:shadow-[0_30px_60px_-18px_hsl(var(--primary)/0.6)] group-hover:ring-2 group-hover:ring-primary/60"
      >
        <Image src={anime.poster_url} alt={anime.title} className="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-[1.07]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          {anime.has_sub && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-accent text-accent-foreground">SUB</span>}
          {anime.has_dub && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-primary text-white">DUB</span>}
        </div>
        {anime.rating != null && (
          <span className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md glass">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {Number(anime.rating).toFixed(1)}
          </span>
        )}
        {anime.total_episodes && (
          <span className="absolute bottom-2.5 left-2.5 text-[11px] text-white/80">{anime.total_episodes} eps</span>
        )}
      </TiltCard>
      <p className="mt-3 font-medium text-sm md:text-[15px] truncate group-hover:text-primary transition-colors">{anime.title}</p>
      <p className="text-xs text-white/45 mt-0.5">{anime.type} · {anime.release_year}</p>
    </Link>
  );
}