import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch accounts and channels in parallel
    const [accounts, channels, dbUser] = await Promise.all([
      prisma.account.findMany({
        where: { userId },
        select: {
          id: true,
          provider: true,
          providerAccountId: true,
          scope: true,
        },
      }),
      prisma.followedChannel.findMany({
        where: { userId },
        select: {
          id: true,
          platform: true,
          displayName: true,
          avatarUrl: true,
          isLive: true,
          category: true,
          url: true,
          lastSyncedAt: true,
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          image: true,
          twitchUsername: true,
          youtubeHandle: true,
        },
      }),
    ]);

    const twitchAccount = accounts.find((a) => a.provider === "twitch");
    const googleAccount = accounts.find((a) => a.provider === "google");

    const twitchChannels = channels.filter((c) => c.platform === "TWITCH");
    const youtubeChannels = channels.filter((c) => c.platform === "YOUTUBE");

    const twitchLiveCount = twitchChannels.filter((c) => c.isLive).length;

    // User can only unlink if they have more than 1 login method
    const canUnlink = accounts.length > 1;

    return NextResponse.json({
      twitch: {
        connected: Boolean(twitchAccount),
        hasFollowsPermission: Boolean(twitchAccount?.scope?.includes("user:read:follows")),
        displayName: dbUser?.twitchUsername || dbUser?.name || null,
        avatarUrl: dbUser?.image || null,
        channelsCount: twitchChannels.length,
        liveCount: twitchLiveCount,
        lastSyncedAt: twitchChannels.length > 0 ? twitchChannels[0].lastSyncedAt : null,
      },
      youtube: {
        connected: Boolean(googleAccount),
        hasYoutubePermission: Boolean(
          googleAccount?.scope?.includes("youtube.readonly") ||
            googleAccount?.scope?.includes("https://www.googleapis.com/auth/youtube.readonly")
        ),
        displayName: dbUser?.youtubeHandle || dbUser?.name || null,
        avatarUrl: dbUser?.image || null,
        channelsCount: youtubeChannels.length,
        lastSyncedAt: youtubeChannels.length > 0 ? youtubeChannels[0].lastSyncedAt : null,
      },
      canUnlink,
      totalAccounts: accounts.length,
    });
  } catch (err: any) {
    console.error("Error in /api/integrations/status:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
