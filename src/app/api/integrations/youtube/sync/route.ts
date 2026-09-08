import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function refreshGoogleToken(account: any) {
  if (!account.refresh_token) return account.access_token;

  try {
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: account.refresh_token,
      client_id: process.env.GOOGLE_CLIENT_ID as string,
      client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
    });

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!res.ok) {
      console.error("Google token refresh failed:", res.status);
      return account.access_token;
    }

    const data = await res.json();
    const expiresAt = data.expires_in ? Math.floor(Date.now() / 1000) + data.expires_in : null;

    await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token: data.access_token,
        expires_at: expiresAt,
        scope: data.scope || account.scope,
      },
    });

    return data.access_token;
  } catch (err) {
    console.error("Error refreshing Google token:", err);
    return account.access_token;
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const account = await prisma.account.findFirst({
      where: { userId, provider: "google" },
    });

    if (!account || !account.access_token) {
      return NextResponse.json(
        { error: "NotConnected", message: "Tu cuenta de Google/YouTube no está conectada." },
        { status: 400 }
      );
    }

    // Refresh token if expired
    let token = account.access_token;
    const isExpired = account.expires_at ? account.expires_at * 1000 < Date.now() : false;
    if (isExpired) {
      token = await refreshGoogleToken(account);
    }

    // Fetch user subscriptions from YouTube Data API v3
    const ytRes = await fetch(
      "https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&maxResults=50",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    if (ytRes.status === 401 || ytRes.status === 403) {
      return NextResponse.json(
        {
          error: "MissingScope",
          message:
            "Se requiere permiso para leer suscripciones de YouTube. Reconecta tu cuenta de Google autorizando el acceso a YouTube.",
        },
        { status: 403 }
      );
    }

    if (!ytRes.ok) {
      const errText = await ytRes.text();
      console.error("YouTube Data API error:", ytRes.status, errText);
      return NextResponse.json(
        {
          error: "YouTubeApiError",
          message: "Error al comunicarse con YouTube. Inténtalo de nuevo más tarde.",
        },
        { status: 502 }
      );
    }

    const ytData = await ytRes.json();
    const items = ytData.items || [];

    if (items.length === 0) {
      await prisma.followedChannel.deleteMany({
        where: { userId, platform: "YOUTUBE" },
      });
      return NextResponse.json({ success: true, count: 0 });
    }

    const now = new Date();

    for (const item of items) {
      const channelId = item.snippet?.resourceId?.channelId;
      if (!channelId) continue;

      const title = item.snippet?.title || "Canal de YouTube";
      const avatarUrl =
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.default?.url ||
        null;

      await prisma.followedChannel.upsert({
        where: {
          userId_platform_channelId: {
            userId,
            platform: "YOUTUBE",
            channelId,
          },
        },
        create: {
          userId,
          platform: "YOUTUBE",
          channelId,
          displayName: title,
          avatarUrl,
          category: "YouTube",
          isLive: false,
          url: `https://www.youtube.com/channel/${channelId}`,
          lastSyncedAt: now,
        },
        update: {
          displayName: title,
          avatarUrl,
          url: `https://www.youtube.com/channel/${channelId}`,
          lastSyncedAt: now,
        },
      });
    }

    return NextResponse.json({
      success: true,
      count: items.length,
      lastSyncedAt: now.toISOString(),
    });
  } catch (err: any) {
    console.error("Error in /api/integrations/youtube/sync:", err);
    return NextResponse.json(
      { error: "SyncFailed", message: "Error al sincronizar canales de YouTube." },
      { status: 500 }
    );
  }
}
