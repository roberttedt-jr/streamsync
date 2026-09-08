import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface RefreshResult {
  token: string | null;
  expiredOrRevoked?: boolean;
}

async function refreshGoogleToken(account: any): Promise<RefreshResult> {
  if (!account.refresh_token) {
    return { token: account.access_token };
  }

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
      console.error("Google token refresh failed with status:", res.status);
      return { token: null, expiredOrRevoked: true };
    }

    const data = await res.json();
    const expiresAt = data.expires_in
      ? Math.floor(Date.now() / 1000) + data.expires_in
      : null;

    await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token: data.access_token,
        expires_at: expiresAt,
        scope: data.scope || account.scope,
      },
    });

    return { token: data.access_token };
  } catch (err) {
    console.error("Error refreshing Google token:", err);
    return { token: account.access_token };
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          ok: false,
          code: "UNAUTHORIZED",
          message: "Debes iniciar sesión para sincronizar tus suscripciones.",
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log("[YouTube Sync] Initiation request for user:", userId);

    // Retrieve account strictly from DB using session user ID
    const account = await prisma.account.findFirst({
      where: { userId, provider: "google" },
    });

    if (!account || !account.access_token) {
      console.warn("[YouTube Sync] Rejected: no Google account or token for user:", userId);
      return NextResponse.json(
        {
          ok: false,
          code: "YOUTUBE_NOT_CONNECTED",
          message: "Conecta YouTube antes de sincronizar tus suscripciones.",
        },
        { status: 400 }
      );
    }

    // Validate youtube.readonly permission
    const hasYoutubeScope = Boolean(
      account.scope?.includes("youtube.readonly") ||
        account.scope?.includes("https://www.googleapis.com/auth/youtube.readonly")
    );

    if (!hasYoutubeScope) {
      return NextResponse.json(
        {
          ok: false,
          code: "YOUTUBE_PERMISSION_REQUIRED",
          message: "Autoriza el acceso a tus suscripciones de YouTube.",
        },
        { status: 403 }
      );
    }

    // Check expiration and refresh token if needed
    let token = account.access_token;
    const isExpired = account.expires_at
      ? account.expires_at * 1000 < Date.now() + 60000
      : false;

    if (isExpired) {
      const refreshed = await refreshGoogleToken(account);
      if (refreshed.expiredOrRevoked || !refreshed.token) {
        return NextResponse.json(
          {
            ok: false,
            code: "YOUTUBE_TOKEN_EXPIRED",
            message: "Tu sesión de Google/YouTube ha caducado. Vuelve a autorizar tu cuenta.",
          },
          { status: 401 }
        );
      }
      token = refreshed.token;
    }

    // Fetch user subscriptions with pagination
    let nextPageToken: string | undefined = undefined;
    const allItems: any[] = [];
    let pageCount = 0;
    const MAX_PAGES = 5; // Up to 250 subscriptions maximum

    do {
      const url = new URL("https://www.googleapis.com/youtube/v3/subscriptions");
      url.searchParams.set("part", "snippet,contentDetails");
      url.searchParams.set("mine", "true");
      url.searchParams.set("maxResults", "50");
      if (nextPageToken) {
        url.searchParams.set("pageToken", nextPageToken);
      }

      const ytRes = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (ytRes.status === 401) {
        return NextResponse.json(
          {
            ok: false,
            code: "YOUTUBE_TOKEN_EXPIRED",
            message: "Tu sesión de Google/YouTube ha caducado. Vuelve a autorizar tu cuenta.",
          },
          { status: 401 }
        );
      }

      if (ytRes.status === 403) {
        const errJson = await ytRes.json().catch(() => ({}));
        const reason = errJson?.error?.errors?.[0]?.reason;
        if (reason === "quotaExceeded") {
          return NextResponse.json(
            {
              ok: false,
              code: "YOUTUBE_QUOTA_EXCEEDED",
              message: "Cuota de la API de YouTube agotada temporalmente. Inténtalo más tarde.",
            },
            { status: 429 }
          );
        }
        return NextResponse.json(
          {
            ok: false,
            code: "YOUTUBE_PERMISSION_REQUIRED",
            message: "Autoriza el acceso a tus suscripciones de YouTube.",
          },
          { status: 403 }
        );
      }

      if (ytRes.status === 404) {
        return NextResponse.json(
          {
            ok: false,
            code: "YOUTUBE_NOT_FOUND",
            message: "No se encontró el recurso o canal de YouTube.",
          },
          { status: 404 }
        );
      }

      if (ytRes.status === 429) {
        return NextResponse.json(
          {
            ok: false,
            code: "YOUTUBE_RATE_LIMITED",
            message: "Demasiadas peticiones a YouTube. Espera un momento antes de reintentar.",
          },
          { status: 429 }
        );
      }

      if (!ytRes.ok) {
        console.error("YouTube Data API response error status:", ytRes.status);
        return NextResponse.json(
          {
            ok: false,
            code: "YOUTUBE_API_ERROR",
            message: "Error al comunicarse con el servicio de YouTube.",
          },
          { status: 502 }
        );
      }

      const ytData = await ytRes.json();
      if (Array.isArray(ytData.items)) {
        allItems.push(...ytData.items);
      }

      nextPageToken = ytData.nextPageToken;
      pageCount++;
    } while (nextPageToken && pageCount < MAX_PAGES);

    const now = new Date();

    if (allItems.length === 0) {
      await prisma.followedChannel.deleteMany({
        where: { userId, platform: "YOUTUBE" },
      });

      return NextResponse.json({
        ok: true,
        success: true,
        count: 0,
        channels: [],
        syncedAt: now.toISOString(),
      });
    }

    const savedChannels: any[] = [];

    for (const item of allItems) {
      const channelId = item.snippet?.resourceId?.channelId;
      if (!channelId) continue;

      const title = item.snippet?.title || "Canal de YouTube";
      const avatarUrl =
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.default?.url ||
        null;
      const channelUrl = `https://www.youtube.com/channel/${channelId}`;

      const saved = await prisma.followedChannel.upsert({
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
          url: channelUrl,
          lastSyncedAt: now,
        },
        update: {
          displayName: title,
          avatarUrl,
          url: channelUrl,
          lastSyncedAt: now,
        },
      });

      savedChannels.push({
        channelId: saved.channelId,
        displayName: saved.displayName,
        avatarUrl: saved.avatarUrl,
        url: saved.url,
      });
    }

    console.log("[YouTube Sync] Completed successfully. Channels synced:", savedChannels.length);

    return NextResponse.json({
      ok: true,
      success: true,
      count: savedChannels.length,
      channels: savedChannels,
      syncedAt: now.toISOString(),
    });
  } catch (err: any) {
    console.error("Error in /api/integrations/youtube/sync:", err?.message || err);
    return NextResponse.json(
      {
        ok: false,
        code: "YOUTUBE_API_ERROR",
        message: "Error al sincronizar canales de YouTube. Inténtalo de nuevo.",
      },
      { status: 500 }
    );
  }
}
