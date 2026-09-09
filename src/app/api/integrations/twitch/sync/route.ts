import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function refreshTwitchToken(account: any) {
  if (!account.refresh_token) return account.access_token;

  try {
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: account.refresh_token,
      client_id: process.env.TWITCH_CLIENT_ID as string,
      client_secret: process.env.TWITCH_CLIENT_SECRET as string,
    });

    const res = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!res.ok) {
      console.error("Twitch token refresh failed:", res.status);
      return account.access_token;
    }

    const data = await res.json();
    const expiresAt = data.expires_in ? Math.floor(Date.now() / 1000) + data.expires_in : null;

    await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token: data.access_token,
        refresh_token: data.refresh_token || account.refresh_token,
        expires_at: expiresAt,
        scope: data.scope ? data.scope.join(" ") : account.scope,
      },
    });

    return data.access_token;
  } catch (err) {
    console.error("Error refreshing Twitch token:", err);
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
      where: { userId, provider: "twitch" },
    });

    if (!account || !account.access_token) {
      return NextResponse.json(
        { error: "NotConnected", message: "Tu cuenta de Twitch no está conectada." },
        { status: 400 }
      );
    }

    // Requerir permiso user:read:follows
    if (!account.scope?.includes("user:read:follows")) {
      return NextResponse.json(
        {
          error: "MissingScope",
          message: "Se requiere autorización para leer canales seguidos de Twitch.",
        },
        { status: 403 }
      );
    }

    // Refrescar token si ha expirado
    let token = account.access_token;
    const isExpired = account.expires_at ? account.expires_at * 1000 < Date.now() : false;
    if (isExpired) {
      token = await refreshTwitchToken(account);
    }

    const clientId = process.env.TWITCH_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({ error: "ServerConfigError" }, { status: 500 });
    }

    // Consultar API Helix de Twitch para obtener canales seguidos
    const helixHeaders = {
      "Client-Id": clientId,
      Authorization: `Bearer ${token}`,
    };

    const followsRes = await fetch(
      `https://api.twitch.tv/helix/channels/followed?user_id=${account.providerAccountId}&first=100`,
      { headers: helixHeaders }
    );

    if (followsRes.status === 401) {
      return NextResponse.json(
        {
          error: "TokenExpired",
          message: "Tu sesión con Twitch ha caducado. Vuelve a autorizar tu cuenta.",
        },
        { status: 401 }
      );
    }

    if (followsRes.status === 403) {
      return NextResponse.json(
        {
          error: "MissingScope",
          message: "Se requiere autorización para leer canales seguidos de Twitch.",
        },
        { status: 403 }
      );
    }

    if (followsRes.status === 429) {
      return NextResponse.json(
        {
          error: "RateLimit",
          message: "Límite de peticiones de Twitch alcanzado. Inténtalo de nuevo en un momento.",
        },
        { status: 429 }
      );
    }

    if (!followsRes.ok) {
      const errText = await followsRes.text();
      console.error("Twitch Helix error:", followsRes.status, errText);
      return NextResponse.json(
        { error: "TwitchApiError", message: "Error al comunicarse con Twitch. Inténtalo de nuevo más tarde." },
        { status: 502 }
      );
    }

    const followsData = await followsRes.json();
    const followedList = followsData.data || [];

    if (followedList.length === 0) {
      await prisma.followedChannel.deleteMany({
        where: { userId, platform: "TWITCH" },
      });
      return NextResponse.json({ success: true, count: 0, liveCount: 0 });
    }

    // Comprobar cuáles de los creadores seguidos están en directo
    const broadcasterIds = followedList.map((f: any) => f.broadcaster_id);
    const liveStreamsMap = new Map<string, { game_name: string; title: string; thumbnail_url: string }>();

    try {
      const streamParams = new URLSearchParams();
      broadcasterIds.slice(0, 100).forEach((id: string) => streamParams.append("user_id", id));

      const streamsRes = await fetch(
        `https://api.twitch.tv/helix/streams?${streamParams.toString()}&first=100`,
        { headers: helixHeaders }
      );

      if (streamsRes.ok) {
        const streamsData = await streamsRes.json();
        (streamsData.data || []).forEach((s: any) => {
          liveStreamsMap.set(s.user_id, {
            game_name: s.game_name || "Twitch",
            title: s.title || "",
            thumbnail_url: s.thumbnail_url || "",
          });
        });
      }
    } catch (streamErr) {
      console.warn("Could not fetch live streams status:", streamErr);
    }

    // Insertar o actualizar canales en la base de datos
    const now = new Date();
    let liveCount = 0;

    for (const f of followedList) {
      const liveInfo = liveStreamsMap.get(f.broadcaster_id);
      const isLive = Boolean(liveInfo);
      if (isLive) liveCount++;

      await prisma.followedChannel.upsert({
        where: {
          userId_platform_channelId: {
            userId,
            platform: "TWITCH",
            channelId: f.broadcaster_id,
          },
        },
        create: {
          userId,
          platform: "TWITCH",
          channelId: f.broadcaster_id,
          displayName: f.broadcaster_name || f.broadcaster_login,
          category: liveInfo?.game_name || null,
          isLive,
          url: `https://twitch.tv/${f.broadcaster_login}`,
          lastSyncedAt: now,
        },
        update: {
          displayName: f.broadcaster_name || f.broadcaster_login,
          category: liveInfo?.game_name || null,
          isLive,
          url: `https://twitch.tv/${f.broadcaster_login}`,
          lastSyncedAt: now,
        },
      });
    }

    return NextResponse.json({
      success: true,
      count: followedList.length,
      liveCount,
      lastSyncedAt: now.toISOString(),
    });
  } catch (err: any) {
    console.error("Error in /api/integrations/twitch/sync:", err);
    return NextResponse.json(
      { error: "SyncFailed", message: "Error al sincronizar canales de Twitch." },
      { status: 500 }
    );
  }
}
