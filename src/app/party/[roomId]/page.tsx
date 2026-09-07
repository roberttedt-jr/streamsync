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
  Maximize2,
  Share2
} from "lucide-react";

const POPULAR_CHANNELS = [
  { name: "ibai", platform: "twitch", category: "Charlando / Eventos" },
  { name: "elxokas", platform: "twitch", category: "Gaming / Variedad" },
  { name: "auronplay", platform: "twitch", category: "Minecraft / GTA" },
  { name: "illojuan", platform: "twitch", category: "Variedad / Retro" },
  { name: "rubius", platform: "twitch", category: "Gaming / Directos" },
  { name: "kingsleague", platform: "twitch", category: "Fútbol / Kings" },
  { name: "midudev", platform: "twitch", category: "Programación / Tech" },
  { name: "Lofi Girl (Stream 24/7)", id: "jfKfPfyJRdk", platform: "youtube", category: "Música / Chill" },
  { name: "Synthwave Radio 24/7", id: "4xDzrJKXOOY", platform: "youtube", category: "Música / Beats" },
  { name: "GameSpot Live", id: "0qL3w2eG6Jk", platform: "youtube", category: "Gaming / Directo" },
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

  // Chat con formato estilo Twitch (badges, colores y scroll)
  const [chatMessages, setChatMessages] = useState<any[]>([
    { id: 1, sender: "StreamSyncBot", color: "#a855f7", isBadge: true, text: `¡Bienvenidos a la sala #${roomId}! Modo cine activado.`, time: "18:00" },
    { id: 2, sender: "Moderador", color: "#22c55e", isBadge: true, text: "Usa el buscador superior para cambiar de directo al instante.", time: "18:01" },
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
    
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "Tú",
        color: "#38bdf8",
        isBadge: false,
        text: messageInput.trim(),
        time: timeStr
      },
    ]);
    setMessageInput("");
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#090b10] text-gray-100 overflow-hidden select-none font-sans">
      
      {/* 1. BARRA SUPERIOR COMPACTA (Estilo Twitch Header) */}
      <header className="h-14 border-b border-surfaceBorder bg-[#0e131d] px-4 flex items-center justify-between gap-4 z-30 shrink-0">
        <div className="flex items-center gap-3 min-w-fit">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brand-purple to-indigo-600 flex items-center justify-center text-white font-bold shadow">
            <Gamepad2 className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-extrabold text-sm text-white tracking-wide">
                SALA #{roomId}
              </span>
            </div>
          </div>
        </div>

        {/* Buscador central integrado en la barra superior */}
        <div className="relative flex-1 max-w-xl mx-2">
          <form onSubmit={handleSubmit} className="flex items-center relative">
            <Search className="absolute left-3 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
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
                  ? "Escribe canal de Twitch (ej: ibai, auronplay, xokas)..."
                  : "Pega link o ID de YouTube..."
              }
              className="w-full bg-[#161c28] border border-surfaceBorder focus:border-brand-purple rounded-lg pl-9 pr-20 py-1.5 text-xs text-white placeholder-gray-500 outline-none transition"
            />
            <button
              type="submit"
              className="absolute right-1 px-3 py-1 bg-brand-purple hover:bg-purple-600 text-[11px] font-bold text-white rounded-md transition"
            >
              Cargar
            </button>
          </form>

          {/* Sugerencias flotantes */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#161c28] border border-surfaceBorder rounded-lg shadow-2xl z-50 overflow-hidden">
              <div className="p-2 border-b border-surfaceBorder/60 flex items-center gap-1.5 text-[10px] font-semibold text-gray-400">
                <Sparkles className="h-3 w-3 text-brand-purple" />
                Sugerencias rápidas
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full px-3 py-1.5 text-left hover:bg-surfaceBorder/50 flex items-center justify-between text-xs transition"
                  >
                    <span className="font-semibold text-gray-200">{item.name}</span>
                    <span className="text-[10px] text-gray-400">{item.category}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Controles de plataforma y compartir */}
        <div className="flex items-center gap-2 min-w-fit">
          <div className="flex items-center bg-[#161c28] border border-surfaceBorder p-0.5 rounded-lg">
            <button
              onClick={() => {
                setPlatform("twitch");
                setQuery("");
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
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
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                platform === "youtube"
                  ? "bg-brand-red text-white shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Tv className="h-3 w-3" />
              YouTube
            </button>
          </div>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#161c28] border border-surfaceBorder hover:border-gray-500 transition text-gray-200"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-400" />
                <span className="text-green-400 text-[11px]">Copiado</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-[11px] hidden sm:inline">Invitar</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* 2. ÁREA CENTRAL (VÍDEO A PANTALLA COMPLETA + CHAT DERECHO) */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 w-full overflow-hidden">
        
        {/* REPRODUCTOR: OCUPA EL 100% DEL ESPACIO DISPONIBLE HASTA EL CHAT */}
        <main className="flex-1 bg-black relative flex items-center justify-center min-h-0 overflow-hidden">
          <div className="w-full h-full">
            {platform === "twitch" ? (
              <TwitchPlayer channel={twitchChannel} />
            ) : (
              <YouTubePlayer videoId={youtubeVideoId} />
            )}
          </div>
        </main>

        {/* CHAT LATERAL ESTILO TWITCH (ANCHO FIJO 340px) */}
        <aside className="w-full lg:w-[340px] border-t lg:border-t-0 lg:border-l border-surfaceBorder bg-[#0e131d] flex flex-col shrink-0 h-64 lg:h-full z-20">
          
          {/* Cabecera del chat */}
          <div className="h-11 px-3 border-b border-surfaceBorder flex items-center justify-between bg-[#121824]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-200">
                CHAT DEL STREAM
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setMicEnabled(!micEnabled)}
                className={`p-1 rounded border transition ${
                  micEnabled
                    ? "bg-green-500/10 border-green-500/30 text-green-400"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}
                title={micEnabled ? "Voz activa" : "Micrófono apagado"}
              >
                {micEnabled ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
              </button>
              <div className="flex items-center gap-1 text-[11px] text-gray-400 font-semibold px-1.5 py-0.5 rounded bg-surface border border-surfaceBorder">
                <Users className="h-3 w-3 text-brand-purple" />
                <span>3</span>
              </div>
            </div>
          </div>

          {/* Contenedor de mensajes estilo Twitch */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs font-normal selection:bg-purple-900/50">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="leading-relaxed hover:bg-white/[0.02] -mx-2 px-2 py-0.5 rounded">
                <span className="text-[10px] text-gray-500 mr-1.5">{msg.time}</span>
                {msg.isBadge && (
                  <span className="bg-brand-purple/20 text-brand-purple border border-brand-purple/30 text-[9px] font-bold px-1 py-0.2 rounded mr-1.5">
                    MOD
                  </span>
                )}
                <span className="font-bold mr-1.5" style={{ color: msg.color }}>
                  {msg.sender}:
                </span>
                <span className="text-gray-200 break-words">{msg.text}</span>
              </div>
            ))}
          </div>

          {/* Formulario para enviar mensaje */}
          <form onSubmit={handleSendMessage} className="p-2.5 border-t border-surfaceBorder bg-[#121824]">
            <div className="flex items-center gap-2 bg-[#161c28] border border-surfaceBorder rounded-lg px-2.5 py-1.5 focus-within:border-brand-purple transition">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Enviar mensaje..."
                className="w-full bg-transparent text-xs text-white placeholder-gray-500 outline-none"
              />
              <button
                type="submit"
                className="text-brand-purple hover:text-purple-400 p-1 rounded transition"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </aside>

      </div>
    </div>
  );
}
