import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    { error: "Integración de YouTube deshabilitada. StreamSync opera exclusivamente con Twitch." },
    { status: 410 }
  );
}
