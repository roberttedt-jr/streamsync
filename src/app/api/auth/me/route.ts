import { NextResponse } from "next/server";
import { verifySession } from "@/lib/userStore";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get("streamsync_session")?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  const user = verifySession(token);
  return NextResponse.json({ user: user || null });
}
