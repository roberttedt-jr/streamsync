import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      friends: {
        include: {
          friend: true,
        },
      },
    },
  });

  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { username } = body;

  if (!username || typeof username !== "string" || username.trim().length < 3) {
    return NextResponse.json({ error: "Invalid username" }, { status: 400 });
  }

  const normalized = username.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { username: normalized },
  });

  if (existing && existing.email !== session.user.email) {
    return NextResponse.json({ error: "Username already taken" }, { status: 409 });
  }

  const updated = await prisma.user.update({
    where: { email: session.user.email },
    data: { username: normalized },
  });

  return NextResponse.json({ user: updated });
}
