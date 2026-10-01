import React, { useRef, useState } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";

export default function MediaUpload({ value, onChange, label, accept = "image/*", preview = true }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await base44.integrations.Core.UploadPublicFile({ file });
      onChange(res.file_url);
      toast.success("File uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      {label && <label className="text-xs uppercase tracking-[0.18em] text-white/40 mb-2 block">{label}</label>}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste URL or upload a file"
          className="flex-1 h-10 px-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:ring-2 ring-primary/50 text-sm min-w-0"
        />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="h-10 px-4 rounded-xl bg-primary text-white text-sm flex items-center gap-2 disabled:opacity-50 shrink-0">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Upload
        </button>
        {value && <button type="button" onClick={() => onChange("")} className="h-10 w-10 grid place-items-center rounded-xl bg-white/5 hover:bg-white/10 shrink-0"><X className="w-4 h-4" /></button>}
        <input ref={inputRef} type="file" accept={accept} onChange={onFile} className="hidden" />
      </div>
      {preview && value && accept.includes("image") && (
        <div className="mt-2 w-24 h-32 rounded-lg overflow-hidden bg-white/5">
          <Image src={value} alt="preview" className="w-full h-full" />
        </div>
      )}
      {preview && value && accept.includes("video") && (
        <video src={value} className="mt-2 w-full max-h-40 rounded-lg bg-black" controls />
      )}
    </div>
  );
}