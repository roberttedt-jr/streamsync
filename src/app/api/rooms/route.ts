import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Almacén global en memoria para garantizar resiliencia si DATABASE_URL no está configurada
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

  // Sala de demostración específica
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

  // Si se solicita un código de sala específico
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
      // Base de datos no disponible, recurrir al almacén en memoria
    }

    // Comprobar en el almacén en memoria
    const memRoom = memoryStore.get(code);
    if (memRoom) {
      return NextResponse.json({ room: memRoom });
    }

    return NextResponse.json({ room: null }, { status: 404 });
  }

  // En caso contrario, listar salas activas desde la base de datos o memoria
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
    // Base de datos no disponible, recurrir a memoria
  }

  // Incluir también salas coincidentes del almacén en memoria si no están en BD
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

  // Ordenar de forma descendente por fecha de creación
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

    // Limpiar identificador del stream
    let cleanChannel = (channel.trim() || streamUrl.trim())
      .replace("https://www.twitch.tv/", "")
      .replace("https://twitch.tv/", "")
      .replace("@", "")
      .trim();

    // Determinar capacidades de comunicación
    const validModes = ["CHAT_ONLY", "VOICE", "VIDEO", "FLEXIBLE"];
    const mode = validModes.includes(communicationMode) ? communicationMode : "FLEXIBLE";
    const allowVoice = mode !== "CHAT_ONLY";
    const allowVideo = mode === "VIDEO" || mode === "FLEXIBLE";

    // Resolver hostId de forma segura desde la sesión o usuario verificado en BD
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
      // No crítico, recurrir a null si la validación falla
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

    // Guardar primero en el almacén en memoria
    memoryStore.set(code, roomRecord);

    // Si DATABASE_URL está configurada, guardar en base de datos
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
