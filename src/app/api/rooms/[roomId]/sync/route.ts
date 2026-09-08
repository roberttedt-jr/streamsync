import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

declare global {
  // eslint-disable-next-line no-var
  var __ROOM_SYNC_FALLBACK__:
    | Map<
        string,
        {
          participants: Map<string, any>;
          messages: Array<any>;
          state: any;
        }
      >
    | undefined;
}

const memoryStore =
  globalThis.__ROOM_SYNC_FALLBACK__ ||
  (globalThis.__ROOM_SYNC_FALLBACK__ = new Map());

function getMemoryRoom(roomId: string) {
  let r = memoryStore.get(roomId);
  if (!r) {
    r = {
      participants: new Map(),
      messages: [],
      state: {
        platform: "twitch",
        channel: "",
        isPlaying: true,
        currentTime: 0,
        updatedAt: Date.now(),
      },
    };
    memoryStore.set(roomId, r);
  }
  return r;
}

// Helper to resolve room ID from code or DB
async function resolveRoom(roomId: string) {
  if (roomId.toLowerCase() === "demo") {
    return { id: "demo", code: "demo", isDemo: true };
  }

  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== "") {
    try {
      let room = await prisma.room.findFirst({
        where: {
          OR: [{ code: roomId }, { id: roomId }],
        },
        select: { id: true, code: true, hostId: true, isClosed: true },
      });
      if (!room) {
        // Auto-provision room in DB if user navigates via ad-hoc code/url
        room = await prisma.room.create({
          data: {
            code: roomId,
            name: `Watch Party ${roomId}`,
            platform: "twitch",
            channel: "twitch",
          },
          select: { id: true, code: true, hostId: true, isClosed: true },
        });
      }
      if (room) return room;
    } catch (e) {
      console.error("Error finding or creating room in DB:", e);
    }
  }

  return { id: roomId, code: roomId, isDemo: false };
}

// Prune stale participants (TTL 8 seconds)
async function pruneStaleParticipants(dbRoomId: string) {
  // 1. Prune memory
  const mem = getMemoryRoom(dbRoomId);
  const now = Date.now();
  for (const [connId, p] of mem.participants.entries()) {
    if (now - p.lastSeenAt > 8000) {
      mem.participants.delete(connId);
    }
  }

  // 2. Prune DB
  if (dbRoomId !== "demo" && process.env.DATABASE_URL) {
    try {
      const cutoff = new Date(Date.now() - 8000);
      await prisma.roomParticipant.deleteMany({
        where: {
          roomId: dbRoomId,
          lastSeenAt: { lt: cutoff },
        },
      });
    } catch (e) {
      console.error("Error pruning stale participants in DB:", e);
    }
  }
}

