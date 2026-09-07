import { NextResponse } from "next/server";
import { authenticateUser, createSession } from "@/lib/userStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Usuario/Email y contraseña requeridos." },
        { status: 400 }
      );
    }

    const user = await authenticateUser(identifier, password);
    if (!user) {
      return NextResponse.json(
        { error: "Credenciales incorrectas. Verifica tus datos." },
        { status: 401 }
      );
    }

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
      { error: error.message || "Error al iniciar sesión." },
      { status: 500 }
    );
  }
}
