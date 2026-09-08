import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEFAULT_UNAUTHENTICATED_STATUS = {
  twitch: {
    connected: false,
    hasFollowsPermission: false,
    displayName: null,
    avatarUrl: null,
    channelsCount: 0,
    liveCount: 0,
    lastSyncedAt: null,
  },
  canUnlink: false,
  totalAccounts: 0,
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !process.env.DATABASE_URL) {
      // Return safe unauthenticated status instead of throwing or breaking clients
      return NextResponse.json(DEFAULT_UNAUTHENTICATED_STATUS);
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
        where: { userId, platform: "TWITCH" },
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
        },
      }),
    ]);

    const twitchAccount = accounts.find((a) => a.provider === "twitch");
    const twitchLiveCount = channels.filter((c) => c.isLive).length;
    const canUnlink = accounts.length > 1;

    return NextResponse.json({
      twitch: {
        connected: Boolean(twitchAccount),
        hasFollowsPermission: Boolean(twitchAccount?.scope?.includes("user:read:follows")),
        displayName: dbUser?.twitchUsername || dbUser?.name || null,
        avatarUrl: dbUser?.image || null,
        channelsCount: channels.length,
        liveCount: twitchLiveCount,
        lastSyncedAt: channels.length > 0 ? channels[0].lastSyncedAt : null,
      },
      canUnlink,
      totalAccounts: accounts.length,
    });
  } catch (err: any) {
    console.error("Error in /api/integrations/status:", err);
    return NextResponse.json(DEFAULT_UNAUTHENTICATED_STATUS);
  }
}
