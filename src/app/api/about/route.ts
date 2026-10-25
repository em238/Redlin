import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/auth";

export const runtime = "nodejs";

// About is a single shared record. We upsert on the first row.
export async function GET() {
  try {
    let about = await db.about.findFirst({ orderBy: { updatedAt: "desc" } });
    if (!about) {
      about = await db.about.create({ data: {} });
    }
    return Response.json({ about });
  } catch {
    return jsonError("خطأ", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data: Record<string, unknown> = {};
    for (const key of ["titleAr", "titleEn", "subtitleAr", "subtitleEn", "descriptionAr", "descriptionEn", "image", "features"]) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    let about = await db.about.findFirst({ orderBy: { updatedAt: "desc" } });
    if (about) {
      about = await db.about.update({ where: { id: about.id }, data });
    } else {
      about = await db.about.create({ data: data as any });
    }
    return Response.json({ about });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ", 500);
  }
}

export async function PATCH(req: NextRequest) {
  return POST(req);
}
export const dynamic = "force-dynamic";
