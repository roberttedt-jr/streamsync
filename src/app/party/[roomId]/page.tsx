"use client";

import { useState } from "react";
import TwitchPlayer from "@/components/video/TwitchPlayer";
import YouTubePlayer from "@/components/video/YouTubePlayer";
import { Tv, Radio, Send, Users, Mic, Volume2 } from "lucide-react";

export default function PartyPage({
  params,
}: {
  params: { roomId: string };
}) {
  const roomId = params.roomId;

  const [platform, setPlatform] = useState<"twitch" | "youtube">("twitch");
  const [twitchChannel, setTwitchChannel] = useState("ibai");
  const [youtubeVideoId, setYoutubeVideoId] = useState("jfKfPfyJRdk");
  const [inputUrl, setInputUrl] = useState("");

  const handleLoadStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    if (platform === "twitch") {
      const cleaned = inputUrl
        .replace("https://www.twitch.tv/", "")
        .replace("https://twitch.tv/", "")
        .trim();
      setTwitchChannel(cleaned);
    } else {
      let extractedId = inputUrl.trim();
      if (inputUrl.includes("v=")) {
        extractedId = inputUrl.split("v=")[1].split("&")[0];
      } else if (inputUrl.includes("youtu.be/")) {
        extractedId = inputUrl.split("youtu.be/")[1].split("?")[0];
      }
      setYoutubeVideoId(extractedId);
    }
    setInputUrl("");
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-background overflow-hidden">
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-surfaceBorder mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                Sala: <span className="text-brand-purple">{roomId}</span>
              </h1>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Sincronización activa</p>
          </div>

          <div className="flex items-center bg-surface border border-surfaceBorder p-1 rounded-lg">
            <button
              onClick={() => setPlatform("twitch")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                platform === "twitch"
                  ? "bg-brand-purple text-white shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Radio className="h-3.5 w-3.5" />
              Twitch
            </button>
            <button
              onClick={() => setPlatform("youtube")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                platform === "youtube"
                  ? "bg-brand-red text-white shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Tv className="h-3.5 w-3.5" />
              YouTube
            </button>
          </div>
        </div>

        <div className="w-full flex-1 flex items-center justify-center">
          {platform === "twitch" ? (
            <TwitchPlayer channel={twitchChannel} />
          ) : (
            <YouTubePlayer videoId={youtubeVideoId} />
          )}
        </div>

        <form onSubmit={handleLoadStream} className="mt-4 flex gap-2 w-full max-w-2xl mx-auto">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder={
              platform === "twitch"
                ? "Escribe canal de Twitch (ej: ibai, auronplay)"
                : "Pega enlace de YouTube (ej: https://www.youtube.com/watch?v=...)"
            }
            className="flex-1 bg-surface border border-surfaceBorder rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple"
          />
          <button
            type="submit"
            className="bg-surfaceBorder hover:bg-gray-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition"
          >
            Cargar
          </button>
        </form>
      </div>

      <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-surfaceBorder bg-surface flex flex-col h-72 lg:h-full">
        <div className="p-3 border-b border-surfaceBorder flex items-center justify-between text-xs text-gray-300 font-semibold">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-brand-purple" />
            <span>Participantes (1)</span>
          </div>
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-green-400" />
            <Volume2 className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
          <div className="bg-background/60 p-2 rounded-lg border border-surfaceBorder/50">
            <span className="font-bold text-brand-purple">Sistema: </span>
            <span className="text-gray-300">Bienvenido a la sala {roomId}.</span>
          </div>
        </div>

        <div className="p-3 border-t border-surfaceBorder bg-surface">
          <div className="flex items-center gap-2 bg-background border border-surfaceBorder rounded-lg px-3 py-2">
            <input
              type="text"
              placeholder="Enviar un mensaje..."
              disabled
              className="w-full bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none disabled:opacity-50"
            />
            <Send className="h-4 w-4 text-gray-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
