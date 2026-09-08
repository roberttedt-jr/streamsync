import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json().catch(() => ({}));
    const provider = body.provider;

    if (provider !== "twitch") {
      return NextResponse.json(
        { error: "InvalidProvider", message: "Proveedor no válido. Debe ser twitch." },
        { status: 400 }
      );
    }

    // Check how many accounts user currently has
    const accounts = await prisma.account.findMany({
      where: { userId },
      select: { id: true, provider: true },
    });

    if (accounts.length <= 1) {
      return NextResponse.json(
        {
          error: "CannotUnlinkOnlyMethod",
          message:
            "No puedes desconectar tu único método de inicio de sesión. Conecta otro proveedor antes de desvincular este.",
        },
        { status: 400 }
      );
    }

    const targetAccount = accounts.find((a) => a.provider === provider);
    if (!targetAccount) {
      return NextResponse.json(
        { error: "NotFound", message: "Esta cuenta no está conectada." },
        { status: 404 }
      );
    }

    await prisma.$transaction([
      prisma.account.deleteMany({
        where: { userId, provider: "twitch" },
      }),
      prisma.followedChannel.deleteMany({
        where: { userId, platform: "TWITCH" },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { twitchUsername: null },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Cuenta de Twitch desconectada con éxito.",
      unlinked: "twitch",
    });
  } catch (err: any) {
    console.error("Error in /api/integrations/unlink:", err);
    return NextResponse.json(
      { error: "UnlinkFailed", message: "Error al desconectar la cuenta." },
      { status: 500 }
    );
  }
}
