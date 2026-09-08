import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_ROOMS = [
  {
    id: "room_vct_2026",
    code: "vct-finals",
    name: "VCT Masters 2026 - Gran Final en Directo",
    platform: "twitch",
    channel: "valorant",
    isPrivate: false,
    maxParticipants: 50,
    participantCount: 18,
    category: "FPS / Esports",
    host: { name: "AlexGamer", username: "alex_pro" },
    createdAt: new Date().toISOString(),
  },
  {
    id: "room_lofi_dev",
    code: "lofi-chill",
    name: "Lofi Beats & Chill Coding Party",
    platform: "youtube",
    channel: "jfKfPfyJRdk",
    isPrivate: false,
    maxParticipants: 25,
    participantCount: 12,
    category: "Música / Chill",
    host: { name: "DevStreamer", username: "devstreamer" },
    createdAt: new Date().toISOString(),
  },
  {
    id: "room_cs2_major",
    code: "cs2-major",
    name: "CS2 Major Championship Watch Party",
    platform: "twitch",
    channel: "eslcs",
    isPrivate: false,
    maxParticipants: 50,
    participantCount: 24,
    category: "FPS / Esports",
    host: { name: "CyberWolf", username: "cyberwolf" },
    createdAt: new Date().toISOString(),
  },
  {
    id: "room_rlcs",
    code: "rlcs-eu",
    name: "RLCS Europe Open - Watch Party con amigos",
    platform: "twitch",
    channel: "rocketleague",
    isPrivate: false,
    maxParticipants: 15,
    participantCount: 7,
    category: "Esports / Deportes",
    host: { name: "TurboFan", username: "turbofan" },
    createdAt: new Date().toISOString(),
  },
  {
    id: "room_synthwave",
    code: "synthwave-lounge",
    name: "Retro Synthwave & Neon Vibing",
    platform: "youtube",
    channel: "4xDzrJKXOOY",
    isPrivate: false,
    maxParticipants: 30,
    participantCount: 9,
    category: "Música / Synth",
    host: { name: "NeonRider", username: "neonrider" },
    createdAt: new Date().toISOString(),
  },
  {
    id: "room_variety",
    code: "gaming-night",
    name: "Viernes de Gaming y Charlas en Directo",
    platform: "twitch",
    channel: "illojuan",
    isPrivate: false,
    maxParticipants: 20,
    participantCount: 15,
    category: "Variedad / Humor",
    host: { name: "ElenaM", username: "elenagamer" },
    createdAt: new Date().toISOString(),
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const platform = searchParams.get("platform");
  const search = searchParams.get("search")?.toLowerCase();

  // If a specific room code is requested
  if (code) {
    try {
      const room = await prisma.room.findUnique({
        where: { code },
        include: {
          participants: {
            include: {
              user: {
                select: { id: true, name: true, image: true, username: true },
              },
            },
          },
        },
      });

      if (!room) {
        const foundDefault = DEFAULT_ROOMS.find((r) => r.code === code);
        return NextResponse.json({
          room: foundDefault || {
            code,
            name: `Sala ${code.toUpperCase()}`,
            platform: "twitch",
            channel: "",
            isPrivate: false,
            participants: [],
          },
        });
      }

      return NextResponse.json({ room });
    } catch {
      const foundDefault = DEFAULT_ROOMS.find((r) => r.code === code);
      return NextResponse.json({
        room: foundDefault || {
          code,
          name: `Sala ${code.toUpperCase()}`,
          platform: "twitch",
          channel: "",
          isPrivate: false,
          participants: [],
        },
      });
    }
  }

  // Otherwise, list active rooms
  try {
    const dbRooms = await prisma.room.findMany({
      where: {
        isPrivate: false,
        ...(platform && platform !== "all" ? { platform } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { channel: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, image: true, username: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    if (dbRooms && dbRooms.length > 0) {
      const mapped = dbRooms.map((r) => ({
        ...r,
        participantCount: r.participants.length,
      }));
      return NextResponse.json({ rooms: mapped });
    }
  } catch {}

  // Fallback to default community rooms
  let filtered = DEFAULT_ROOMS;
  if (platform && platform !== "all") {
    filtered = filtered.filter((r) => r.platform === platform);
  }
  if (search) {
    filtered = filtered.filter(
      (r) =>
        r.name.toLowerCase().includes(search) ||
        r.channel.toLowerCase().includes(search) ||
        r.category.toLowerCase().includes(search)
    );
  }

  return NextResponse.json({ rooms: filtered });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, platform, channel, isPrivate, hostId, maxParticipants, password } = body;

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    try {
      const room = await prisma.room.upsert({
        where: { code },
        update: {
          name: name || undefined,
          platform: platform || undefined,
          channel: channel || undefined,
          isPrivate: isPrivate !== undefined ? isPrivate : undefined,
          maxParticipants: maxParticipants ? parseInt(String(maxParticipants), 10) : undefined,
          password: password || undefined,
        },
        create: {
          code,
          name: name || `Sala de Gaming ${code.toUpperCase()}`,
          platform: platform || "twitch",
          channel: channel || "",
          isPrivate: isPrivate || false,
          maxParticipants: maxParticipants ? parseInt(String(maxParticipants), 10) : 25,
          password: password || null,
          hostId: hostId || null,
        },
      });

      return NextResponse.json({ success: true, room });
    } catch {
      return NextResponse.json({
        success: true,
        room: {
          code,
          name: name || `Sala de Gaming ${code.toUpperCase()}`,
          platform: platform || "twitch",
          channel: channel || "",
          isPrivate: isPrivate || false,
          maxParticipants: maxParticipants || 25,
        },
      });
    }
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
