import { NextResponse } from "next/server";
import { createUser, createSession } from "@/lib/userStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, username, email, password, avatar, bio, twitchUsername, youtubeHandle } = body;

    if (!username || username.trim().length < 3) {
      return NextResponse.json(
        { error: "El nombre de usuario debe tener al menos 3 caracteres." },
        { status: 400 }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Introduce un correo electrónico válido." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres." },
        { status: 400 }
      );
    }

    const user = await createUser({
      name: name || username,
      username,
      email,
      password,
      avatar,
      bio,
      twitchUsername,
      youtubeHandle,
    });

    const token = createSession(user.id);

    const response = NextResponse.json({ success: true, user });
    response.cookies.set("streamsync_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error al registrar el usuario." },
      { status: 400 }
    );
  }
}
