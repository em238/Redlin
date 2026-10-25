import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/how-it-works — list all steps sorted by order
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "1";
    const steps = await db.howItWorksStep.findMany({
      where: all ? {} : { active: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    return Response.json({ steps });
  } catch {
    return jsonError("خطأ", 500);
  }
}

// POST /api/how-it-works — create a new step
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data: Record<string, unknown> = {};
    for (const key of ["order", "titleAr", "titleEn", "descAr", "descEn", "icon", "active"]) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    if (data.order === undefined) data.order = 0;
    if (data.icon === undefined) data.icon = "clipboard-list";
    if (data.active === undefined) data.active = true;
    const step = await db.howItWorksStep.create({ data: data as any });
    return Response.json({ step });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ", 500);
  }
}
export const dynamic = "force-dynamic";
