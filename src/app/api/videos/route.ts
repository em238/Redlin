import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "1";
    if (all) {
      try { await requireAdmin(); } catch {
        return jsonError("غير مصرح", 401);
      }
      const videos = await db.video.findMany({ orderBy: { createdAt: "desc" } });
      return Response.json({ videos });
    }
    const videos = await db.video.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });
    return Response.json({ videos });
  } catch {
    return jsonError("خطأ", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { title, titleAr, description, descriptionAr, url, thumbnail, category, featured, active } = body;
    if (!title || !url) return jsonError("العنوان والرابط مطلوبان", 400);

    // If featured, un-feature others
    if (featured) {
      await db.video.updateMany({ where: { featured: true }, data: { featured: false } });
    }
    const video = await db.video.create({
      data: {
        title,
        titleAr: titleAr || "",
        description: description || null,
        descriptionAr: descriptionAr || "",
        url,
        thumbnail: thumbnail || null,
        category: category || "promo",
        featured: !!featured,
        active: active !== false,
      },
    });
    return Response.json({ video });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ في رفع الفيديو", 500);
  }
}
export const dynamic = "force-dynamic";
