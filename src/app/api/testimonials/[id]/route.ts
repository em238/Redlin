import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

// GET single testimonial (admin)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const testimonial = await db.testimonial.findUnique({ where: { id } });
  if (!testimonial) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ testimonial });
}

// PATCH — update status (approve/reject) or edit fields
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, name, role, company, content, rating, avatar, active } = body;

    const data: Record<string, unknown> = {};
    if (status) data.status = status;
    if (name !== undefined) data.name = name;
    if (role !== undefined) data.role = role;
    if (company !== undefined) data.company = company;
    if (content !== undefined) data.content = content;
    if (rating !== undefined) data.rating = rating;
    if (avatar !== undefined) data.avatar = avatar;
    if (active !== undefined) data.active = active;

    const updated = await db.testimonial.update({ where: { id }, data });
    return NextResponse.json({ ok: true, testimonial: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to update" }, { status: 500 });
  }
}

// DELETE — permanently remove
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.testimonial.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to delete" }, { status: 500 });
  }
}
