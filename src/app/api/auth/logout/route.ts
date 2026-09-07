import { NextResponse } from "next/server";
import { removeSession } from "@/lib/userStore";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = cookies();
  const token = cookieStore.get("streamsync_session")?.value;

  if (token) {
    removeSession(token);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("streamsync_session", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}
