import React, { useState } from "react";
import { Plus, Pencil, Trash2, Search, Loader2, Eye, EyeOff } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Image } from "@/components/ui/image";
import { Input } from "@/components/ui/input";
import AnimeForm from "@/components/admin/AnimeForm";
import usePageMeta from "@/hooks/usePageMeta";

export default function AdminAnime() {
  usePageMeta({ title: "Admin · Anime" });
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const { data: list = [], isLoading, refetch } = useQuery({ queryKey: ["admin-anime"], queryFn: () => base44.entities.Anime.list("-created_date", 500) });

  const filtered = list.filter((a) => (a.title + " " + (a.alt_title || "")).toLowerCase().includes(q.toLowerCase()));

  const add = () => { setEditing(null); setOpen(true); };
  const edit = (a) => { setEditing(a); setOpen(true); };
  const remove = async (a) => {
    if (!window.confirm(`Delete "${a.title}"? Its episodes and servers remain and should be deleted separately.`)) return;
    try {
      await base44.entities.Anime.delete(a.id);
      toast.success("Anime deleted");
      refetch();
    } catch (e) {
      toast.error(e.message || "Delete failed");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold">Anime</h1>
          <p className="text-white/45 text-sm mt-1">{list.length} total</p>
        </div>
        <button onClick={add} className="btn-primary h-11"><Plus className="w-4 h-4" /> Add anime</button>
      </div>

      <label className="flex items-center gap-3 h-11 px-4 rounded-full glass mt-6 max-w-md">
        <Search className="w-4 h-4 text-white/40" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title…" className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0" />
      </label>

      <div className="mt-6 glass rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-10 grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <p className="p-10 text-center text-white/40 text-sm">No anime found. Click “Add anime” to create one.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-[0.18em] text-white/40 border-b border-white/5">
                <tr>
                  <th className="p-4 font-normal">Poster</th>
                  <th className="p-4 font-normal">Title</th>
                  <th className="p-4 font-normal hidden md:table-cell">Type</th>
                  <th className="p-4 font-normal hidden md:table-cell">Status</th>
                  <th className="p-4 font-normal hidden lg:table-cell">Eps</th>
                  <th className="p-4 font-normal">Published</th>
                  <th className="p-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                    <td className="p-4"><div className="w-10 h-14 rounded-lg overflow-hidden bg-white/5 shrink-0">{a.poster_url && <Image src={a.poster_url} alt="" className="w-full h-full" />}</div></td>
                    <td className="p-4 font-medium min-w-[160px]">{a.title}<span className="block text-xs text-white/40 font-normal">{a.release_year || "—"}</span></td>
                    <td className="p-4 hidden md:table-cell text-white/70">{a.type}</td>
                    <td className="p-4 hidden md:table-cell text-white/70">{a.status}</td>
                    <td className="p-4 hidden lg:table-cell text-white/70">{a.total_episodes || "—"}</td>
                    <td className="p-4">{a.published ? <Eye className="w-4 h-4 text-accent" /> : <EyeOff className="w-4 h-4 text-white/40" />}</td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => edit(a)} className="w-9 h-9 grid place-items-center rounded-lg bg-white/5 hover:bg-white/10"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => remove(a)} className="w-9 h-9 grid place-items-center rounded-lg bg-white/5 hover:bg-destructive/20"><Trash2 className="w-4 h-4 text-destructive" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimeForm anime={editing} open={open} onOpenChange={setOpen} onSaved={refetch} />
    </div>
  );
}