export async function GET(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  const roomId = params.roomId;
  const room = await resolveRoom(roomId);

  await pruneStaleParticipants(room.id);

  let participants: any[] = [];
  let messages: any[] = [];

  if (room.id !== "demo" && process.env.DATABASE_URL) {
    try {
      const [dbParticipants, dbMessages] = await Promise.all([
        prisma.roomParticipant.findMany({
          where: { roomId: room.id },
          orderBy: { joinedAt: "asc" },
        }),
        prisma.roomMessage.findMany({
          where: { roomId: room.id },
          take: 50,
          orderBy: { createdAt: "asc" },
        }),
      ]);

      participants = dbParticipants.map((p) => ({
        id: p.connectionId,
        connectionId: p.connectionId,
        userId: p.userId,
        name: p.name,
        avatar: p.avatar,
        role: p.role,
        isHost: p.role === "HOST",
        micActive: !p.isMuted,
        cameraActive: p.cameraEnabled,
        isSpeaking: p.isSpeaking,
        handRaised: p.handRaised,
        joinedAt: p.joinedAt,
      }));

      messages = dbMessages.map((m) => ({
        id: m.id,
        sender: m.sender,
        avatar: m.avatar,
        text: m.text,
        isHost: m.isHost,
        time: new Date(m.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        timestamp: m.createdAt.toISOString(),
      }));
    } catch (err) {
      console.error("Error fetching room sync in GET:", err);
    }
  } else {
    const mem = getMemoryRoom(room.id);
    participants = Array.from(mem.participants.values());
    messages = mem.messages;
  }

  return NextResponse.json({
    success: true,
    roomId,
    participants,
    messages,
    serverTime: Date.now(),
  });
}

export async function POST(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  const roomId = params.roomId;
  const room = await resolveRoom(roomId);

  try {
    const body = await request.json();
    const action = body.action || "sync";

    // 1. ACTION: LEAVE
    if (action === "leave") {
      const connId = body.connectionId;
      if (connId) {
        if (room.id !== "demo" && process.env.DATABASE_URL) {
          try {
            await prisma.roomParticipant.deleteMany({
              where: { connectionId: connId },
            });
          } catch (e) {
            console.error("Error deleting participant on leave:", e);
          }
        }
        const mem = getMemoryRoom(room.id);
        mem.participants.delete(connId);
      }
      return NextResponse.json({ success: true, left: true });
    }

    // 2. ACTION: SEND MESSAGE
    if (action === "send_message") {
      const text = (body.text || "").trim();
      if (!text) {
        return NextResponse.json({ error: "Empty message" }, { status: 400 });
      }

      const sender = body.sender || body.name || "Invitado";
      const avatar = body.avatar || null;
      const isHost = Boolean(body.isHost);
      const userId = body.userId || null;

      if (room.id !== "demo" && process.env.DATABASE_URL) {
        try {
          await prisma.roomMessage.create({
            data: {
              roomId: room.id,
              userId: userId,
              sender,
              avatar,
              text,
              isHost,
            },
          });
        } catch (e) {
          console.error("Error creating RoomMessage:", e);
        }
      }

      const mem = getMemoryRoom(room.id);
      mem.messages.push({
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sender,
        avatar,
        text,
        isHost,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        timestamp: new Date().toISOString(),
      });
      if (mem.messages.length > 50) mem.messages.shift();
    }

    // 3. ACTION: HEARTBEAT / SYNC
    const connId = body.connectionId;
    if (connId) {
      const name = body.name || "Invitado";
      const avatar = body.avatar || null;
      const role = body.role || (body.isHost ? "HOST" : "MEMBER");
      const isMuted = body.isMuted !== undefined ? Boolean(body.isMuted) : true;
      const cameraEnabled = Boolean(body.cameraEnabled);
      const isSpeaking = Boolean(body.isSpeaking);
      const handRaised = Boolean(body.handRaised);
      const userId = body.userId || null;

      if (room.id !== "demo" && process.env.DATABASE_URL) {
        try {
          await prisma.roomParticipant.upsert({
            where: { connectionId: connId },
            update: {
              lastSeenAt: new Date(),
              name,
              avatar,
              role,
              isMuted,
              cameraEnabled,
              isSpeaking,
              handRaised,
            },
            create: {
              roomId: room.id,
              userId,
              connectionId: connId,
              name,
              avatar,
              role,
              isMuted,
              cameraEnabled,
              isSpeaking,
              handRaised,
              lastSeenAt: new Date(),
            },
          });
        } catch (err) {
          console.error("Error upserting RoomParticipant:", err);
        }
      }

      // Memory fallback
      const mem = getMemoryRoom(room.id);
      mem.participants.set(connId, {
        id: connId,
        connectionId: connId,
        userId,
        name,
        avatar,
        role,
        isHost: role === "HOST",
        micActive: !isMuted,
        cameraActive: cameraEnabled,
        isSpeaking,
        handRaised,
        lastSeenAt: Date.now(),
      });
    }

    // Always prune dead participants
    await pruneStaleParticipants(room.id);

    // Fetch refreshed active participants and recent messages
    let activeParticipants: any[] = [];
    let recentMessages: any[] = [];

    if (room.id !== "demo" && process.env.DATABASE_URL) {
      try {
        const [dbParticipants, dbMessages] = await Promise.all([
          prisma.roomParticipant.findMany({
            where: { roomId: room.id },
            orderBy: { joinedAt: "asc" },
          }),
          prisma.roomMessage.findMany({
            where: { roomId: room.id },
            take: 50,
            orderBy: { createdAt: "asc" },
          }),
        ]);

        activeParticipants = dbParticipants.map((p) => ({
          id: p.connectionId,
          connectionId: p.connectionId,
          userId: p.userId,
          name: p.name,
          avatar: p.avatar,
          role: p.role,
          isHost: p.role === "HOST",
          micActive: !p.isMuted,
          cameraActive: p.cameraEnabled,
          isSpeaking: p.isSpeaking,
          handRaised: p.handRaised,
          joinedAt: p.joinedAt,
        }));

        recentMessages = dbMessages.map((m) => ({
          id: m.id,
          sender: m.sender,
          avatar: m.avatar,
          text: m.text,
          isHost: m.isHost,
          time: new Date(m.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          timestamp: m.createdAt.toISOString(),
        }));
      } catch (e) {
        console.error("Error fetching room sync state:", e);
      }
    }

    if (activeParticipants.length === 0) {
      const mem = getMemoryRoom(room.id);
      activeParticipants = Array.from(mem.participants.values());
      recentMessages = mem.messages;
    }

    return NextResponse.json({
      success: true,
      roomId: room.code,
      participants: activeParticipants,
      messages: recentMessages,
      serverTime: Date.now(),
    });
  } catch (err: any) {
    console.error("Error in sync POST:", err);
    return NextResponse.json(
      { success: false, error: "Internal sync error" },
      { status: 500 }
    );
  }
}
