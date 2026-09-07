
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

  useEffect(() => {
    const scriptId = "twitch-js-sdk";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const initPlayer = () => {
      if (window.Twitch && window.Twitch.Player) {
        const container = document.getElementById(containerId);
        if (container) {
          container.innerHTML = "";
        }

        const currentHostname = window.location.hostname;

        playerRef.current = new window.Twitch.Player(containerId, {
          width: "100%",
          height: "100%",
          channel: channel,
          parent: [currentHostname],
          autoplay: true,
          muted: true,
        });
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
  }, [channel]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-surfaceBorder shadow-2xl">
      <div id={containerId} className="w-full h-full" />
    </div>
  );
}
