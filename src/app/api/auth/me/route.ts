import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/userStore";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Check NextAuth session first
    const session = await getServerSession(authOptions);

    if (session?.user?.id && process.env.DATABASE_URL) {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          accounts: {
            select: {
              provider: true,
              scope: true,
            },
          },
        },
      });

      if (dbUser) {
        const connectedProviders = {
          twitch: dbUser.accounts.some((a) => a.provider === "twitch"),
          google: dbUser.accounts.some((a) => a.provider === "google"),
        };

        return NextResponse.json({
          user: {
            id: dbUser.id,
            name: dbUser.name || "Usuario",
            username: dbUser.username || dbUser.name?.toLowerCase().replace(/\s+/g, "") || "usuario",
            email: dbUser.email || "",
            avatar: dbUser.image || "",
            bio: dbUser.bio || "",
            twitchUsername: dbUser.twitchUsername || "",
            youtubeHandle: dbUser.youtubeHandle || "",
            statsHoursWatched: dbUser.statsHoursWatched || 0,
            statsRoomsCreated: dbUser.statsRoomsCreated || 0,
            statsRoomsJoined: dbUser.statsRoomsJoined || 0,
            createdAt: dbUser.createdAt.toISOString(),
            connectedProviders,
          },
        });
      }
    }

    // 2. Fallback to guest / local session store
    const cookieStore = cookies();
    const token = cookieStore.get("streamsync_session")?.value;

    if (token) {
      const user = verifySession(token);
      if (user) {
        return NextResponse.json({
          user: {
            ...user,
            connectedProviders: { twitch: false, google: false },
          },
        });
      }
    }

    return NextResponse.json({ user: null });
  } catch (err) {
    console.error("Error in /api/auth/me:", err);
    return NextResponse.json({ user: null });
  }
}

