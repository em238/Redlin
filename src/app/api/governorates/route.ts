import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const governorates = await db.governorate.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
  return Response.json({ governorates });
}
