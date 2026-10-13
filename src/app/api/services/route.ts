import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const services = await db.service.findMany({
    where: { active: true },
    orderBy: { multiplier: "asc" },
  });
  return Response.json({ services });
}
