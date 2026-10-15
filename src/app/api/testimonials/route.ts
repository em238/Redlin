import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

// Public: returns ONLY approved testimonials
// Admin: ?status=pending|approved|rejected|all returns filtered set
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");

  if (status && status !== "all") {
    // Admin query — filter by specific status
    const testimonials = await db.testimonial.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
    });
    return Response.json({ testimonials });
  }

  if (status === "all") {
    // Admin query — return everything
    const testimonials = await db.testimonial.findMany({
      orderBy: { createdAt: "desc" },
    });
    return Response.json({ testimonials });
  }

  // Public — only approved
  const testimonials = await db.testimonial.findMany({
    where: { status: "approved" },
    orderBy: { createdAt: "desc" },
  });
  return Response.json({ testimonials });
}

// Public: submit a new review (status = pending, NEVER visible until approved)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, role, company, content, rating, avatar } = body;

    if (!name?.trim() || !content?.trim()) {
      return Response.json({ error: "Name and content are required" }, { status: 400 });
    }

    const testimonial = await db.testimonial.create({
      data: {
        name: name.trim(),
        role: role?.trim() || "",
        company: company?.trim() || null,
        content: content.trim(),
        rating: rating ? Math.min(5, Math.max(1, Number(rating))) : 5,
        avatar: avatar || null,
        status: "pending", // NEVER visible on public site until admin approves
      },
    });

    return Response.json({ ok: true, testimonial });
  } catch (e: any) {
    return Response.json({ error: e.message || "Failed to submit" }, { status: 500 });
  }
}
