import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Server as ServerIcon } from "lucide-react";
import ServerForm from "@/components/admin/ServerForm";
import usePageMeta from "@/hooks/usePageMeta";

export default function AdminServers() {
  usePageMeta({ title: "Admin · Video Servers" });
  const [animeId, setAnimeId] = useState("");
  const [episodeId, setEpisodeId] = useState("");
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);

  const animeQ = useQuery({ queryKey: ["admin-anime-all"], queryFn: () => base44.entities.Anime.list("-created_date", 500) });
  const epsQ = useQuery({
    queryKey: ["admin-eps", animeId],
    queryFn: () => base44.entities.Episode.filter({ anime_id: animeId }, "episode_number", 1000),
    enabled: !!animeId,
  });
  const srvQ = useQuery({
    queryKey: ["admin-servers", episodeId],
    queryFn: () => base44.entities.EpisodeServer.filter({ episode_id: episodeId }, "priority", 100),
    enabled: !!episodeId,
  });

  const episode = (epsQ.data || []).find((e) => e.id === episodeId);

  const add = () => { setEditing(null); setOpen(true); };
  const edit = (s) => { setEditing(s); setOpen(true); };
  const remove = async (s) => {
    if (!window.confirm(`Delete server "${s.server_name}"?`)) return;
    try {
      await base44.entities.EpisodeServer.delete(s.id);
      toast.success("Server deleted");
      srvQ.refetch();
    } catch (err) {
      toast.error(err.message || "Delete failed");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold">Video Servers</h1>
          <p className="text-white/45 text-sm mt-1">{episodeId ? `${srvQ.data?.length || 0} sources` : "Pick an anime → episode to manage video sources"}</p>
        </div>
        <button onClick={add} disabled={!episodeId} className="btn-primary h-11 disabled:opacity-40"><Plus className="w-4 h-4" /> Add server</button>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-4 max-w-2xl">
        <div>
          <label className="text-xs uppercase tracking-[0.18em] text-white/40 mb-2 block">Anime</label>
          <select value={animeId} onChange={(e) => { setAnimeId(e.target.value); setEpisodeId(""); }} className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:ring-2 ring-primary/50 text-sm">
            <option value="">— Select anime —</option>
            {(animeQ.data || []).map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.18em] text-white/40 mb-2 block">Episode</label>
          <select value={episodeId} onChange={(e) => setEpisodeId(e.target.value)} disabled={!animeId} className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:ring-2 ring-primary/50 text-sm disabled:opacity-50">
            <option value="">— Select episode —</option>
            {(epsQ.data || []).map((e) => <option key={e.id} value={e.id}>EP {e.episode_number} · {e.title}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-6 glass rounded-2xl overflow-hidden">
        {!episodeId ? (
          <p className="p-10 text-center text-white/40 text-sm">Pick an anime and episode above to manage video sources.</p>
        ) : srvQ.isLoading ? (
          <div className="p-10 grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (srvQ.data || []).length === 0 ? (
          <p className="p-10 text-center text-white/40 text-sm">No video sources yet. Click “Add server” to add one.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-[0.18em] text-white/40 border-b border-white/5">
                <tr>
                  <th className="p-4 font-normal">Server</th>
                  <th className="p-4 font-normal">Quality</th>
                  <th className="p-4 font-normal hidden md:table-cell">Language</th>
                  <th className="p-4 font-normal hidden md:table-cell">Active</th>
                  <th className="p-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(srvQ.data || []).map((s) => (
                  <tr key={s.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                    <td className="p-4 font-medium flex items-center gap-2"><ServerIcon className="w-4 h-4 text-primary" /> {s.server_name}</td>
                    <td className="p-4 text-white/70">{s.quality}</td>
                    <td className="p-4 hidden md:table-cell text-white/60">{s.language}</td>
                    <td className="p-4 hidden md:table-cell">{s.is_active ? <span className="text-accent text-xs">Active</span> : <span className="text-white/40 text-xs">Off</span>}</td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => edit(s)} className="w-9 h-9 grid place-items-center rounded-lg bg-white/5 hover:bg-white/10"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => remove(s)} className="w-9 h-9 grid place-items-center rounded-lg bg-white/5 hover:bg-destructive/20"><Trash2 className="w-4 h-4 text-destructive" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ServerForm server={editing} episode={episode} open={open} onOpenChange={setOpen} onSaved={srvQ.refetch} />
    </div>
  );
}