import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || !q.trim()) {
    return NextResponse.json({ channels: [] });
  }

  try {
    const res = await fetch(`https://gql.twitch.tv/gql`, {
      method: "POST",
      headers: {
        "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko",
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        {
          operationName: "SearchResultsPage_SearchResults",
          variables: {
            query: q,
            options: null,
          },
          extensions: {
            persistedQuery: {
              version: 1,
              sha256Hash:
                "6ea65691230d703138b722aa260a95ff71c6670cf840277e9b068bdf3b5860d4",
            },
          },
        },
      ]),
      next: { revalidate: 20 },
    });

    if (!res.ok) {
      return NextResponse.json({ channels: [] });
    }

    const data = await res.json();
    const edges = data?.[0]?.data?.searchFor?.channels?.edges || [];

    const channels = edges.map((edge: any) => ({
      name: edge.item.login,
      displayName: edge.item.displayName,
      avatar: edge.item.profileImageURL,
      game: edge.item.game?.name || "En directo",
      isLive: true,
      platform: "twitch",
    }));

    return NextResponse.json({ channels });
  } catch {
    return NextResponse.json({ channels: [] });
  }
}
