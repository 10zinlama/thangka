import { NextResponse } from "next/server";
import { getAdminViewer } from "@/lib/admin";

export async function GET() {
  const viewer = await getAdminViewer();
  return NextResponse.json(
    { isAdmin: viewer.isAdmin },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
