import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Global in-memory room store to ensure resilience if DATABASE_URL is not configured
declare global {
  // eslint-disable-next-line no-var
  var __IN_MEMORY_ROOMS__: Map<string, any> | undefined;
}

if (!globalThis.__IN_MEMORY_ROOMS__) {
  globalThis.__IN_MEMORY_ROOMS__ = new Map();
}

const memoryStore = globalThis.__IN_MEMORY_ROOMS__;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const platform = searchParams.get("platform");
  const category = searchParams.get("category");
  const search = searchParams.get("search")?.toLowerCase().trim();
  const hostId = searchParams.get("hostId");

  // Specific demo room
  if (code === "demo") {
    return NextResponse.json({
      room: {
        id: "demo",
        code: "demo",
        name: "Sala de demostración",
        platform: "twitch",
        channel: "",
        category: "Entretenimiento en directo",
        description: "Vista previa interactiva de StreamSync",
        isPrivate: false,
        maxParticipants: 10,
        participants: [],
        isDemo: true,
        createdAt: new Date().toISOString(),
      },
    });
  }

  // If a specific room code is requested
  if (code) {
    try {
      if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== "") {
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
            host: {
              select: { id: true, name: true, image: true, username: true },
            },
          },
        });

        if (room) {
          return NextResponse.json({ room });
        }
      }
    } catch {
      // Database unavailable, fallback to memory store
    }

    // Check in-memory store
    const memRoom = memoryStore.get(code);
    if (memRoom) {
      return NextResponse.json({ room: memRoom });
    }

    return NextResponse.json({ room: null }, { status: 404 });
  }

  // Otherwise, list active rooms from real database or active memory
  let realRooms: any[] = [];

  try {
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== "") {
      const whereClause: any = {
        isClosed: false,
        ...(hostId ? { hostId } : { isPrivate: false }),
      };

      if (platform && platform !== "all") {
        whereClause.platform = platform;
      }

      if (category && category !== "all") {
        whereClause.category = { equals: category, mode: "insensitive" };
      }

      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { channel: { contains: search, mode: "insensitive" } },
          { category: { contains: search, mode: "insensitive" } },
        ];
      }

      const dbRooms = await prisma.room.findMany({
        where: whereClause,
        include: {
          participants: {
            include: {
              user: { select: { id: true, name: true, image: true, username: true } },
            },
          },
          host: {
            select: { id: true, name: true, image: true, username: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      if (dbRooms && dbRooms.length > 0) {
        realRooms = dbRooms.map((r) => ({
          ...r,
          participantCount: r.participants.length,
        }));
      }
    }
  } catch {
    // Database unavailable, fallback to memory
  }

  // Also include matching rooms from memory store if not already in DB
  const existingCodes = new Set(realRooms.map((r) => r.code));
  for (const r of memoryStore.values()) {
    if (r.isClosed) continue;
    if (existingCodes.has(r.code)) continue;

    if (hostId && r.hostId !== hostId) continue;
    if (!hostId && r.isPrivate) continue;
    if (platform && platform !== "all" && r.platform !== platform) continue;
    if (category && category !== "all" && r.category?.toLowerCase() !== category.toLowerCase()) continue;
    if (search) {
      const matchName = r.name?.toLowerCase().includes(search);
      const matchChannel = r.channel?.toLowerCase().includes(search);
      const matchCat = r.category?.toLowerCase().includes(search);
      if (!matchName && !matchChannel && !matchCat) continue;
    }

    realRooms.push(r);
  }

  // Sort descending by creation
  realRooms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({ rooms: realRooms });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      code,
      name,
      platform = "twitch",
      channel = "",
      streamUrl = "",
      category = "Entretenimiento",
      description = "",
      isPrivate = false,
      hostId = null,
      maxParticipants = 10,
      password = null,
      communicationMode = "FLEXIBLE",
    } = body;

    if (!code) {
      return NextResponse.json({ error: "El código de sala es requerido" }, { status: 400 });
    }

    // Clean stream identifier
    let cleanChannel = (channel.trim() || streamUrl.trim())
      .replace("https://www.twitch.tv/", "")
      .replace("https://twitch.tv/", "")
      .replace("@", "")
      .trim();

    // Determine communication capabilities
    const validModes = ["CHAT_ONLY", "VOICE", "VIDEO", "FLEXIBLE"];
    const mode = validModes.includes(communicationMode) ? communicationMode : "FLEXIBLE";
    const allowVoice = mode !== "CHAT_ONLY";
    const allowVideo = mode === "VIDEO" || mode === "FLEXIBLE";

    // Securely resolve hostId from session or verified DB user
    let validHostId: string | null = null;
    try {
      const session = await getServerSession(authOptions).catch(() => null);
      if (session?.user && (session.user as any).id) {
        validHostId = (session.user as any).id;
      } else if (hostId && process.env.DATABASE_URL) {
        const existingUser = await prisma.user.findUnique({
          where: { id: hostId },
          select: { id: true },
        });
        if (existingUser) validHostId = existingUser.id;
      }
    } catch {
      // Non-critical, fallback to null if validation fails
    }

    const roomRecord = {
      code,
      name: name || `Watch Party de ${category}`,
      platform,
      channel: cleanChannel,
      streamUrl: streamUrl || cleanChannel,
      category: category || "Entretenimiento",
      description: description || null,
      isPrivate: Boolean(isPrivate),
      maxParticipants: maxParticipants ? parseInt(String(maxParticipants), 10) : 10,
      password: password ? String(password).trim() : null,
      communicationMode: mode,
      allowVoice,
      allowVideo,
      isClosed: false,
      hostId: validHostId,
      createdAt: new Date().toISOString(),
      participants: [],
      participantCount: 0,
    };

    // Save to memory store first
    memoryStore.set(code, roomRecord);

    // If DATABASE_URL is configured, save to database
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== "") {
      try {
        const room = await prisma.room.upsert({
          where: { code },
          update: {
            name: roomRecord.name,
            platform: roomRecord.platform,
            channel: roomRecord.channel,
            streamUrl: roomRecord.streamUrl,
            category: roomRecord.category,
            description: roomRecord.description,
            isPrivate: roomRecord.isPrivate,
            maxParticipants: roomRecord.maxParticipants,
            password: roomRecord.password,
            communicationMode: roomRecord.communicationMode,
            allowVoice: roomRecord.allowVoice,
            allowVideo: roomRecord.allowVideo,
            isClosed: false,
          },
          create: {
            code: roomRecord.code,
            name: roomRecord.name,
            platform: roomRecord.platform,
            channel: roomRecord.channel,
            streamUrl: roomRecord.streamUrl,
            category: roomRecord.category,
            description: roomRecord.description,
            isPrivate: roomRecord.isPrivate,
            maxParticipants: roomRecord.maxParticipants,
            password: roomRecord.password,
            communicationMode: roomRecord.communicationMode,
            allowVoice: roomRecord.allowVoice,
            allowVideo: roomRecord.allowVideo,
            isClosed: false,
            hostId: roomRecord.hostId,
          },
          include: {
            host: {
              select: { id: true, name: true, image: true, username: true },
            },
          },
        });

        return NextResponse.json({ success: true, room, watchParty: room });
      } catch (dbErr) {
        console.error("Database upsert error, keeping memory store:", dbErr);
      }
    }

    return NextResponse.json({ success: true, room: roomRecord, watchParty: roomRecord });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json({ error: "Payload inválido para crear la sala" }, { status: 400 });
  }
}
