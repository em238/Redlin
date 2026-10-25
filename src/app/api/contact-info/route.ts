import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/contact-info — list all contact info records sorted by order
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "1";
    const items = await db.contactInfo.findMany({
      where: all ? {} : { active: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    return Response.json({ items });
  } catch {
    return jsonError("خطأ", 500);
  }
}

// POST /api/contact-info — create a new contact info record
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data: Record<string, unknown> = {};
    for (const key of ["type", "labelAr", "labelEn", "value", "href", "order", "active"]) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    if (data.order === undefined) data.order = 0;
    if (data.active === undefined) data.active = true;
    const item = await db.contactInfo.create({ data: data as any });
    return Response.json({ item });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ", 500);
  }
}
export const dynamic = "force-dynamic";
