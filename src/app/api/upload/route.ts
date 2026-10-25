import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { db } from "@/lib/db";
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
const MAX_VIDEO_SIZE = 15 * 1024 * 1024; // 15 MB (مخزن في الداتا بيز)

function sanitizeFileName(originalName: string): string {
  const base = path.basename(originalName || "file");
  const cleaned = base
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `${Date.now()}-${cleaned || "file"}`;
}

export async function POST(req: NextRequest) {
  try {
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
  if (!file) return jsonError("لم يتم إرسال أي ملف", 400);

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
    return jsonError(`الملف كبير جداً (الحد الأقصى ${limitMb}MB لهذا النوع)`, 400);
  }

  try {
    const originalExt = path.extname(file.name) || "";
    const baseName = path.basename(file.name, originalExt);
    const safeName =
      sanitizeFileName(baseName) +
      (originalExt.toLowerCase() || (isImage ? ".png" : ".mp4"));

    const bytes = Buffer.from(await file.arrayBuffer());

    await db.uploadedFile.create({
      data: {
        name: safeName,
        mimeType: file.type,
        size: file.size,
        data: bytes,
      },
    });

    return NextResponse.json({ url: `/uploads/${safeName}` });
  } catch (error: any) {
    console.error("Upload error:", error);
    return jsonError("فشل رفع الملف", 500);
  }
}