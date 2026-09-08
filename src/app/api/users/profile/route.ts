import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { verifySession, updateUserProfile } from "@/lib/userStore";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id && process.env.DATABASE_URL) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (dbUser) {
      return NextResponse.json({
        user: {
          id: dbUser.id,
          name: dbUser.name,
          username: dbUser.username,
          email: dbUser.email,
          avatar: dbUser.image,
          bio: dbUser.bio,
          twitchUsername: dbUser.twitchUsername,
          youtubeHandle: dbUser.youtubeHandle,
        },
      });
    }
  }

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
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { name, username, avatar, bio, twitchUsername, youtubeHandle } = body;

    // 1. If user is logged in via NextAuth and PostgreSQL is available, persist to Neon DB
    if (session?.user?.id && process.env.DATABASE_URL) {
      const dbUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          ...(name !== undefined && { name }),
          ...(username !== undefined && { username }),
          ...(avatar !== undefined && { image: avatar }),
          ...(bio !== undefined && { bio }),
          ...(twitchUsername !== undefined && { twitchUsername }),
          ...(youtubeHandle !== undefined && { youtubeHandle }),
        },
      });

      return NextResponse.json({
        success: true,
        user: {
          id: dbUser.id,
          name: dbUser.name,
          username: dbUser.username,
          email: dbUser.email,
          avatar: dbUser.image,
          bio: dbUser.bio,
          twitchUsername: dbUser.twitchUsername,
          youtubeHandle: dbUser.youtubeHandle,
        },
      });
    }

    // 2. Fallback to guest / in-memory store
    const cookieStore = cookies();
    const token = cookieStore.get("streamsync_session")?.value;
    const guestId = token ? verifySession(token)?.id : body.userId;

    if (!guestId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const updated = await updateUserProfile(guestId, {
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

