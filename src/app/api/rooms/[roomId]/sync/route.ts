import { NextResponse } from "next/server";

const roomSyncCache = new Map<
  string,
  {
    platform: string;
    channel: string;
    videoId?: string;
    isPlaying: boolean;
    currentTime: number;
    updatedAt: number;
    messages: Array<{
      id: string;
      user: string;
      text: string;
      timestamp: string;
      role?: string;
    }>;
  }
>();

export async function GET(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  const roomId = params.roomId;
  const state = roomSyncCache.get(roomId) || {
    platform: "twitch",
    channel: "ibai",
    isPlaying: true,
    currentTime: 0,
    updatedAt: Date.now(),
    messages: [
      {
        id: "m-welcome",
        user: "StreamSync Bot",
        text: "¡Bienvenidos a la sala! Sincronización activa al milisegundo.",
        timestamp: "Ahora",
        role: "BOT",
      },
    ],
  };

  return NextResponse.json({
    success: true,
    roomId,
    state,
    serverTime: Date.now(),
  });
}

export async function POST(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  const roomId = params.roomId;
  try {
    const body = await request.json();
    const existing = roomSyncCache.get(roomId) || {
      platform: "twitch",
      channel: "ibai",
      isPlaying: true,
      currentTime: 0,
      updatedAt: Date.now(),
      messages: [],
    };

    if (body.action === "update_playback") {
      existing.isPlaying = body.isPlaying !== undefined ? body.isPlaying : existing.isPlaying;
      existing.currentTime = body.currentTime !== undefined ? body.currentTime : existing.currentTime;
      existing.platform = body.platform || existing.platform;
      existing.channel = body.channel || existing.channel;
      existing.videoId = body.videoId || existing.videoId;
      existing.updatedAt = Date.now();
    } else if (body.action === "send_message") {
      existing.messages.push({
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        user: body.user || "Gamer",
        text: body.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        role: body.role || "MEMBER",
      });
      if (existing.messages.length > 50) {
        existing.messages.shift();
      }
    }

    roomSyncCache.set(roomId, existing);

    return NextResponse.json({
      success: true,
      state: existing,
      serverTime: Date.now(),
    });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
