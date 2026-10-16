import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const service = await db.service.findUnique({ where: { id } });
    if (!service) return jsonError("الخدمة غير موجودة", 404);
    return Response.json({ service });
  } catch {
    return jsonError("خطأ", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const data: Record<string, unknown> = {};
    for (const key of ["name", "nameAr", "description", "descriptionAr", "descriptionEn", "ctaTextAr", "ctaTextEn", "icon", "multiplier", "active"]) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    const service = await db.service.update({ where: { id }, data });
    return Response.json({ service });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await db.service.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ", 500);
  }
}
