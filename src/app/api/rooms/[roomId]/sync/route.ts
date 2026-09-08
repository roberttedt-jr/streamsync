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
    return { id: "demo", code: "demo", isDemo: true, isClosed: false };
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

  return { id: roomId, code: roomId, isDemo: false, isClosed: false };
}

// Prune stale participants (TTL 6 seconds) and stale signals (TTL 30 seconds)
async function pruneStaleParticipants(dbRoomId: string) {
  // 1. Prune memory
  const mem = getMemoryRoom(dbRoomId);
  const now = Date.now();
  for (const [connId, p] of mem.participants.entries()) {
    if (now - p.lastSeenAt > 6000) {
      mem.participants.delete(connId);
    }
  }

  // 2. Prune DB
  if (dbRoomId !== "demo" && process.env.DATABASE_URL) {
    try {
      const participantCutoff = new Date(Date.now() - 6000);
      const signalCutoff = new Date(Date.now() - 30000);

      await Promise.all([
        prisma.roomParticipant.deleteMany({
          where: {
            roomId: dbRoomId,
            lastSeenAt: { lt: participantCutoff },
          },
        }),
        prisma.roomSignal.deleteMany({
          where: {
            roomId: dbRoomId,
            createdAt: { lt: signalCutoff },
          },
        }),
      ]);
    } catch (e) {
      console.error("Error pruning in DB:", e);
    }
  }
}

export async function GET(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  const roomId = params.roomId;
  const room = await resolveRoom(roomId);

  if (room.isClosed) {
    return NextResponse.json(
      { success: false, isClosed: true, error: "Esta sala ha sido cerrada por el anfitrión" },
      { status: 410 }
    );
  }

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
    signals: [],
    serverTime: Date.now(),
  });
}

// In-memory rate limiting map for chat: connectionId -> timestamps
const messageRateLimits = new Map<string, number[]>();

export async function POST(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  const roomId = params.roomId;
  const room = await resolveRoom(roomId);

  if (room.isClosed) {
    return NextResponse.json(
      { success: false, isClosed: true, error: "Esta sala ha sido cerrada por el anfitrión" },
      { status: 410 }
    );
  }

  try {
    const body = await request.json();
    const action = body.action || "sync";
    const connId = body.connectionId;

    // 1. ACTION: LEAVE
    if (action === "leave") {
      if (connId) {
        if (room.id !== "demo" && process.env.DATABASE_URL) {
          try {
            await Promise.all([
              prisma.roomParticipant.deleteMany({
                where: { connectionId: connId },
              }),
              prisma.roomSignal.deleteMany({
                where: {
                  roomId: room.id,
                  OR: [
                    { senderConnectionId: connId },
                    { targetConnectionId: connId },
                  ],
                },
              }),
            ]);
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
      let text = String(body.text || "").trim();
      if (!text) {
        return NextResponse.json({ error: "Empty message" }, { status: 400 });
      }

      // Enforce max 500 characters
      if (text.length > 500) {
        text = text.slice(0, 500);
      }

      // Basic rate limiting: max 5 messages in 5 seconds per connectionId
      if (connId) {
        const now = Date.now();
        const timestamps = (messageRateLimits.get(connId) || []).filter(
          (t) => now - t < 5000
        );
        if (timestamps.length >= 6) {
          return NextResponse.json(
            { error: "Estás enviando mensajes demasiado rápido. Por favor, espera un momento." },
            { status: 429 }
          );
        }
        timestamps.push(now);
        messageRateLimits.set(connId, timestamps);
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

    // 3. PROCESS OUTGOING WEBRTC SIGNALS
    if (Array.isArray(body.signals) && body.signals.length > 0 && connId) {
      const validSignals = body.signals
        .filter((s: any) => s && s.targetConnectionId && s.type && s.payload)
        .map((s: any) => ({
          roomId: room.id,
          senderConnectionId: connId,
          targetConnectionId: String(s.targetConnectionId),
          type: String(s.type),
          payload: typeof s.payload === "string" ? s.payload : JSON.stringify(s.payload),
        }));

      if (validSignals.length > 0 && room.id !== "demo" && process.env.DATABASE_URL) {
        try {
          await prisma.roomSignal.createMany({ data: validSignals });
        } catch (err) {
          console.error("Error saving room signals in DB:", err);
        }
      }

      // In-memory fallback for signaling
      const mem = getMemoryRoom(room.id);
      if (!mem.signals) mem.signals = [];
      for (const vs of validSignals) {
        mem.signals.push({
          id: `sig-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          ...vs,
          createdAt: new Date(),
        });
      }
      if (mem.signals.length > 100) mem.signals = mem.signals.slice(-50);
    }

    // 4. ACTION: HEARTBEAT / SYNC PARTICIPANT
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

    // Always prune dead participants and old signals
    await pruneStaleParticipants(room.id);

    // Fetch refreshed active participants, recent messages, and pending signals
    let activeParticipants: any[] = [];
    let recentMessages: any[] = [];
    let incomingSignals: any[] = [];

    if (room.id !== "demo" && process.env.DATABASE_URL) {
      try {
        const [dbParticipants, dbMessages, dbSignals] = await Promise.all([
          prisma.roomParticipant.findMany({
            where: { roomId: room.id },
            orderBy: { joinedAt: "asc" },
          }),
          prisma.roomMessage.findMany({
            where: { roomId: room.id },
            take: 50,
            orderBy: { createdAt: "asc" },
          }),
          connId
            ? prisma.roomSignal.findMany({
                where: { roomId: room.id, targetConnectionId: connId },
                orderBy: { createdAt: "asc" },
                take: 25,
              })
            : Promise.resolve([]),
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

        if (dbSignals.length > 0) {
          incomingSignals = dbSignals.map((s) => ({
            id: s.id,
            senderConnectionId: s.senderConnectionId,
            targetConnectionId: s.targetConnectionId,
            type: s.type,
            payload: (() => {
              try {
                return JSON.parse(s.payload);
              } catch {
                return s.payload;
              }
            })(),
            createdAt: s.createdAt,
          }));

          // Delete consumed signals atomically
          await prisma.roomSignal.deleteMany({
            where: { id: { in: dbSignals.map((s) => s.id) } },
          }).catch(() => {});
        }
      } catch (e) {
        console.error("Error fetching room sync state:", e);
      }
    }

    if (activeParticipants.length === 0) {
      const mem = getMemoryRoom(room.id);
      activeParticipants = Array.from(mem.participants.values());
      recentMessages = mem.messages;
    }

    if (incomingSignals.length === 0 && connId) {
      const mem = getMemoryRoom(room.id);
      if (mem.signals && mem.signals.length > 0) {
        const matching = mem.signals.filter((s: any) => s.targetConnectionId === connId);
        if (matching.length > 0) {
          incomingSignals = matching.map((s: any) => ({
            id: s.id,
            senderConnectionId: s.senderConnectionId,
            targetConnectionId: s.targetConnectionId,
            type: s.type,
            payload: (() => {
              try {
                return JSON.parse(s.payload);
              } catch {
                return s.payload;
              }
            })(),
            createdAt: s.createdAt,
          }));
          mem.signals = mem.signals.filter((s: any) => s.targetConnectionId !== connId);
        }
      }
    }

    return NextResponse.json({
      success: true,
      roomId: room.code,
      participants: activeParticipants,
      messages: recentMessages,
      signals: incomingSignals,
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

