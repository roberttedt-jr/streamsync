import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Room code is required" }, { status: 400 });
  }

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
      return NextResponse.json({
        room: {
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
  } catch (error) {
    return NextResponse.json({
      room: {
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, platform, channel, isPrivate, hostId } = body;

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
        },
        create: {
          code,
          name: name || `Sala de Gaming ${code.toUpperCase()}`,
          platform: platform || "twitch",
          channel: channel || "",
          isPrivate: isPrivate || false,
          hostId: hostId || null,
        },
      });

      return NextResponse.json({ success: true, room });
    } catch (dbErr) {
      return NextResponse.json({
        success: true,
        room: {
          code,
          name: name || `Sala de Gaming ${code.toUpperCase()}`,
          platform: platform || "twitch",
          channel: channel || "",
          isPrivate: isPrivate || false,
        },
      });
    }
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
