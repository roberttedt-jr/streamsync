"use client";

interface YouTubePlayerProps {
  videoId: string;
}

export default function YouTubePlayer({ videoId }: YouTubePlayerProps) {
  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-surfaceBorder shadow-2xl">
      <iframe
        className="w-full h-full border-0"
        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&mute=1`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
