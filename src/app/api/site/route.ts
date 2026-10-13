import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const [stats, testimonials, videos, heroImages, partners] = await Promise.all([
    db.siteStat.findMany(),
    db.testimonial.findMany({ where: { active: true }, orderBy: { createdAt: "desc" }, take: 8 }),
    db.video.findMany({ where: { active: true }, orderBy: { createdAt: "desc" } }),
    db.heroImage.findMany({ where: { active: true }, orderBy: [{ order: "asc" }, { createdAt: "desc" }] }),
    db.partner.findMany({ where: { active: true }, orderBy: [{ order: "asc" }, { createdAt: "desc" }] }),
  ]);
  return Response.json({ stats, testimonials, videos, heroImages, partners });
}
