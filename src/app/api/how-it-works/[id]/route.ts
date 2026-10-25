import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/how-it-works/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const step = await db.howItWorksStep.findUnique({ where: { id } });
    if (!step) return jsonError("الخطوة غير موجودة", 404);
    return Response.json({ step });
  } catch {
    return jsonError("خطأ", 500);
  }
}

// PATCH /api/how-it-works/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const data: Record<string, unknown> = {};
    for (const key of ["order", "titleAr", "titleEn", "descAr", "descEn", "icon", "active"]) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    const step = await db.howItWorksStep.update({ where: { id }, data });
    return Response.json({ step });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ", 500);
  }
}

// DELETE /api/how-it-works/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await db.howItWorksStep.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ", 500);
  }
}
export const dynamic = "force-dynamic";
