import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "1";
    if (all) {
      try { await requireAdmin(); } catch { return jsonError("غير مصرح", 401); }
      const images = await db.heroImage.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] });
      return Response.json({ images });
    }
    const images = await db.heroImage.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return Response.json({ images });
  } catch {
    return jsonError("خطأ", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { url, title, titleAr, titleEn, order, active } = body;
    if (!url) return jsonError("الرابط مطلوب", 400);
    const image = await db.heroImage.create({
      data: {
        url,
        title: title || null,
        titleAr: titleAr || "",
        titleEn: titleEn || "",
        order: order ?? 0,
        active: active !== false,
      },
    });
    return Response.json({ image });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ", 500);
  }
}
