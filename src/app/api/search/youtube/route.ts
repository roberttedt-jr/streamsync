import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || !q.trim()) {
    return NextResponse.json({ videos: [] });
  }

  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = q.match(ytRegex);
  if (match && match[1]) {
    return NextResponse.json({
      videos: [
        {
          id: match[1],
          name: `Vídeo de YouTube (${match[1]})`,
          channelTitle: "YouTube",
          thumbnail: `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`,
          platform: "youtube",
        },
      ],
    });
  }

  try {
    const res = await fetch(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(
        q
      )}&sp=CAMSAkAB`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      return NextResponse.json({
        videos: [
          {
            id: "jfKfPfyJRdk",
            name: "Lofi Girl 24/7",
            channelTitle: "Lofi Girl",
            thumbnail: "https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg",
            platform: "youtube",
          },
        ],
      });
    }

    const html = await res.text();
    const rawData = html
      .split("var ytInitialData =")?.[1]
      ?.split(";</script>")?.[0];

    if (!rawData) {
      return NextResponse.json({ videos: [] });
    }

    const json = JSON.parse(rawData);
    const contents =
      json.contents?.twoColumnSearchResultsRenderer?.primaryContents
        ?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents ||
      [];

    const videos: any[] = [];

    for (const item of contents) {
      const v = item.videoRenderer;
      if (v && v.videoId) {
        videos.push({
          id: v.videoId,
          name: v.title?.runs?.[0]?.text || "Directo en YouTube",
          channelTitle: v.ownerText?.runs?.[0]?.text || "Canal",
          thumbnail: v.thumbnail?.thumbnails?.[0]?.url || `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`,
          platform: "youtube",
        });
      }
      if (videos.length >= 8) break;
    }

    return NextResponse.json({ videos });
  } catch {
    return NextResponse.json({
      videos: [
        {
          id: "jfKfPfyJRdk",
          name: "Lofi Girl — Beats to Relax/Study to",
          channelTitle: "Lofi Girl",
          thumbnail: "https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg",
          platform: "youtube",
        },
      ],
    });
  }
}
