"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import {
  Upload,
  Loader2,
  Check,
  Image as ImageIcon,
  FileVideo,
  X,
  RefreshCw,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  /** Bilingual label shown above the drop area */
  label?: string;
  /** Comma-separated accept string (e.g. "image/png,image/jpeg") */
  accept?: string;
  /** Current uploaded URL (controlled). Pass null/"" to show empty state */
  currentUrl?: string | null;
  /** Called with the uploaded `/uploads/...` path. Called with "" when removed */
  onUploaded: (url: string) => void;
  /** "image" or "video" — affects the icon, preview rendering, and helper text */
  type?: "image" | "video";
  /** Compact variant: small thumbnail row (for tight dialogs) */
  compact?: boolean;
}

const IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"];
const VIDEO_EXTS = [".mp4", ".webm"];

function isImagePath(url: string): boolean {
  return IMAGE_EXTS.some((ext) => url.toLowerCase().endsWith(ext));
}
function isVideoPath(url: string): boolean {
  return VIDEO_EXTS.some((ext) => url.toLowerCase().endsWith(ext));
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({
  label,
  accept = "image/*",
  currentUrl,
  onUploaded,
  type = "image",
  compact = false,
}: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [localFileName, setLocalFileName] = useState<string | null>(null);
  const [localFileSize, setLocalFileSize] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const Icon = type === "video" ? FileVideo : ImageIcon;
  const preview = currentUrl || null;

  const resetState = () => {
    setUploading(false);
    setProgress(0);
    setUploadError(null);
    setLocalFileName(null);
    setLocalFileSize(0);
  };

  const handleFile = async (file: File) => {
    if (!file) return;
    resetState();
    setLocalFileName(file.name);
    setLocalFileSize(file.size);
    setUploading(true);
    setProgress(0);
    try {
      // Use XMLHttpRequest so we can show real upload progress for large videos
      const url = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload");
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setProgress(pct);
          }
        });
        xhr.addEventListener("load", () => {
          try {
            const data = JSON.parse(xhr.responseText || "{}");
            if (xhr.status >= 200 && xhr.status < 300 && data.url) {
              resolve(data.url as string);
            } else {
              reject(new Error(data.error || `HTTP ${xhr.status}`));
            }
          } catch (e: any) {
            reject(new Error("Invalid response from server"));
          }
        });
        xhr.addEventListener("error", () => reject(new Error("Network error")));
        xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));
        const formData = new FormData();
        formData.append("file", file);
        xhr.send(formData);
      });
      onUploaded(url);
      toast.success(type === "video" ? "تم رفع الفيديو" : "تم رفع الصورة");
    } catch (e: any) {
      setUploadError(e.message || "خطأ في رفع الملف");
      toast.error(e.message || "خطأ في رفع الملف");
    } finally {
      setUploading(false);
      // keep progress at 100 if succeeded, will reset on next interaction
      setTimeout(() => setProgress(0), 800);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    // reset input value so picking the same file twice fires onChange
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    resetState();
    onUploaded("");
  };

  // ── Upload in progress ─────────────────────────────────────────────
  if (uploading) {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-xs font-semibold flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-primary" />
            {label}
          </label>
        )}
        <div
          className={`rounded-xl border-2 border-dashed border-primary bg-primary/5 p-4 ${compact ? "" : "min-h-[120px]"}`}
        >
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
            <div className="w-full max-w-xs">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground truncate max-w-[60%]" dir="ltr">
                  {localFileName}
                </span>
                <span className="font-semibold text-primary">{progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-red-700 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {localFileSize > 0 && (
                <div className="text-[10px] text-muted-foreground mt-1 text-center">
                  {formatBytes(localFileSize)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────
  if (uploadError) {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-xs font-semibold flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-primary" />
            {label}
          </label>
        )}
        <div className="rounded-xl border-2 border-dashed border-rose-400 bg-rose-50 dark:bg-rose-950/20 p-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <AlertCircle className="w-7 h-7 text-rose-500" />
            <p className="text-xs text-rose-700 dark:text-rose-400" dir="ltr">{uploadError}</p>
            <button
              onClick={() => { resetState(); inputRef.current?.click(); }}
              className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              إعادة المحاولة / Retry
            </button>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleInputChange}
        />
      </div>
    );
  }

  // ── Preview (already uploaded) ────────────────────────────────────
  if (preview) {
    const isImage = type === "image" || isImagePath(preview);
    const isVideo = type === "video" || isVideoPath(preview);
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-xs font-semibold flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-primary" />
            {label}
          </label>
        )}
        <div className="rounded-xl border border-border overflow-hidden bg-muted/30">
          <div
            className={`relative ${compact ? "aspect-[4/3]" : "aspect-video"} bg-muted`}
          >
            {isImage ? (
              <img
                src={preview}
                alt="preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = "0.2";
                }}
              />
            ) : isVideo ? (
              <video
                src={preview}
                className="w-full h-full object-cover"
                controls
                playsInline
                preload="metadata"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon className="w-8 h-8 text-muted-foreground/60" />
              </div>
            )}
            <div className="absolute top-2 start-2 z-10">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-bold shadow-sm">
                <Check className="w-3 h-3" /> تم الرفع
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-card">
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-muted-foreground font-mono truncate" dir="ltr">
                {preview}
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              title="استبدال الملف"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              تغيير
            </button>
            <button
              onClick={removeFile}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors"
              title="حذف الملف"
            >
              <Trash2 className="w-3.5 h-3.5" />
              حذف
            </button>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleInputChange}
        />
      </div>
    );
  }

  // ── Empty state (drag-and-drop / click to pick) ──────────────────
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-semibold flex items-center gap-1.5">
          <Upload className="w-3.5 h-3.5 text-primary" />
          {label}
        </label>
      )}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
          compact ? "p-3" : "p-5"
        } ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/40 hover:bg-muted/30"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleInputChange}
        />
        <div className="flex flex-col items-center gap-2 text-center">
          <div className={`rounded-full bg-primary/10 flex items-center justify-center ${compact ? "w-9 h-9" : "w-12 h-12"}`}>
            <Icon className={`${compact ? "w-4 h-4" : "w-6 h-6"} text-primary`} />
          </div>
          <div className="text-xs text-foreground">
            اسحب ملف هنا أو <span className="text-primary font-semibold">اضغط للاختيار من جهازك</span>
          </div>
          <div className="text-[10px] text-muted-foreground/70" dir={isImagePath(accept) || type === "image" ? "ltr" : "ltr"}>
            {type === "image"
              ? "PNG, JPG, WebP, SVG, GIF — حد أقصى 10MB"
              : "MP4, WebM — حد أقصى 50MB"}
          </div>
        </div>
      </div>
    </div>
  );
}
