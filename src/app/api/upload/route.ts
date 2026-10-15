import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { requireAdmin, jsonError } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED = [
  "image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/svg+xml",
  "video/mp4", "video/webm", "video/ogg",
];

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return jsonError("لم يتم إرسال أي ملف", 400);

    if (!ALLOWED.includes(file.type)) {
      return jsonError(`نوع الملف غير مدعوم: ${file.type}. الأنواع المدعومة: صور (PNG, JPG, WebP, GIF, SVG) وفيديو (MP4, WebM)`, 400);
    }
    if (file.size > MAX_SIZE) {
      return jsonError("حجم الملف كبير جداً (الحد الأقصى 50 ميجابايت)", 400);
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const filename = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const filepath = join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));

    return Response.json({ url: `/uploads/${filename}`, name: file.name, size: file.size });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ في رفع الملف", 500);
  }
}
