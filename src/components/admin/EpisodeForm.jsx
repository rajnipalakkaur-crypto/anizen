import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import MediaUpload from "./MediaUpload";

const Field = ({ label, children }) => (
  <div>
    <Label className="text-xs uppercase tracking-[0.18em] text-white/40 mb-2 block">{label}</Label>
    {children}
  </div>
);

export default function EpisodeForm({ episode, defaultAnimeId, open, onOpenChange, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const animeQ = useQuery({ queryKey: ["admin-anime-all"], queryFn: () => base44.entities.Anime.list("-created_date", 500), enabled: open });

  useEffect(() => {
    if (!open) return;
    setForm(
      episode
        ? { ...episode }
        : { anime_id: defaultAnimeId || "", episode_number: "", title: "", has_sub: true, has_dub: false, published: true }
    );
  }, [episode, open, defaultAnimeId]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.anime_id) return toast.error("Select an anime");
    if (!form.episode_number) return toast.error("Episode number is required");
    if (!form.title?.trim()) return toast.error("Title is required");
    const payload = {
      ...form,
      episode_number: Number(form.episode_number),
      duration: form.duration !== "" && form.duration != null ? Number(form.duration) : null,
      intro_start: form.intro_start !== "" && form.intro_start != null ? Number(form.intro_start) : null,
      intro_end: form.intro_end !== "" && form.intro_end != null ? Number(form.intro_end) : null,
      outro_start: form.outro_start !== "" && form.outro_start != null ? Number(form.outro_start) : null,
    };
    setSaving(true);
    try {
      if (episode?.id) {
        await base44.entities.Episode.update(episode.id, payload);
        toast.success("Episode updated");
      } else {
        await base44.entities.Episode.create(payload);
        toast.success("Episode added");
      }
      onSaved?.();
      onOpenChange(false);
    } catch (e) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-white/10 max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{episode ? "Edit Episode" : "Add Episode"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2 md:grid-cols-2">
          <Field label="Anime *">
            <Select value={form.anime_id || "none"} onValueChange={(v) => set("anime_id", v === "none" ? "" : v)} disabled={!!defaultAnimeId}>
              <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Select anime" /></SelectTrigger>
              <SelectContent className="bg-card border-white/10">
                {!defaultAnimeId && <SelectItem value="none">— Select —</SelectItem>}
                {(animeQ.data || []).map((a) => <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Episode number *">
            <Input type="number" value={form.episode_number ?? ""} onChange={(e) => set("episode_number", e.target.value)} className="bg-white/5 border-white/10" />
          </Field>
          <div className="md:col-span-2">
            <Field label="Title *">
              <Input value={form.title || ""} onChange={(e) => set("title", e.target.value)} className="bg-white/5 border-white/10" />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Description">
              <Textarea value={form.description || ""} onChange={(e) => set("description", e.target.value)} rows={3} className="bg-white/5 border-white/10" />
            </Field>
          </div>
          <div className="md:col-span-2">
            <MediaUpload label="Thumbnail (landscape 16:9)" value={form.thumbnail_url} onChange={(v) => set("thumbnail_url", v)} accept="image/*" />
          </div>
          <Field label="Duration (seconds)">
            <Input type="number" value={form.duration ?? ""} onChange={(e) => set("duration", e.target.value)} className="bg-white/5 border-white/10" />
          </Field>
          <div />
          <Field label="Intro start (sec)">
            <Input type="number" value={form.intro_start ?? ""} onChange={(e) => set("intro_start", e.target.value)} className="bg-white/5 border-white/10" />
          </Field>
          <Field label="Intro end (sec)">
            <Input type="number" value={form.intro_end ?? ""} onChange={(e) => set("intro_end", e.target.value)} className="bg-white/5 border-white/10" />
          </Field>
          <Field label="Outro start (sec)">
            <Input type="number" value={form.outro_start ?? ""} onChange={(e) => set("outro_start", e.target.value)} className="bg-white/5 border-white/10" />
          </Field>
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm"><Switch checked={!!form.has_sub} onCheckedChange={(v) => set("has_sub", v)} /> SUB</label>
            <label className="flex items-center gap-2 text-sm"><Switch checked={!!form.has_dub} onCheckedChange={(v) => set("has_dub", v)} /> DUB</label>
            <label className="flex items-center gap-2 text-sm"><Switch checked={!!form.published} onCheckedChange={(v) => set("published", v)} /> Published</label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-primary text-white">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
            {saving ? "Saving…" : "Save episode"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}