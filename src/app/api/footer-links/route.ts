import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/footer-links — returns footer links ordered by category then order.
// ?all=1 → admin view: returns ALL rows (including inactive), requires admin.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "1";
    const where = all ? {} : { active: true };
    if (all) {
      try { await requireAdmin(); } catch { return jsonError("غير مصرح", 401); }
    }
    const links = await db.footerLink.findMany({
      where,
      orderBy: [{ category: "asc" }, { order: "asc" }],
    });
    return Response.json({ links });
  } catch {
    return jsonError("خطأ", 500);
  }
}

// POST /api/footer-links — creates a new footer link (admin)
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { category, labelAr, labelEn } = body;
    if (!category || !labelAr || !labelEn) {
      return jsonError("التصنيف والاسم بالعربي والإنجليزي مطلوبة", 400);
    }
    const data: Record<string, unknown> = {
      category,
      labelAr,
      labelEn,
      href: body.href ?? "#",
      order: typeof body.order === "number" ? body.order : 0,
      active: body.active !== false,
    };
    const link = await db.footerLink.create({ data: data as any });
    return Response.json({ link });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ", 500);
  }
}
