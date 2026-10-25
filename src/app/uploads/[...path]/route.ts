import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: parts } = await params;
  const name = parts.join("/");

  const file = await db.uploadedFile.findUnique({ where: { name } });
  if (!file) return new NextResponse("Not found", { status: 404 });

  const buf = Buffer.from(file.data);
  const total = buf.length;
  const baseHeaders = {
    "Content-Type": file.mimeType,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
  };

  const range = req.headers.get("range");
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    if (m) {
      const start = m[1] ? parseInt(m[1], 10) : 0;
      const end = m[2] ? Math.min(parseInt(m[2], 10), total - 1) : total - 1;
      if (start <= end && start < total) {
        const chunk = buf.subarray(start, end + 1);
        return new NextResponse(new Uint8Array(chunk), {
          status: 206,
          headers: {
            ...baseHeaders,
            "Content-Range": `bytes ${start}-${end}/${total}`,
            "Content-Length": String(chunk.length),
          },
        });
      }
    }
  }

  return new NextResponse(new Uint8Array(buf), {
    headers: { ...baseHeaders, "Content-Length": String(total) },
  });
}