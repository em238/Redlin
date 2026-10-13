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
      const partners = await db.partner.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] });
      return Response.json({ partners });
    }
    const partners = await db.partner.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return Response.json({ partners });
  } catch {
    return jsonError("خطأ", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { name, logo, icon, color, website, order, active } = body;
    if (!name) return jsonError("الاسم مطلوب", 400);
    const partner = await db.partner.create({
      data: { name, logo: logo || null, icon: icon || "building", color: color || "#dc2626", website: website || null, order: order ?? 0, active: active !== false },
    });
    return Response.json({ partner });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ", 500);
  }
}
