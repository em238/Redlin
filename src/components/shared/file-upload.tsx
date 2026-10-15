"use client";

import { useState, useRef, type DragEvent } from "react";
import { Upload, Loader2, Check, Image as ImageIcon, FileVideo, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  label: string;
  accept?: string;
  currentUrl?: string | null;
  onUploaded: (url: string) => void;
  type?: "image" | "video";
}

export function FileUpload({ label, accept = "image/*", currentUrl, onUploaded, type = "image" }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setPreview(data.url);
      onUploaded(data.url);
      toast.success("تم رفع الملف بنجاح");
    } catch (e: any) {
      toast.error(e.message || "خطأ في رفع الملف");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const Icon = type === "video" ? FileVideo : ImageIcon;

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold flex items-center gap-1.5">
        <Upload className="w-3.5 h-3.5 text-primary" />
        {label}
      </label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed p-4 cursor-pointer transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">جاري الرفع...</span>
          </div>
        ) : preview ? (
          <div className="flex items-center gap-3">
            {type === "image" ? (
              <img src={preview} alt="preview" className="w-12 h-12 rounded-lg object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                <FileVideo className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> تم الرفع
              </div>
              <div className="text-[11px] text-muted-foreground font-mono truncate" dir="ltr">{preview}</div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setPreview(null); onUploaded(""); }}
              className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center"
              aria-label="إزالة"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <Icon className="w-7 h-7 text-muted-foreground" />
            <div className="text-xs text-muted-foreground">
              اسحب ملف هنا أو <span className="text-primary font-semibold">اضغط للاختيار</span>
            </div>
            <div className="text-[10px] text-muted-foreground/70">
              {type === "image" ? "PNG, JPG, WebP, GIF, SVG (حد أقصى 50MB)" : "MP4, WebM (حد أقصى 50MB)"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
