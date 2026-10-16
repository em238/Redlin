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
      const services = await db.service.findMany({ orderBy: { createdAt: "desc" } });
      return Response.json({ services });
    }
    const services = await db.service.findMany({
      where: { active: true },
      orderBy: { multiplier: "asc" },
    });
    return Response.json({ services });
  } catch {
    return jsonError("خطأ", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { name, nameAr, description, icon, multiplier, active } = body;
    if (!name || !nameAr) return jsonError("الاسم بالعربي والإنجليزي مطلوب", 400);
    if (!description) return jsonError("الوصف مطلوب", 400);
    const service = await db.service.create({
      data: {
        name,
        nameAr,
        description,
        icon: icon || "truck",
        multiplier: typeof multiplier === "number" ? multiplier : 1.0,
        active: active !== false,
      },
    });
    return Response.json({ service });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ", 500);
  }
}
