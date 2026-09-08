import { NextResponse } from "next/server";
import { getProvidersStatus } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = getProvidersStatus();

  return NextResponse.json(status);
}
