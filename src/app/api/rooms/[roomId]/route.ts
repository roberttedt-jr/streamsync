import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

declare global {
  // eslint-disable-next-line no-var
  var __IN_MEMORY_ROOMS__: Map<string, any> | undefined;
}

const memoryStore = globalThis.__IN_MEMORY_ROOMS__ || new Map();

export async function GET(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  const code = params.roomId;

  if (code === "demo") {
    return NextResponse.json({
      success: true,
      room: {
        id: "demo",
        code: "demo",
        name: "Sala de demostración",
        platform: "twitch",
        channel: "",
        category: "Entretenimiento en directo",
        communicationMode: "FLEXIBLE",
        allowVoice: true,
        allowVideo: true,
        isPrivate: false,
        maxParticipants: 10,
        participants: [],
        isDemo: true,
        createdAt: new Date().toISOString(),
      },
    });
  }

  try {
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== "") {
      const room = await prisma.room.findFirst({
        where: {
          OR: [{ code }, { id: code }],
        },
        include: {
          host: {
            select: { id: true, name: true, image: true, username: true },
          },
          participants: {
            include: {
              user: {
                select: { id: true, name: true, image: true, username: true },
              },
            },
          },
        },
      });

      if (room) {
        if (room.isClosed) {
          return NextResponse.json(
            { success: false, error: "Esta sala ha sido cerrada por el anfitrión", isClosed: true },
            { status: 410 }
          );
        }
        return NextResponse.json({ success: true, room });
      }
    }
  } catch (err) {
    console.error("Error fetching room from DB:", err);
  }

  const memRoom = memoryStore.get(code);
  if (memRoom) {
    if (memRoom.isClosed) {
      return NextResponse.json(
        { success: false, error: "Esta sala ha sido cerrada por el anfitrión", isClosed: true },
        { status: 410 }
      );
    }
    return NextResponse.json({ success: true, room: memRoom });
  }

  return NextResponse.json({ success: false, error: "Sala no encontrada" }, { status: 404 });
}

export async function PATCH(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  const code = params.roomId;

  try {
    const session = await getServerSession(authOptions).catch(() => null);
    const body = await request.json();
    const sessionUserId = (session?.user as any)?.id;
    const callerHostId = body.hostId || sessionUserId;

    // Find existing room
    let existingRoom: any = null;
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== "") {
      existingRoom = await prisma.room.findFirst({
        where: { OR: [{ code }, { id: code }] },
      });
    }

    if (!existingRoom) {
      existingRoom = memoryStore.get(code);
    }

    if (!existingRoom) {
      return NextResponse.json({ success: false, error: "Sala no encontrada" }, { status: 404 });
    }

    // Verify host permission if room has a hostId
    if (existingRoom.hostId && callerHostId && existingRoom.hostId !== callerHostId) {
      return NextResponse.json(
        { success: false, error: "Solo el anfitrión puede modificar los ajustes de la sala" },
        { status: 403 }
      );
    }

    const updates: any = {};
    if (body.name !== undefined) updates.name = String(body.name).trim();
    if (body.category !== undefined) updates.category = String(body.category).trim();
    if (body.isPrivate !== undefined) updates.isPrivate = Boolean(body.isPrivate);
    if (body.communicationMode !== undefined) {
      const valid = ["CHAT_ONLY", "VOICE", "VIDEO", "FLEXIBLE"];
      if (valid.includes(body.communicationMode)) {
        updates.communicationMode = body.communicationMode;
        updates.allowVoice = body.communicationMode !== "CHAT_ONLY";
        updates.allowVideo = body.communicationMode === "VIDEO" || body.communicationMode === "FLEXIBLE";
      }
    }
    if (body.channel !== undefined) updates.channel = String(body.channel).trim();
    if (body.platform !== undefined) updates.platform = body.platform;
    if (body.streamUrl !== undefined) updates.streamUrl = String(body.streamUrl).trim();

    // Update in DB
    let updatedRoom = { ...existingRoom, ...updates };
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== "" && existingRoom.id) {
      try {
        updatedRoom = await prisma.room.update({
          where: { id: existingRoom.id },
          data: updates,
          include: {
            host: {
              select: { id: true, name: true, image: true, username: true },
            },
          },
        });
      } catch (dbErr) {
        console.error("Error updating room in DB:", dbErr);
      }
    }

    memoryStore.set(existingRoom.code, updatedRoom);

    return NextResponse.json({ success: true, room: updatedRoom });
  } catch (error: any) {
    console.error("Error in PATCH room:", error);
    return NextResponse.json({ success: false, error: "Error al actualizar la sala" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  const code = params.roomId;

  try {
    const session = await getServerSession(authOptions).catch(() => null);
    const sessionUserId = (session?.user as any)?.id;

    // Also check query param or body for hostId fallback
    const { searchParams } = new URL(request.url);
    const queryHostId = searchParams.get("hostId");

    let existingRoom: any = null;
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== "") {
      existingRoom = await prisma.room.findFirst({
        where: { OR: [{ code }, { id: code }] },
      });
    }

    if (!existingRoom) {
      existingRoom = memoryStore.get(code);
    }

    if (!existingRoom) {
      return NextResponse.json({ success: false, error: "Sala no encontrada" }, { status: 404 });
    }

    // Host verification
    const callerId = sessionUserId || queryHostId;
    if (existingRoom.hostId && (!callerId || existingRoom.hostId !== callerId)) {
      return NextResponse.json(
        { success: false, error: "Solo el anfitrión de la sala puede eliminarla" },
        { status: 403 }
      );
    }

    // Mark closed / delete from DB
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== "" && existingRoom.id) {
      try {
        await prisma.room.update({
          where: { id: existingRoom.id },
          data: { isClosed: true },
        });
      } catch (err) {
        console.error("Error marking room closed in DB:", err);
      }
    }

    // Remove from active memory store or mark closed
    if (memoryStore.has(existingRoom.code)) {
      const mem = memoryStore.get(existingRoom.code);
      if (mem) mem.isClosed = true;
      memoryStore.delete(existingRoom.code);
    }

    return NextResponse.json({
      success: true,
      message: "Watch Party eliminada de forma segura",
      roomId: existingRoom.code,
    });
  } catch (error: any) {
    console.error("Error deleting room:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar la Watch Party" },
      { status: 500 }
    );
  }
}
