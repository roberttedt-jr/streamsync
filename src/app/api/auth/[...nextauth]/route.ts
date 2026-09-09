import NextAuth from "next-auth";
import { getAuthOptions } from "@/lib/auth";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest, ctx: any) {
  const scope = req.nextUrl?.searchParams?.get("scope") || null;
  const nextauthAction = ctx?.params?.nextauth?.[0] || null;
  const targetProvider = ctx?.params?.nextauth?.[1] || null;

  const secret =
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "streamsync-dev-auth-secret-key-do-not-use-in-production";

  const token = await getToken({ req, secret });
  const sessionUserId = (token?.id || token?.sub) as string | undefined;

  const options = getAuthOptions(scope, targetProvider, sessionUserId);
  return (NextAuth as any)(options)(req, ctx);
}

export async function POST(req: NextRequest, ctx: any) {
  const scope = req.nextUrl?.searchParams?.get("scope") || null;
  const nextauthAction = ctx?.params?.nextauth?.[0] || null;
  const targetProvider = ctx?.params?.nextauth?.[1] || null;

  const secret =
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "streamsync-dev-auth-secret-key-do-not-use-in-production";

  const token = await getToken({ req, secret });
  const sessionUserId = (token?.id || token?.sub) as string | undefined;

  const options = getAuthOptions(scope, targetProvider, sessionUserId);
  return (NextAuth as any)(options)(req, ctx);
}
