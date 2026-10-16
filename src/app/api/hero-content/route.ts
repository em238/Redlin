import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    // Auto-create default row if none exists
    let content = await db.heroContent.findFirst();
    if (!content) {
      content = await db.heroContent.create({ data: {} });
    }
    return NextResponse.json(content);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const existing = await db.heroContent.findFirst();

    const data = {
      badgeAr: body.badgeAr ?? "",
      badgeEn: body.badgeEn ?? "",
      titleAr: body.titleAr ?? "",
      titleEn: body.titleEn ?? "",
      subtitleAr: body.subtitleAr ?? "",
      subtitleEn: body.subtitleEn ?? "",
      cta1TextAr: body.cta1TextAr ?? "",
      cta1TextEn: body.cta1TextEn ?? "",
      cta1Link: body.cta1Link ?? "#contact",
      cta2TextAr: body.cta2TextAr ?? "",
      cta2TextEn: body.cta2TextEn ?? "",
      cta2Link: body.cta2Link ?? "#services",
      feature1Ar: body.feature1Ar ?? "",
      feature1En: body.feature1En ?? "",
      feature2Ar: body.feature2Ar ?? "",
      feature2En: body.feature2En ?? "",
      feature3Ar: body.feature3Ar ?? "",
      feature3En: body.feature3En ?? "",
    };

    if (existing) {
      const updated = await db.heroContent.update({ where: { id: existing.id }, data });
      return NextResponse.json(updated);
    } else {
      const created = await db.heroContent.create({ data });
      return NextResponse.json(created);
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
