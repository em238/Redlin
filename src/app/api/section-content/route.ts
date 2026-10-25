import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/section-content — returns ALL section content rows (public)
export async function GET() {
  try {
    const sections = await db.sectionContent.findMany({ orderBy: { createdAt: "asc" } });
    return Response.json({ sections });
  } catch {
    return jsonError("خطأ", 500);
  }
}

// POST /api/section-content — upserts a single section's content by `section` field (admin)
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { section } = body;
    if (!section || typeof section !== "string") {
      return jsonError("القسم مطلوب", 400);
    }
    const data: Record<string, unknown> = {};
    for (const key of [
      "section",
      "badgeAr",
      "badgeEn",
      "titleAr",
      "titleEn",
      "descriptionAr",
      "descriptionEn",
      "active",
    ]) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    // Upsert by unique `section` field
    const existing = await db.sectionContent.findUnique({ where: { section } });
    let record;
    if (existing) {
      record = await db.sectionContent.update({ where: { id: existing.id }, data });
    } else {
      record = await db.sectionContent.create({ data: data as any });
    }
    return Response.json({ section: record });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ", 500);
  }
}
export const dynamic = "force-dynamic";
