import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const [stats, testimonials, videos] = await Promise.all([
    db.siteStat.findMany(),
    db.testimonial.findMany({ where: { active: true }, orderBy: { createdAt: "desc" }, take: 8 }),
    db.video.findMany({ where: { active: true }, orderBy: { createdAt: "desc" } }),
  ]);
  return Response.json({ stats, testimonials, videos });
}
