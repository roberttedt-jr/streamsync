import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const game = (searchParams.get("game") || "valorant").toLowerCase();

  const mockDatabase: Record<string, any> = {
    valorant: {
      game: "VALORANT",
      event: "VCT International Tournament",
      status: "En curso • Ronda 21",
      map: "BIND",
      score: "11 - 10",
      topFragger: "Chronicle (24/12)",
      economy: "Full Buy",
      liveViewers: "142,500",
      patch: "9.04",
    },
    lol: {
      game: "League of Legends",
      event: "LEC Summer Playoffs",
      status: "Mid Game • Minuto 24:18",
      map: "Grieta del Invocador",
      score: "14 - 9 Kills (Oro: +3.2k)",
      topFragger: "Caps (Azir 6/1/4)",
      economy: "Dragón Hextech (2-1)",
      liveViewers: "189,200",
      patch: "14.16",
    },
    cs2: {
      game: "Counter-Strike 2",
      event: "ESL Pro League",
      status: "Tiempo Extra • Ronda 26",
      map: "Mirage",
      score: "14 - 12",
      topFragger: "m0NESY (AWP 28K)",
      economy: "T-Side Reset",
      liveViewers: "98,400",
      patch: "Latest",
    },
  };

  const selectedStats = mockDatabase[game] || mockDatabase.valorant;

  return NextResponse.json({
    success: true,
    stats: selectedStats,
  });
}
