import React from "react";
import { Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { useStored, KEYS, toggleWatchlist } from "@/lib/storage";

export default function WatchlistButton({ anime, className = "btn-ghost" }) {
  const list = useStored(KEYS.watchlist);
  const inList = list.includes(anime.id);
  const onClick = () => {
    const added = toggleWatchlist(anime.id);
    toast(added ? `Added “${anime.title}” to My List` : `Removed “${anime.title}” from My List`);
  };
  return (
    <button onClick={onClick} className={className} aria-pressed={inList}>
      {inList ? <Check className="w-4 h-4 text-accent" /> : <Plus className="w-4 h-4" />}
      {inList ? "In My List" : "Add to Watchlist"}
    </button>
  );
}