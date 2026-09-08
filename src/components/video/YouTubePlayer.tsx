"use client";

interface YouTubePlayerProps {
  videoId: string;
}

export default function YouTubePlayer({ videoId }: YouTubePlayerProps) {
  return (
    <div className="relative w-full h-full min-h-0 min-w-0 bg-black overflow-hidden flex items-center justify-center">
      <iframe
        className="w-full h-full border-0 absolute inset-0"
        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&mute=1`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
