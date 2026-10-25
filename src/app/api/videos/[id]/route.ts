import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/auth";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    if (body.featured === true) {
      await db.video.updateMany({ where: { featured: true }, data: { featured: false } });
    }
    // Allowlist fields that may be updated
    const data: Record<string, unknown> = {};
    for (const key of [
      "title", "titleAr", "description", "descriptionAr",
      "url", "thumbnail", "category", "featured", "active",
    ]) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    const video = await db.video.update({ where: { id }, data });
    return Response.json({ video });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await db.video.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ", 500);
  }
}
export const dynamic = "force-dynamic";
