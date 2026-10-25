import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/auth";

export const runtime = "nodejs";

const DEFAULTS = {
  bioAr: "شركة Redline للشحن — شريكك اللوجستي الموثوق في مصر. نغطي 27 محافظة بأكثر من 40 فرعاً ومستودعاً، بأسرع خدمة وأفضل الأسعار وضمان التسليم.",
  bioEn: "Redline Transport — Your trusted logistics partner in Egypt. Covering 27 governorates with 40+ branches and warehouses, fast service, competitive rates, and guaranteed delivery.",
  newsletterTitleAr: "النشرة البريدية",
  newsletterTitleEn: "Newsletter",
  newsletterDescAr: "اشترك لتصلك آخر العروض والأخبار",
  newsletterDescEn: "Subscribe to get the latest offers and updates.",
  dashboardLinkAr: "دخول لوحة التحكم",
  dashboardLinkEn: "Admin Login",
  addressAr: "التجمع الخامس، القاهرة الجديدة",
  addressEn: "Fifth Settlement, New Cairo",
  facebookUrl: "https://facebook.com",
  instagramUrl: "https://instagram.com",
  twitterUrl: "https://x.com",
  linkedinUrl: "https://linkedin.com",
  whatsappUrl: "https://wa.me/201000000000",
  telegramUrl: "https://t.me/redline",
  active: true,
};

// GET /api/footer-content — returns the first FooterContent row (auto-create default if none)
export async function GET() {
  try {
    let record = await db.footerContent.findFirst({ orderBy: { updatedAt: "desc" } });
    if (!record) {
      record = await db.footerContent.create({ data: DEFAULTS });
    }
    return Response.json({ footer: record });
  } catch {
    return jsonError("خطأ", 500);
  }
}

// POST /api/footer-content — upserts the single FooterContent row (admin)
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data: Record<string, unknown> = {};
    for (const key of [
      "bioAr",
      "bioEn",
      "newsletterTitleAr",
      "newsletterTitleEn",
      "newsletterDescAr",
      "newsletterDescEn",
      "dashboardLinkAr",
      "dashboardLinkEn",
      "addressAr",
      "addressEn",
      "facebookUrl",
      "instagramUrl",
      "twitterUrl",
      "linkedinUrl",
      "whatsappUrl",
      "telegramUrl",
      "darkThemeVariant",
      "active",
    ]) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    let record = await db.footerContent.findFirst({ orderBy: { updatedAt: "desc" } });
    if (record) {
      record = await db.footerContent.update({ where: { id: record.id }, data });
    } else {
      record = await db.footerContent.create({ data: data as any });
    }
    return Response.json({ footer: record });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return jsonError("غير مصرح", 401);
    return jsonError("خطأ", 500);
  }
}
export const dynamic = "force-dynamic";
