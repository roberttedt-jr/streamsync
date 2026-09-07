"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import TwitchPlayer from "@/components/video/TwitchPlayer";
import YouTubePlayer from "@/components/video/YouTubePlayer";
import {
  Tv,
  Radio,
  Send,
  Users,
  Mic,
  MicOff,
  Copy,
  Check,
  Search,
  Sparkles,
  Volume2,
  Gamepad2,
} from "lucide-react";

const POPULAR_CHANNELS = [
  { name: "ibai", platform: "twitch", category: "Charlando / Eventos" },
  { name: "elxokas", platform: "twitch", category: "Gaming / Variedad" },
  { name: "auronplay", platform: "twitch", category: "Minecraft / GTA" },
  { name: "illojuan", platform: "twitch", category: "Variedad / Retro" },
  { name: "rubius", platform: "twitch", category: "Gaming / Directos" },
  { name: "kingsleague", platform: "twitch", category: "Fútbol / Entretenimiento" },
  { name: "midudev", platform: "twitch", category: "Programación / Tech" },
  { name: "Lofi Girl (Stream 24/7)", id: "jfKfPfyJRdk", platform: "youtube", category: "Música / Chill" },
  { name: "Synthwave Radio 24/7", id: "4xDzrJKXOOY", platform: "youtube", category: "Música / Beats" },
  { name: "GameSpot Live", id: "0qL3w2eG6Jk", platform: "youtube", category: "Gaming / Noticias" },
];

