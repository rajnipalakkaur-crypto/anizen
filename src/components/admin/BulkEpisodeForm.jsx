import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const MAX = 100;

const Field = ({ label, children }) => (
  <div>
    <Label className="text-xs uppercase tracking-[0.18em] text-white/40 mb-2 block">{label}</Label>
    {children}
  </div>
);

export default function BulkEpisodeForm({ animeId, animeTitle, existing = [], open, onOpenChange, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const seeded = useRef(false);
  const next = Math.max(0, ...existing.map((e) => Number(e.episode_number) || 0)) + 1;

  // Seed the defaults once per open — never again while the dialog is open,
  // otherwise the episodes finishing their load would wipe what's being typed.
  useEffect(() => {
    if (!open) {
      seeded.current = false;
      return;
    }
    if (seeded.current) return;
    seeded.current = true;
    setForm({ from: next, to: next + 11, title_template: "Episode {n}", duration: "", has_sub: true, has_dub: false, published: true });
  }, [open, next]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const from = Number(form.from);
  const to = Number(form.to);
  const count = from && to && to >= from ? to - from + 1 : 0;

  const save = async () => {
    if (!animeId) return toast.error("Select an anime first");
    if (!count) return toast.error("End number must be greater than the start");
    if (count > MAX) return toast.error(`You can add up to ${MAX} episodes at once`);

    const taken = new Set(existing.map((e) => Number(e.episode_number)));
    const rows = [];
    for (let n = from; n <= to; n++) {
      if (taken.has(n)) continue;
      rows.push({
        anime_id: animeId,
        episode_number: n,
        title: (form.title_template?.trim() || "Episode {n}").replace(/\{n\}/gi, n),
        duration: form.duration === "" || form.duration == null ? null : Number(form.duration),
        has_sub: !!form.has_sub,
        has_dub: !!form.has_dub,
        published: !!form.published,
      });
    }
    if (!rows.length) return toast.error("Those episode numbers already exist");

    setSaving(true);
    try {
      await base44.entities.Episode.bulkCreate(rows);
      toast.success(`${rows.length} episodes added`);
      onSaved?.();
      onOpenChange(false);
    } catch (e) {
      toast.error(e.message || "Bulk add failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-white/10 max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk add episodes</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-white/50 -mt-1">
          {animeTitle || "No anime selected"} · {count ? `${count} episode${count > 1 ? "s" : ""} (existing numbers are skipped)` : "enter a range"}
        </p>
        <div className="grid gap-4 py-2 grid-cols-2">
          <Field label="From episode *">
            <Input type="number" value={form.from ?? ""} onChange={(e) => set("from", e.target.value)} className="bg-white/5 border-white/10" />
          </Field>
          <Field label="To episode *">
            <Input type="number" value={form.to ?? ""} onChange={(e) => set("to", e.target.value)} className="bg-white/5 border-white/10" />
          </Field>
          <div className="col-span-2">
            <Field label="Title template">
              <Input value={form.title_template || ""} onChange={(e) => set("title_template", e.target.value)} placeholder="Episode {n}" className="bg-white/5 border-white/10" />
            </Field>
          </div>
          <Field label="Duration (sec)">
            <Input type="number" value={form.duration ?? ""} onChange={(e) => set("duration", e.target.value)} className="bg-white/5 border-white/10" />
          </Field>
          <div className="flex items-center gap-5 pt-6 text-sm">
            <label className="flex items-center gap-2"><Switch checked={!!form.has_sub} onCheckedChange={(v) => set("has_sub", v)} /> SUB</label>
            <label className="flex items-center gap-2"><Switch checked={!!form.has_dub} onCheckedChange={(v) => set("has_dub", v)} /> DUB</label>
          </div>
          <div className="col-span-2 flex items-center gap-2 text-sm">
            <Switch checked={!!form.published} onCheckedChange={(v) => set("published", v)} /> Published
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-primary text-white">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
            {saving ? "Adding…" : count ? `Add ${count} episodes` : "Add episodes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}