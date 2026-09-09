
"use client";

import React, { useMemo } from "react";
import { AlertCircle } from "lucide-react";

export interface TwitchTarget {
  type: "channel" | "video" | "clip";
  id: string;
}

export function parseTwitchTarget(input: string | null | undefined): TwitchTarget | null {
  if (!input) return null;
  let str = input.trim();
  if (!str) return null;

  // Remove protocol
  str = str.replace(/^https?:\/\//i, "");

  // Clip domain: clips.twitch.tv/Slug
  if (str.toLowerCase().startsWith("clips.twitch.tv/")) {
    const slug = str.replace(/^clips\.twitch\.tv\//i, "").split(/[/?#]/)[0];
    return slug ? { type: "clip", id: slug } : null;
  }

  // Remove twitch.tv domain variations
  str = str.replace(/^(www\.|m\.)?twitch\.tv\//i, "");

  // Remove leading @ if any
  str = str.replace(/^@/, "");

  // Remove query params and hash
  const pathOnly = str.split(/[?#]/)[0].replace(/\/+$/, "");
  if (!pathOnly) return null;

  // Check for video/VOD: twitch.tv/videos/123456
  if (pathOnly.toLowerCase().startsWith("videos/")) {
    const videoId = pathOnly.replace(/^videos\//i, "").split("/")[0];
    return videoId ? { type: "video", id: videoId } : null;
  }

  // Check for clip in channel path: twitch.tv/channel/clip/Slug
  if (pathOnly.toLowerCase().includes("/clip/")) {
    const clipSlug = pathOnly.split(/\/clip\//i)[1]?.split("/")[0];
    return clipSlug ? { type: "clip", id: clipSlug } : null;
  }

  // Otherwise channel name
  const channelName = pathOnly.split("/")[0].toLowerCase();
  return channelName ? { type: "channel", id: channelName } : null;
}

interface TwitchPlayerProps {
  channel: string;
  className?: string;
}

function TwitchPlayerComponent({ channel, className = "" }: TwitchPlayerProps) {
  const target = useMemo(() => parseTwitchTarget(channel), [channel]);

  const embedUrl = useMemo(() => {
    if (!target) return null;

    const hostname = typeof window !== "undefined" ? window.location.hostname : "";
    const parentList = Array.from(
      new Set(
        [hostname, "streamsync-livid.vercel.app", "localhost", "127.0.0.1"].filter(Boolean)
      )
    );
    const parentParams = parentList.map((p) => `&parent=${encodeURIComponent(p)}`).join("");

    // Twitch embed guidelines:
    // 1. autoplay=true & muted=true ensures 100% compliance with modern browser autoplay policies (Chrome, Safari, Edge).
    // 2. Setting muted=true prevents browsers from pausing/killing video when the tab is in the background.
    if (target.type === "channel") {
      return `https://player.twitch.tv/?channel=${encodeURIComponent(target.id)}${parentParams}&autoplay=true&muted=true`;
    }
    if (target.type === "video") {
      return `https://player.twitch.tv/?video=${encodeURIComponent(target.id)}${parentParams}&autoplay=true&muted=true`;
    }
    if (target.type === "clip") {
      return `https://clips.twitch.tv/embed?clip=${encodeURIComponent(target.id)}${parentParams}&autoplay=true&muted=true`;
    }
    return null;
  }, [target]);

  if (!channel || !target || !embedUrl) {
    return (
      <div
        className={`relative w-full h-full min-h-0 min-w-0 bg-[#090B10] flex flex-col items-center justify-center p-6 text-center text-gray-400 select-none ${className}`}
      >
        <AlertCircle className="w-8 h-8 text-purple-400 mb-2 opacity-60" />
        <p className="text-xs font-semibold text-white">Ningún canal especificado</p>
        <p className="text-[11px] text-gray-400 mt-1 max-w-xs">
          Introduce el nombre o enlace de un canal de Twitch para reproducirlo.
        </p>
      </div>
    );
  }

  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  // Auto-resume stream if browser or Twitch paused it when switching tabs or losing visibility
  React.useEffect(() => {
    const resumePlayback = () => {
      if (document.visibilityState === "visible" && iframeRef.current?.contentWindow) {
        try {
          iframeRef.current.contentWindow.postMessage(
            { eventName: "Play", params: null, namespace: "twitch-embed-player-proxy" },
            "*"
          );
        } catch {
          // ignore cross-origin error if any
        }
      }
    };

    document.addEventListener("visibilitychange", resumePlayback);
    window.addEventListener("focus", resumePlayback);

    return () => {
      document.removeEventListener("visibilitychange", resumePlayback);
      window.removeEventListener("focus", resumePlayback);
    };
  }, []);

  // NOTE: Twitch enforces strict "style visibility" anti-clickjacking policies.
  // NO OVERLAYS (such as loading spinners or floating action buttons) may be placed
  // on top of the iframe, otherwise Twitch disables autoplay and throttles playback.
  return (
    <div
      className={`relative w-full h-full min-h-0 min-w-0 bg-black overflow-hidden select-none ${className}`}
    >
      <iframe
        ref={iframeRef}
        key={`twitch-${target.type}-${target.id}`}
        src={embedUrl}
        title={`Twitch Player - ${target.id}`}
        className="w-full h-full border-0 block"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
          visibility: "visible",
          opacity: 1,
        }}
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media; display-capture"
        allowFullScreen
        scrolling="no"
      />
    </div>
  );
}

export default React.memo(TwitchPlayerComponent);
