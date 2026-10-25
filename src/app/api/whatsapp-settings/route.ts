import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/whatsapp-settings — returns first WhatsAppSetting row, auto-creates default if none
export async function GET() {
  try {
    let setting = await db.whatsAppSetting.findFirst({ orderBy: { updatedAt: "desc" } });
    if (!setting) {
      setting = await db.whatsAppSetting.create({ data: {} });
    }
    return Response.json({ setting });
  } catch {
    return jsonError("خطأ", 500);
  }
}

// POST /api/whatsapp-settings — upsert (update existing or create first)
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data: Record<string, unknown> = {};
    for (const key of ["phoneNumber", "defaultMessageAr", "defaultMessageEn", "active"]) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    let setting = await db.whatsAppSetting.findFirst({ orderBy: { updatedAt: "desc" } });
    if (setting) {
      setting = await db.whatsAppSetting.update({ where: { id: setting.id }, data });
    } else {
      setting = await db.whatsAppSetting.create({ data: data as any });
    }
    return Response.json({ setting });
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
