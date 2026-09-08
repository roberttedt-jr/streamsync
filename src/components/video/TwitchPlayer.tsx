
"use client";

import { useEffect, useRef } from "react";

interface TwitchPlayerProps {
  channel: string;
}

declare global {
  interface Window {
    Twitch?: {
      Player: new (
        elementId: string,
        options: {
          width: string | number;
          height: string | number;
          channel: string;
          parent: string[];
          autoplay?: boolean;
          muted?: boolean;
        }
      ) => unknown;
    };
  }
}

export default function TwitchPlayer({ channel }: TwitchPlayerProps) {
  const containerId = "twitch-embed-player";
  const playerRef = useRef<unknown>(null);
  const cleanChannel = channel?.trim()
    ? channel.trim().replace(/^https?:\/\/(www\.)?twitch\.tv\//, "").replace(/^@/, "")
    : "";

  useEffect(() => {
    if (!cleanChannel) return;

    const scriptId = "twitch-js-sdk";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const initPlayer = () => {
      if (window.Twitch && window.Twitch.Player) {
        const container = document.getElementById(containerId);
        if (container) {
          container.innerHTML = "";
        }

        const currentHostname = typeof window !== "undefined" ? window.location.hostname : "";
        const parents = Array.from(
          new Set([currentHostname, "streamsync-livid.vercel.app", "localhost"])
        ).filter(Boolean);

        try {
          playerRef.current = new window.Twitch.Player(containerId, {
            width: "100%",
            height: "100%",
            channel: cleanChannel,
            parent: parents,
            autoplay: true,
            muted: true,
          });
        } catch (e) {
          console.warn("[TwitchPlayer] Error initializing player:", e);
        }
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://player.twitch.tv/js/embed/v1.js";
      script.async = true;
      script.onload = () => initPlayer();
      document.body.appendChild(script);
    } else {
      initPlayer();
    }

    return () => {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [cleanChannel]);

  if (!cleanChannel) {
    return (
      <div className="relative w-full h-full min-h-0 min-w-0 bg-black flex flex-col items-center justify-center p-4 text-center text-gray-400">
        <p className="text-xs">No se ha especificado ningún canal de Twitch.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-0 min-w-0 bg-black overflow-hidden">
      <div
        id={containerId}
        className="absolute inset-0 w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:absolute [&>iframe]:inset-0 [&>iframe]:border-0 [&>iframe]:block"
      />
    </div>
  );
}
