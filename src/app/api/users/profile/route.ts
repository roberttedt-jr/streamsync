import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession, updateUserProfile } from "@/lib/userStore";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get("streamsync_session")?.value;

  if (!token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = verifySession(token);
  if (!user) {
    return NextResponse.json({ error: "Sesión expirada" }, { status: 401 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("streamsync_session")?.value;
    const body = await request.json();

    let userId = token ? verifySession(token)?.id : null;
    if (!userId && body.userId) {
      userId = body.userId;
    }

    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { name, username, avatar, bio, twitchUsername, youtubeHandle } = body;

    const updated = await updateUserProfile(userId, {
      name,
      username,
      avatar,
      bio,
      twitchUsername,
      youtubeHandle,
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error al actualizar el perfil" },
      { status: 400 }
    );
  }
}