export default function PartyPage() {
  const routeParams: any = useParams();
  const roomId = routeParams?.roomId ? String(routeParams.roomId) : "default";

  const [platform, setPlatform] = useState<"twitch" | "youtube">("twitch");
  const [twitchChannel, setTwitchChannel] = useState("ibai");
  const [youtubeVideoId, setYoutubeVideoId] = useState("jfKfPfyJRdk");
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);

  const [chatMessages, setChatMessages] = useState<any[]>([
    { sender: "Sistema", text: `¡Bienvenidos a la sala #${roomId}! Elige un stream y comparte el enlace.`, time: "Ahora" },
  ]);
  const [messageInput, setMessageInput] = useState("");

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredSuggestions = useMemo(() => {
    if (!query.trim()) return [];
    return POPULAR_CHANNELS.filter(
      (item) =>
        item.platform === platform &&
        item.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, platform]);

  const extractYouTubeId = (input: string): string => {
    const trimmed = input.trim();
    if (trimmed.includes("v=")) return trimmed.split("v=")[1].split("&")[0];
    if (trimmed.includes("youtu.be/")) return trimmed.split("youtu.be/")[1].split("?")[0];
    if (trimmed.includes("youtube.com/live/")) return trimmed.split("youtube.com/live/")[1].split("?")[0];
    if (trimmed.includes("youtube.com/embed/")) return trimmed.split("youtube.com/embed/")[1].split("?")[0];
    return trimmed;
  };

  const handleSubmit = (e?: any) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!query.trim()) return;

    if (platform === "twitch") {
      const cleaned = query
        .replace("https://www.twitch.tv/", "")
        .replace("https://twitch.tv/", "")
        .replace("@", "")
        .trim();
      setTwitchChannel(cleaned);
    } else {
      const extractedId = extractYouTubeId(query);
      setYoutubeVideoId(extractedId);
    }

    setQuery("");
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = (suggestion: any) => {
    if (suggestion.platform === "twitch") {
      setTwitchChannel(suggestion.name);
    } else if (suggestion.id) {
      setYoutubeVideoId(suggestion.id);
    }
    setQuery("");
    setShowSuggestions(false);
  };

  const handleSendMessage = (e: any) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!messageInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { sender: "Tú", text: messageInput.trim(), time: "Ahora" },
    ]);
    setMessageInput("");
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-background text-gray-100 overflow-hidden font-sans">
      <div className="flex-1 flex flex-col min-w-0 p-4 lg:p-6 overflow-y-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-surfaceBorder/80 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-surface border border-surfaceBorder flex items-center justify-center text-brand-purple">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                <h1 className="text-lg lg:text-xl font-extrabold text-white">
                  Sala <span className="text-brand-purple">#{roomId}</span>
                </h1>
              </div>
              <p className="text-xs text-gray-400">Transmisión sincronizada en vivo</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-surfaceBorder hover:border-gray-600 transition text-gray-300"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-green-400">¡Enlace Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-gray-400" />
                  <span>Invitar amigos</span>
                </>
              )}
            </button>

            <div className="flex items-center bg-surface border border-surfaceBorder p-1 rounded-lg">
              <button
                onClick={() => {
                  setPlatform("twitch");
                  setQuery("");
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition ${
                  platform === "twitch"
                    ? "bg-brand-purple text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Radio className="h-3 w-3" />
                Twitch
              </button>
              <button
                onClick={() => {
                  setPlatform("youtube");
                  setQuery("");
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition ${
                  platform === "youtube"
                    ? "bg-brand-red text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Tv className="h-3 w-3" />
                YouTube
              </button>
            </div>
          </div>
        </div>

        <div className="w-full flex-1 flex items-center justify-center">
          <div className="w-full max-w-5xl">
            {platform === "twitch" ? (
              <TwitchPlayer channel={twitchChannel} />
            ) : (
              <YouTubePlayer videoId={youtubeVideoId} />
            )}
          </div>
        </div>

        <div className="relative mt-4 w-full max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                placeholder={
                  platform === "twitch"
                    ? "Busca un streamer o canal (ej: ibai, auronplay, elxokas)..."
                    : "Pega enlace de YouTube (live, vídeo, watch?v=...)"
                }
                className="w-full bg-surface border border-surfaceBorder focus:border-brand-purple rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="bg-brand-purple hover:bg-purple-600 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition shadow-md shadow-purple-900/30"
            >
              Cargar
            </button>
          </form>

          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-surface/95 backdrop-blur-md border border-surfaceBorder rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="p-2 border-b border-surfaceBorder/60 flex items-center gap-1.5 text-[11px] font-semibold text-gray-400">
                <Sparkles className="h-3 w-3 text-brand-purple" />
                Canales recomendados
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full px-3 py-2 text-left hover:bg-surfaceBorder/50 flex items-center justify-between text-xs transition group"
                  >
                    <span className="font-semibold text-gray-200 group-hover:text-white">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-gray-400">{item.category}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-surfaceBorder bg-surface/70 backdrop-blur-md flex flex-col h-80 lg:h-full">
        <div className="p-4 border-b border-surfaceBorder flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-brand-purple" />
            <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">
              En Sala (2)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMicEnabled(!micEnabled)}
              title={micEnabled ? "Silenciar micrófono" : "Activar micrófono"}
              className={`p-1.5 rounded-lg border transition ${
                micEnabled
                  ? "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
                  : "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
              }`}
            >
              {micEnabled ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
            </button>
            <div className="p-1.5 rounded-lg bg-surface border border-surfaceBorder text-gray-400">
              <Volume2 className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>

        <div className="px-4 py-2 bg-surfaceBorder/20 border-b border-surfaceBorder/40 flex items-center gap-2 text-xs">
          <div className="h-6 w-6 rounded-full bg-brand-purple flex items-center justify-center font-bold text-[10px] text-white">
            TÚ
          </div>
          <span className="text-gray-300 font-medium text-xs">Host de la Sala</span>
          <span className="ml-auto text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
            En directo
          </span>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
          {chatMessages.map((msg, index) => (
            <div key={index} className="flex flex-col gap-0.5">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-brand-purple text-[11px]">{msg.sender}</span>
                <span className="text-[9px] text-gray-500">{msg.time}</span>
              </div>
              <p className="text-gray-300 bg-background/50 p-2 rounded-lg border border-surfaceBorder/40 break-words leading-relaxed">
                {msg.text}
              </p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="p-3 border-t border-surfaceBorder bg-surface">
          <div className="flex items-center gap-2 bg-background border border-surfaceBorder rounded-xl px-3 py-1.5 focus-within:border-brand-purple transition">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Escribe en el chat..."
              className="w-full bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
            />
            <button type="submit" className="text-gray-400 hover:text-brand-purple transition">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
