import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function GET() {
  try {
    let about = await db.about.findFirst({ orderBy: { updatedAt: "desc" } });
    if (!about) {
      about = await db.about.create({ data: {} });
    }
    return NextResponse.json(
      { about },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch {
    return jsonError("خطأ في الخادم", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data: Record<string, unknown> = {};

    const allowedKeys = [
      "titleAr", "titleEn",
      "subtitleAr", "subtitleEn",
      "descriptionAr", "descriptionEn",
      "image", "features"
    ];

    for (const key of allowedKeys) {
      if (body[key] !== undefined) data[key] = body[key];
    }

    let about = await db.about.findFirst({ orderBy: { updatedAt: "desc" } });
    if (about) {
      about = await db.about.update({ where: { id: about.id }, data });
    } else {
      about = await db.about.create({ data: data as any });
    }

    // إفراغ كاش الصفحة الرئيسية وأي مسار يقرأ بيانات about فورياً
    revalidatePath("/");
    revalidatePath("/api/about");

    return NextResponse.json({ about });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ أثناء الحفظ", 500);
  }
}

export async function PATCH(req: NextRequest) {
  return POST(req);
}