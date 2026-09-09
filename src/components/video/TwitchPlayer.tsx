
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Loader2, ExternalLink, AlertCircle } from "lucide-react";

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

export default function TwitchPlayer({ channel, className = "" }: TwitchPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [hostname, setHostname] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHostname(window.location.hostname);
    }
  }, []);

  const target = useMemo(() => parseTwitchTarget(channel), [channel]);

  // Reset loading state when channel/target changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [channel]);

  const embedUrl = useMemo(() => {
    if (!target) return null;

    // Collect allowed parent domains
    const parentList = Array.from(
      new Set(
        [hostname, "streamsync-livid.vercel.app", "localhost", "127.0.0.1"].filter(Boolean)
      )
    );
    const parentParams = parentList.map((p) => `&parent=${encodeURIComponent(p)}`).join("");

    if (target.type === "channel") {
      return `https://player.twitch.tv/?channel=${encodeURIComponent(target.id)}${parentParams}&autoplay=true&muted=false`;
    }
    if (target.type === "video") {
      return `https://player.twitch.tv/?video=${encodeURIComponent(target.id)}${parentParams}&autoplay=true&muted=false`;
    }
    if (target.type === "clip") {
      return `https://clips.twitch.tv/embed?clip=${encodeURIComponent(target.id)}${parentParams}&autoplay=true&muted=false`;
    }
    return null;
  }, [target, hostname]);

  const twitchWebUrl = useMemo(() => {
    if (!target) return "https://twitch.tv";
    if (target.type === "channel") return `https://twitch.tv/${target.id}`;
    if (target.type === "video") return `https://twitch.tv/videos/${target.id}`;
    if (target.type === "clip") return `https://clips.twitch.tv/${target.id}`;
    return "https://twitch.tv";
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

  return (
    <div
      className={`relative w-full h-full min-h-0 min-w-0 bg-black overflow-hidden select-none group ${className}`}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none transition-opacity duration-300">
          <Loader2 className="w-8 h-8 text-[#9146FF] animate-spin mb-2" />
          <p className="text-xs text-gray-300 font-medium tracking-wide">
            Cargando directo de <span className="text-[#bf94ff] font-bold">@{target.id}</span>...
          </p>
        </div>
      )}

      {/* Direct Twitch Embed iframe */}
      <iframe
        key={embedUrl}
        src={embedUrl}
        title={`Twitch Player - ${target.id}`}
        className="absolute inset-0 w-full h-full border-0 block"
        allow="autoplay; fullscreen"
        allowFullScreen
        scrolling="no"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />

      {/* Floating external link shortcut */}
      <a
        href={twitchWebUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200 px-2.5 py-1.5 rounded-lg bg-black/75 hover:bg-[#9146FF] text-white text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-md shadow-lg border border-white/10"
        title="Abrir en Twitch oficial"
      >
        <span>Twitch</span>
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}
