import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const [
    stats,
    testimonials,
    videos,
    heroImages,
    partners,
    ctaBanner,
    sectionContent,
    footerContent,
    footerLinks,
  ] = await Promise.all([
    db.siteStat.findMany(),
    db.testimonial.findMany({ where: { status: "approved" }, orderBy: { createdAt: "desc" }, take: 8 }),
    db.video.findMany({ where: { active: true }, orderBy: { createdAt: "desc" } }),
    db.heroImage.findMany({ where: { active: true }, orderBy: [{ order: "asc" }, { createdAt: "desc" }] }),
    db.partner.findMany({ where: { active: true }, orderBy: [{ order: "asc" }, { createdAt: "desc" }] }),
    db.ctaBanner.findFirst({ orderBy: { updatedAt: "desc" } }),
    db.sectionContent.findMany({ orderBy: { createdAt: "asc" } }),
    db.footerContent.findFirst({ orderBy: { updatedAt: "desc" } }),
    db.footerLink.findMany({ where: { active: true }, orderBy: [{ category: "asc" }, { order: "asc" }] }),
  ]);
  return Response.json({
    stats,
    testimonials,
    videos,
    heroImages,
    partners,
    ctaBanner,
    sectionContent,
    footerContent,
    footerLinks,
  });
}
export const dynamic = "force-dynamic";
