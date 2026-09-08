import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
        category: "Entretenimiento",
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

      if (!room) {
        return NextResponse.json({ room: null, error: "Sala no encontrada" }, { status: 404 });
      }

      return NextResponse.json({ room });
    } catch (error) {
      console.error("Error fetching room:", error);
      return NextResponse.json({ room: null, error: "Error al consultar la sala" }, { status: 500 });
    }
  }

  // Otherwise, list active rooms from real database
  try {
    const whereClause: any = {
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

    const mapped = (dbRooms || []).map((r) => ({
      ...r,
      participantCount: r.participants.length,
    }));

    return NextResponse.json({ rooms: mapped });
  } catch (error) {
    console.error("Error listing rooms:", error);
    // Never return fake data when DB is empty or fails
    return NextResponse.json({ rooms: [] });
  }
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
    } = body;

    if (!code) {
      return NextResponse.json({ error: "El código de sala es requerido" }, { status: 400 });
    }

    // Clean stream identifier
    let cleanChannel = channel.trim() || streamUrl.trim();
    if (platform === "twitch") {
      cleanChannel = cleanChannel
        .replace("https://www.twitch.tv/", "")
        .replace("https://twitch.tv/", "")
        .replace("@", "")
        .trim();
    } else if (platform === "youtube") {
      if (cleanChannel.includes("v=")) {
        cleanChannel = cleanChannel.split("v=")[1].split("&")[0];
      } else if (cleanChannel.includes("youtu.be/")) {
        cleanChannel = cleanChannel.split("youtu.be/")[1].split("?")[0];
      } else if (cleanChannel.includes("youtube.com/live/")) {
        cleanChannel = cleanChannel.split("youtube.com/live/")[1].split("?")[0];
      }
    }

    try {
      const room = await prisma.room.upsert({
        where: { code },
        update: {
          name: name || undefined,
          platform,
          channel: cleanChannel || undefined,
          streamUrl: streamUrl || undefined,
          category: category || "Entretenimiento",
          description: description || null,
          isPrivate: Boolean(isPrivate),
          maxParticipants: maxParticipants ? parseInt(String(maxParticipants), 10) : 10,
          password: password ? String(password).trim() : null,
        },
        create: {
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
          hostId: hostId || null,
        },
        include: {
          host: {
            select: { id: true, name: true, image: true, username: true },
          },
        },
      });

      return NextResponse.json({ success: true, room });
    } catch (dbErr) {
      console.error("Database upsert error:", dbErr);
      // Fallback in-memory response if DB connection has temporary issue
      return NextResponse.json({
        success: true,
        room: {
          code,
          name: name || `Watch Party de ${category}`,
          platform,
          channel: cleanChannel,
          streamUrl,
          category,
          description,
          isPrivate: Boolean(isPrivate),
          maxParticipants: maxParticipants || 10,
          createdAt: new Date().toISOString(),
          participants: [],
        },
      });
    }
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json({ error: "Payload inválido para crear la sala" }, { status: 400 });
  }
}
