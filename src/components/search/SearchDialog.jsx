import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Clock, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Image } from "@/components/ui/image";
import { useAnimeList } from "@/lib/queries";
import { matchesQuery } from "@/lib/anime";
import { useStored, KEYS, addRecentSearch, clearRecentSearches } from "@/lib/storage";

export default function SearchDialog({ open, onOpenChange }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { data: list = [], isLoading } = useAnimeList();
  const recent = useStored(KEYS.recent);
  const suggestions = q.trim() ? list.filter((a) => matchesQuery(a, q)).slice(0, 6) : [];

  const go = (path, term) => {
    if (term) addRecentSearch(term);
    onOpenChange(false);
    setQ("");
    navigate(path);
  };
  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) go(`/browse?q=${encodeURIComponent(q.trim())}`, q);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-white/10 p-0 gap-0 max-w-xl top-[12%] translate-y-0 w-[calc(100%-2rem)] rounded-2xl overflow-hidden">
        <DialogTitle className="sr-only">Search anime</DialogTitle>
        <form onSubmit={submit} className="flex items-center gap-3 px-5 h-16 border-b border-white/5">
          <Search className="w-5 h-5 text-primary shrink-0" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Title, genre or studio…" className="flex-1 bg-transparent outline-none text-base placeholder:text-white/30" maxLength={80} />
        </form>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!q.trim() && (
            recent.length ? (
              <div className="p-3">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs uppercase tracking-[0.2em] text-white/40">Recent</span>
                  <button onClick={clearRecentSearches} className="text-xs text-white/50 hover:text-white">Clear</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recent.map((r) => (
                    <button key={r} onClick={() => go(`/browse?q=${encodeURIComponent(r)}`, r)} className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10">
                      <Clock className="w-3.5 h-3.5 text-white/40" /> {r}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="p-6 text-center text-sm text-white/40">Start typing to discover anime.</p>
            )
          )}
          {q.trim() && isLoading && <p className="p-6 text-center text-sm text-white/40">Searching…</p>}
          {q.trim() && !isLoading && suggestions.length === 0 && (
            <p className="p-6 text-center text-sm text-white/50">No matches for “{q}”.</p>
          )}
          {suggestions.map((a) => (
            <button key={a.id} onClick={() => go(`/anime/${a.slug}`, q)} className="w-full flex items-center gap-4 p-2.5 rounded-xl hover:bg-white/5 text-left transition-colors">
              <Image src={a.poster_url} alt={a.title} className="w-11 h-16 rounded-lg shrink-0" />
              <div className="min-w-0">
                <p className="font-medium truncate">{a.title}</p>
                <p className="text-xs text-white/50 truncate">{a.type} · {a.release_year} · {(a.genres || []).join(", ")}</p>
              </div>
            </button>
          ))}
          {suggestions.length > 0 && (
            <button onClick={submit} className="w-full p-3 text-sm text-primary hover:bg-white/5 rounded-xl flex items-center justify-center gap-2">
              See all results <X className="hidden" />
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}