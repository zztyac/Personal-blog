import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "neon-district-blog",
    timestamp: new Date().toISOString()
  });
}
