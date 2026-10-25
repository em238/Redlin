import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/cta-banner — public, returns the single CtaBanner row (auto-creates default if none)
export async function GET() {
  try {
    let banner = await db.ctaBanner.findFirst({ orderBy: { updatedAt: "desc" } });
    if (!banner) {
      banner = await db.ctaBanner.create({ data: {} });
    }
    return Response.json({ banner });
  } catch {
    return jsonError("خطأ", 500);
  }
}

// POST /api/cta-banner — admin upsert (update existing or create first)
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data: Record<string, unknown> = {};
    for (const key of [
      "headingAr",
      "headingEn",
      "subAr",
      "subEn",
      "btnTextAr",
      "btnTextEn",
      "btnLink",
      "phone",
      "active",
    ]) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    let banner = await db.ctaBanner.findFirst({ orderBy: { updatedAt: "desc" } });
    if (banner) {
      banner = await db.ctaBanner.update({ where: { id: banner.id }, data });
    } else {
      banner = await db.ctaBanner.create({ data: data as any });
    }
    return Response.json({ banner });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ", 500);
  }
}

// PATCH is the same as POST (upsert semantics)
export async function PATCH(req: NextRequest) {
  return POST(req);
}
export const dynamic = "force-dynamic";
