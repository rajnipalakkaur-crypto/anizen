import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import MediaUpload from "./MediaUpload";

const QUALITIES = ["360p", "480p", "720p", "1080p", "4K"];

const Field = ({ label, children }) => (
  <div>
    <Label className="text-xs uppercase tracking-[0.18em] text-white/40 mb-2 block">{label}</Label>
    {children}
  </div>
);

export default function ServerForm({ server, episode, open, onOpenChange, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      server
        ? { ...server }
        : { episode_id: episode?.id || "", server_name: "AniZen", quality: "1080p", language: "Japanese", is_active: true, priority: 1 }
    );
  }, [server, episode, open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.episode_id) return toast.error("No episode selected");
    if (!form.server_name?.trim()) return toast.error("Server name is required");
    if (!form.video_url?.trim()) return toast.error("Video URL is required");
    const payload = {
      ...form,
      priority: Number(form.priority) || 1,
    };
    setSaving(true);
    try {
      if (server?.id) {
        await base44.entities.EpisodeServer.update(server.id, payload);
        toast.success("Server updated");
      } else {
        await base44.entities.EpisodeServer.create(payload);
        toast.success("Server added");
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
          <DialogTitle>{server ? "Edit Video Server" : "Add Video Server"}</DialogTitle>
        </DialogHeader>
        {episode && <p className="text-xs text-white/40 -mt-1">For: EP {episode.episode_number} · {episode.title}</p>}
        <div className="grid gap-4 py-2 md:grid-cols-2">
          <Field label="Server name *">
            <Input value={form.server_name || ""} onChange={(e) => set("server_name", e.target.value)} className="bg-white/5 border-white/10" placeholder="AniZen, Mirror-1, etc." />
          </Field>
          <Field label="Quality">
            <Select value={form.quality || "1080p"} onValueChange={(v) => set("quality", v)}>
              <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-card border-white/10">{QUALITIES.map((q) => <SelectItem key={q} value={q}>{q}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <div className="md:col-span-2">
            <MediaUpload label="Video URL * (mp4 / m3u8)" value={form.video_url} onChange={(v) => set("video_url", v)} accept="video/*" preview />
          </div>
          <Field label="Language">
            <Input value={form.language || ""} onChange={(e) => set("language", e.target.value)} className="bg-white/5 border-white/10" placeholder="Japanese, English…" />
          </Field>
          <Field label="Priority (lower = first)">
            <Input type="number" value={form.priority ?? 1} onChange={(e) => set("priority", e.target.value)} className="bg-white/5 border-white/10" />
          </Field>
          <div className="md:col-span-2">
            <MediaUpload label="Subtitle URL (.vtt / .srt)" value={form.subtitle_url} onChange={(v) => set("subtitle_url", v)} accept=".vtt,.srt,text/vtt,application/octet-stream" preview={false} />
          </div>
          <Field label="Subtitle label">
            <Input value={form.subtitle_label || ""} onChange={(e) => set("subtitle_label", e.target.value)} className="bg-white/5 border-white/10" placeholder="English" />
          </Field>
          <label className="flex items-center gap-2 text-sm pt-7"><Switch checked={!!form.is_active} onCheckedChange={(v) => set("is_active", v)} /> Active</label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-primary text-white">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
            {saving ? "Saving…" : "Save server"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}