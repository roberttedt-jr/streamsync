import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !process.env.DATABASE_URL) {
      return NextResponse.json({ channels: [] });
    }

    const { searchParams } = new URL(req.url);
    const platform = searchParams.get("platform")?.toUpperCase();
    const liveOnly = searchParams.get("liveOnly") === "true";

    const where: any = { userId: session.user.id };
    if (platform === "TWITCH" || platform === "YOUTUBE") {
      where.platform = platform;
    }
    if (liveOnly) {
      where.isLive = true;
    }

    const channels = await prisma.followedChannel.findMany({
      where,
      orderBy: [{ isLive: "desc" }, { displayName: "asc" }],
      select: {
        id: true,
        platform: true,
        channelId: true,
        displayName: true,
        avatarUrl: true,
        category: true,
        isLive: true,
        url: true,
        lastSyncedAt: true,
      },
    });

    return NextResponse.json({ channels });
  } catch (err: any) {
    console.error("Error in /api/integrations/channels:", err);
    return NextResponse.json({ channels: [] });
  }
}
