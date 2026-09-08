import NextAuth from "next-auth";
import { getAuthOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, ctx: any) {
  const scope = req.nextUrl?.searchParams?.get("scope") || null;
  const targetProvider = ctx?.params?.nextauth?.[1] || null;
  const options = getAuthOptions(scope, targetProvider);
  return (NextAuth as any)(options)(req, ctx);
}

export async function POST(req: NextRequest, ctx: any) {
  const scope = req.nextUrl?.searchParams?.get("scope") || null;
  const targetProvider = ctx?.params?.nextauth?.[1] || null;
  const options = getAuthOptions(scope, targetProvider);
  return (NextAuth as any)(options)(req, ctx);
}
