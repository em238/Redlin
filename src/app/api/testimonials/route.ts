import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const testimonials = await db.testimonial.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });
  return Response.json({ testimonials });
}

export async function POST(req: NextRequest) {
  try {
    await req.json();
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: true });
  }
}
