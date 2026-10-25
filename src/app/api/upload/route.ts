import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { requireAdmin, jsonError } from "@/lib/auth";

export const runtime = "nodejs";

const IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

/**
 * Sanitize an uploaded file's original name into something safe to store
 * on disk + serve via a static URL. Strips path components, replaces
 * whitespace + non-alphanumeric characters (except . - _), lowercases,
 * and prefixes with Date.now() so two files with the same original name
 * never collide.
 */
function sanitizeFileName(originalName: string): string {
  const base = path.basename(originalName || "file");
  // keep only alphanumeric, dash, underscore, dot — collapse everything else to a dash
  const cleaned = base
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `${Date.now()}-${cleaned || "file"}`;
}

// POST /api/upload — accepts multipart/form-data with a single `file` field.
// Images (jpg/png/webp/svg/gif) up to 10MB; videos (mp4/webm) up to 50MB.
// Saves to public/uploads/ with a unique sanitized filename and returns
// { url: "/uploads/<filename>" }.
export async function POST(req: NextRequest) {
  try {
    // Require an authenticated admin session before accepting uploads.
    await requireAdmin();
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ في التحقق", 500);
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return jsonError("صيغة البيانات غير صحيحة", 400);
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return jsonError("لم يتم إرسال أي ملف", 400);
  }

  const isImage = IMAGE_TYPES.has(file.type);
  const isVideo = VIDEO_TYPES.has(file.type);
  if (!isImage && !isVideo) {
    return jsonError(
      "نوع الملف غير مسموح. مسموح فقط: PNG, JPG, WebP, SVG, GIF, MP4, WebM",
      400
    );
  }

  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
  if (file.size > maxSize) {
    const limitMb = Math.floor(maxSize / (1024 * 1024));
    return jsonError(
      `الملف كبير جداً (الحد الأقصى ${limitMb}MB لهذا النوع)`,
      400
    );
  }

  try {
    const uploadDir = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const originalExt = path.extname(file.name) || "";
    const baseName = path.basename(file.name, originalExt);
    const safeName = sanitizeFileName(baseName) + (originalExt || (isImage ? ".png" : ".mp4"));
    const filepath = path.join(uploadDir, safeName);

    const bytes = await file.arrayBuffer();
    await writeFile(filepath, new Uint8Array(bytes));

    return NextResponse.json({ url: `/uploads/${safeName}` });
  } catch (error: any) {
    console.error("Upload error:", error);
    return jsonError("فشل رفع الملف", 500);
  }
}
