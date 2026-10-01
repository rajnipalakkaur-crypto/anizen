import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Plus, ListPlus, Pencil, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { Image } from "@/components/ui/image";
import EpisodeForm from "@/components/admin/EpisodeForm";
import BulkEpisodeForm from "@/components/admin/BulkEpisodeForm";
import usePageMeta from "@/hooks/usePageMeta";

export default function AdminEpisodes() {
  usePageMeta({ title: "Admin · Episodes" });
  const [animeId, setAnimeId] = useState("");
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  const animeQ = useQuery({ queryKey: ["admin-anime-all"], queryFn: () => base44.entities.Anime.list("-created_date", 500) });
  const epsQ = useQuery({
    queryKey: ["admin-eps", animeId],
    queryFn: () => base44.entities.Episode.filter({ anime_id: animeId }, "episode_number", 1000),
    enabled: !!animeId,
  });

  const add = () => { setEditing(null); setOpen(true); };
  const edit = (e) => { setEditing(e); setOpen(true); };
  const remove = async (e) => {
    if (!window.confirm(`Delete episode ${e.episode_number}?`)) return;
    try {
      await base44.entities.Episode.delete(e.id);
      toast.success("Episode deleted");
      epsQ.refetch();
    } catch (err) {
      toast.error(err.message || "Delete failed");
    }
  };

  const anime = (animeQ.data || []).find((a) => a.id === animeId);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold">Episodes</h1>
          <p className="text-white/45 text-sm mt-1">{animeId ? `${epsQ.data?.length || 0} episodes` : "Select an anime to manage its episodes"}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setBulkOpen(true)} disabled={!animeId} className="btn-ghost h-11 disabled:opacity-40"><ListPlus className="w-4 h-4" /> Bulk add</button>
          <button onClick={add} disabled={!animeId} className="btn-primary h-11 disabled:opacity-40"><Plus className="w-4 h-4" /> Add episode</button>
        </div>
      </div>

      <div className="mt-6 max-w-md">
        <label className="text-xs uppercase tracking-[0.18em] text-white/40 mb-2 block">Anime</label>
        <select value={animeId} onChange={(e) => setAnimeId(e.target.value)} className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:ring-2 ring-primary/50 text-sm">
          <option value="">— Select anime —</option>
          {(animeQ.data || []).map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
        </select>
      </div>

      <div className="mt-6 glass rounded-2xl overflow-hidden">
        {!animeId ? (
          <p className="p-10 text-center text-white/40 text-sm">Pick an anime above to see its episodes.</p>
        ) : epsQ.isLoading ? (
          <div className="p-10 grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (epsQ.data || []).length === 0 ? (
          <p className="p-10 text-center text-white/40 text-sm">No episodes yet. Click “Add episode”.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-[0.18em] text-white/40 border-b border-white/5">
                <tr>
                  <th className="p-4 font-normal">Thumb</th>
                  <th className="p-4 font-normal">EP</th>
                  <th className="p-4 font-normal">Title</th>
                  <th className="p-4 font-normal hidden md:table-cell">Sub/Dub</th>
                  <th className="p-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(epsQ.data || []).map((e) => (
                  <tr key={e.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                    <td className="p-4"><div className="w-20 h-12 rounded-lg overflow-hidden bg-white/5">{e.thumbnail_url ? <Image src={e.thumbnail_url} alt="" className="w-full h-full" /> : <div className="w-full h-full grid place-items-center"><ImageIcon className="w-4 h-4 text-white/30" /></div>}</div></td>
                    <td className="p-4 font-medium">{e.episode_number}</td>
                    <td className="p-4 min-w-[160px]">{e.title}</td>
                    <td className="p-4 hidden md:table-cell text-white/60 text-xs">{[e.has_sub && "SUB", e.has_dub && "DUB"].filter(Boolean).join(" / ") || "—"}</td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => edit(e)} className="w-9 h-9 grid place-items-center rounded-lg bg-white/5 hover:bg-white/10"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => remove(e)} className="w-9 h-9 grid place-items-center rounded-lg bg-white/5 hover:bg-destructive/20"><Trash2 className="w-4 h-4 text-destructive" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EpisodeForm episode={editing} defaultAnimeId={animeId} open={open} onOpenChange={setOpen} onSaved={epsQ.refetch} />
      <BulkEpisodeForm
        animeId={animeId}
        animeTitle={anime?.title}
        existing={epsQ.data || []}
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        onSaved={epsQ.refetch}
      />
    </div>
  );
}