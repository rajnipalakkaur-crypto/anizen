import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import MediaUpload from "./MediaUpload";

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const TYPES = ["TV", "Movie", "OVA", "ONA", "Special"];
const STATUSES = ["Ongoing", "Completed", "Upcoming"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const Field = ({ label, children }) => (
  <div>
    <Label className="text-xs uppercase tracking-[0.18em] text-white/40 mb-2 block">{label}</Label>
    {children}
  </div>
);

export default function AnimeForm({ anime, open, onOpenChange, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      anime
        ? { ...anime }
        : { type: "TV", status: "Ongoing", has_sub: true, has_dub: false, featured: false, published: true, genres: [] }
    );
  }, [anime, open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title?.trim()) return toast.error("Title is required");
    const payload = {
      ...form,
      slug: form.slug?.trim() || slugify(form.title),
      genres: Array.isArray(form.genres) ? form.genres : String(form.genres || "").split(",").map((g) => g.trim()).filter(Boolean),
      release_year: form.release_year !== "" && form.release_year != null ? Number(form.release_year) : null,
      rating: form.rating !== "" && form.rating != null ? Number(form.rating) : null,
      total_episodes: form.total_episodes !== "" && form.total_episodes != null ? Number(form.total_episodes) : null,
    };
    setSaving(true);
    try {
      if (anime?.id) {
        await base44.entities.Anime.update(anime.id, payload);
        toast.success("Anime updated");
      } else {
        await base44.entities.Anime.create(payload);
        toast.success("Anime added");
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
          <DialogTitle>{anime ? "Edit Anime" : "Add Anime"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2 md:grid-cols-2">
          <Field label="Title *">
            <Input value={form.title || ""} onChange={(e) => set("title", e.target.value)} className="bg-white/5 border-white/10" placeholder="e.g. Shadow Blade Chronicles" />
          </Field>
          <Field label="Slug (auto from title)">
            <Input value={form.slug || ""} onChange={(e) => set("slug", e.target.value)} className="bg-white/5 border-white/10" placeholder="shadow-blade-chronicles" />
          </Field>
          <Field label="Alt title">
            <Input value={form.alt_title || ""} onChange={(e) => set("alt_title", e.target.value)} className="bg-white/5 border-white/10" />
          </Field>
          <Field label="Studio">
            <Input value={form.studio || ""} onChange={(e) => set("studio", e.target.value)} className="bg-white/5 border-white/10" />
          </Field>
          <div className="md:col-span-2">
            <Field label="Description">
              <Textarea value={form.description || ""} onChange={(e) => set("description", e.target.value)} rows={3} className="bg-white/5 border-white/10" />
            </Field>
          </div>
          <div className="md:col-span-2">
            <MediaUpload label="Poster (portrait 2:3)" value={form.poster_url} onChange={(v) => set("poster_url", v)} accept="image/*" />
          </div>
          <div className="md:col-span-2">
            <MediaUpload label="Banner (landscape 16:9)" value={form.banner_url} onChange={(v) => set("banner_url", v)} accept="image/*" />
          </div>
          <Field label="Genres (comma separated)">
            <Input value={Array.isArray(form.genres) ? form.genres.join(", ") : form.genres || ""} onChange={(e) => set("genres", e.target.value)} className="bg-white/5 border-white/10" placeholder="Action, Fantasy, Drama" />
          </Field>
          <Field label="Type">
            <Select value={form.type || "TV"} onValueChange={(v) => set("type", v)}>
              <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-card border-white/10">{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Release year">
            <Input type="number" value={form.release_year ?? ""} onChange={(e) => set("release_year", e.target.value)} className="bg-white/5 border-white/10" placeholder="2025" />
          </Field>
          <Field label="Status">
            <Select value={form.status || "Ongoing"} onValueChange={(v) => set("status", v)}>
              <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-card border-white/10">{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Rating (0–10)">
            <Input type="number" step="0.1" min="0" max="10" value={form.rating ?? ""} onChange={(e) => set("rating", e.target.value)} className="bg-white/5 border-white/10" />
          </Field>
          <Field label="Total episodes">
            <Input type="number" value={form.total_episodes ?? ""} onChange={(e) => set("total_episodes", e.target.value)} className="bg-white/5 border-white/10" />
          </Field>
          <Field label="Airing day">
            <Select value={form.airing_day || "none"} onValueChange={(v) => set("airing_day", v === "none" ? null : v)}>
              <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-card border-white/10">
                <SelectItem value="none">— None —</SelectItem>
                {DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <div className="flex items-center gap-6 md:col-span-2 pt-2">
            <label className="flex items-center gap-2 text-sm"><Switch checked={!!form.has_sub} onCheckedChange={(v) => set("has_sub", v)} /> SUB</label>
            <label className="flex items-center gap-2 text-sm"><Switch checked={!!form.has_dub} onCheckedChange={(v) => set("has_dub", v)} /> DUB</label>
            <label className="flex items-center gap-2 text-sm"><Switch checked={!!form.featured} onCheckedChange={(v) => set("featured", v)} /> Featured</label>
            <label className="flex items-center gap-2 text-sm"><Switch checked={!!form.published} onCheckedChange={(v) => set("published", v)} /> Published</label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-primary text-white">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
            {saving ? "Saving…" : "Save anime"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}