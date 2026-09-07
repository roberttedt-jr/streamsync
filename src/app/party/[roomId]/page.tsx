"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import TwitchPlayer from "@/components/video/TwitchPlayer";
import YouTubePlayer from "@/components/video/YouTubePlayer";
import {
  Tv,
  Radio,
  Send,
  Users,
  Mic,
  MicOff,
  Check,
  Search,
  Sparkles,
  Gamepad2,
  Share2,
  Home,
  LogOut,
  User,
  Settings,
  Heart,
  Volume2,
  RadioTower,
  ChevronDown,
  Circle,
  Tv2,
} from "lucide-react";

interface SuggestionItem {
  name: string;
  platform: "twitch" | "youtube";
  category: string;
  id?: string;
}

const POPULAR_CHANNELS: SuggestionItem[] = [
  { name: "ibai", platform: "twitch", category: "Charlando / Eventos" },
  { name: "elxokas", platform: "twitch", category: "Gaming / Variedad" },
  { name: "auronplay", platform: "twitch", category: "Minecraft / GTA" },
  { name: "illojuan", platform: "twitch", category: "Variedad / Retro" },
  { name: "rubius", platform: "twitch", category: "Gaming / Directos" },
  { name: "kingsleague", platform: "twitch", category: "Fútbol / Kings" },
  { name: "midudev", platform: "twitch", category: "Programación / Tech" },
  { name: "Lofi Girl", id: "jfKfPfyJRdk", platform: "youtube", category: "Música / Chill 24/7" },
  { name: "Synthwave Radio", id: "4xDzrJKXOOY", platform: "youtube", category: "Música / Synth 24/7" },
  { name: "GameSpot Live", id: "0qL3w2eG6Jk", platform: "youtube", category: "Gaming / Directo" },
];

export default function PartyPage() {
  const router = useRouter();
  const routeParams: any = useParams();
  const roomId = routeParams?.roomId ? String(routeParams.roomId) : "default";

  const [platform, setPlatform] = useState<"twitch" | "youtube">("twitch");
  const [activeStream, setActiveStream] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [copied, setCopied] = useState(false);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userStatus, setUserStatus] = useState<"online" | "idle" | "dnd">("online");
  const [micEnabled, setMicEnabled] = useState(true);

  const [chatMessages, setChatMessages] = useState<any[]>([
    { id: 1, sender: "StreamSyncBot", color: "#a855f7", isBadge: true, text: `Sala #${roomId} iniciada. Esperando señal.`, time: "12:00" },
  ]);
  const [messageInput, setMessageInput] = useState("");

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleLoadStream = (e?: any) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!query.trim()) return;

    if (platform === "twitch") {
      const cleaned = query
        .replace("https://www.twitch.tv/", "")
        .replace("https://twitch.tv/", "")
        .replace("@", "")
        .trim();
      setActiveStream(cleaned);
    } else {
      setActiveStream(extractYouTubeId(query));
    }

    setQuery("");
    setShowSuggestions(false);
  };

  const handleSelectQuickStream = (suggestion: SuggestionItem) => {
    setPlatform(suggestion.platform);
    if (suggestion.platform === "twitch") {
      setActiveStream(suggestion.name);
    } else if (suggestion.id) {
      setActiveStream(suggestion.id);
    }
    setQuery("");
    setShowSuggestions(false);
  };

  const handleSendMessage = (e: any) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!messageInput.trim()) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "GamerPro",
        color: "#38bdf8",
        isBadge: false,
        text: messageInput.trim(),
        time: timeStr,
      },
    ]);
    setMessageInput("");
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#080a0f] text-gray-100 overflow-hidden font-sans select-none">
      <header className="h-14 border-b border-[#1f2637] bg-[#0d111a] px-3 lg:px-4 flex items-center justify-between gap-3 z-40 shrink-0">
        <div className="flex items-center gap-2 lg:gap-3">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 hover:opacity-80 transition group"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-purple to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-900/30">
              <Gamepad2 className="h-5 w-5 transition-transform group-hover:scale-105" />
            </div>
            <span className="font-black text-sm lg:text-base tracking-wider hidden sm:inline text-white">
              STREAM<span className="text-brand-purple">SYNC</span>
            </span>
          </button>

          <div className="h-4 w-[1px] bg-[#1f2637] mx-1 hidden sm:block" />

          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#161c28] transition"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Inicio</span>
          </button>

          <div className="flex items-center gap-1.5 bg-[#161c28] border border-[#1f2637] px-2.5 py-1 rounded-md text-[11px] text-gray-300">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-bold text-white">#{roomId}</span>
          </div>
        </div>

        <div className="relative flex-1 max-w-lg mx-2">
          <form onSubmit={handleLoadStream} className="flex items-center relative">
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
                  ? "Buscar canal en directo de Twitch..."
                  : "Pegar enlace o ID de YouTube..."
              }
              className="w-full bg-[#141a26] border border-[#1f2637] focus:border-brand-purple rounded-lg pl-9 pr-16 py-1.5 text-xs text-white placeholder-gray-500 outline-none transition"
            />
            <button
              type="submit"
              className="absolute right-1 px-2.5 py-1 bg-brand-purple hover:bg-purple-600 text-[11px] font-bold text-white rounded-md transition shadow"
            >
              Cargar
            </button>
          </form>

          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#141a26] border border-[#1f2637] rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="p-2 border-b border-[#1f2637] flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <Sparkles className="h-3 w-3 text-brand-purple" />
                Sugerencias rápidas
              </div>
              <div className="max-h-52 overflow-y-auto">
                {filteredSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectQuickStream(item)}
                    className="w-full px-3 py-2 text-left hover:bg-[#1f2637] flex items-center justify-between text-xs transition"
                  >
                    <span className="font-semibold text-gray-200">{item.name}</span>
                    <span className="text-[10px] text-gray-400">{item.category}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#141a26] border border-[#1f2637] p-0.5 rounded-lg">
            <button
              onClick={() => {
                setPlatform("twitch");
                setQuery("");
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition ${
                platform === "twitch"
                  ? "bg-brand-purple text-white shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Radio className="h-3 w-3" />
              <span className="hidden sm:inline">Twitch</span>
            </button>
            <button
              onClick={() => {
                setPlatform("youtube");
                setQuery("");
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition ${
                platform === "youtube"
                  ? "bg-brand-red text-white shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Tv className="h-3 w-3" />
              <span className="hidden sm:inline">YouTube</span>
            </button>
          </div>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#141a26] border border-[#1f2637] hover:border-gray-500 transition text-gray-300"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-400" />
            ) : (
              <Share2 className="h-3.5 w-3.5 text-gray-400" />
            )}
            <span className="hidden md:inline text-[11px]">{copied ? "Copiado" : "Invitar"}</span>
          </button>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-brand-purple/50 transition"
            >
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 border border-purple-400/40 flex items-center justify-center font-bold text-xs text-white">
                  GP
                </div>
                <span
                  className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#0d111a] ${
                    userStatus === "online"
                      ? "bg-green-500"
                      : userStatus === "idle"
                      ? "bg-amber-400"
                      : "bg-red-500"
                  }`}
                />
              </div>
              <ChevronDown className="h-3 w-3 text-gray-400 hidden sm:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-[#1f2637] bg-[#141a26] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="p-2 border-b border-[#1f2637] flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-black text-sm text-white shadow">
                    GP
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-sm text-white truncate">GamerPro</p>
                    <p className="text-[11px] text-gray-400 truncate">@gamerpro_live</p>
                  </div>
                </div>

                <div className="py-2 px-1 border-b border-[#1f2637]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 px-2 mb-1">
                    Estado
                  </p>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => setUserStatus("online")}
                      className={`flex items-center justify-center gap-1 py-1 rounded text-[10px] font-semibold transition ${
                        userStatus === "online" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "text-gray-400 hover:bg-[#1f2637]"
                      }`}
                    >
                      <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                      Online
                    </button>
                    <button
                      onClick={() => setUserStatus("idle")}
                      className={`flex items-center justify-center gap-1 py-1 rounded text-[10px] font-semibold transition ${
                        userStatus === "idle" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-gray-400 hover:bg-[#1f2637]"
                      }`}
                    >
                      <Circle className="h-2 w-2 fill-amber-400 text-amber-400" />
                      Ausente
                    </button>
                    <button
                      onClick={() => setUserStatus("dnd")}
                      className={`flex items-center justify-center gap-1 py-1 rounded text-[10px] font-semibold transition ${
                        userStatus === "dnd" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "text-gray-400 hover:bg-[#1f2637]"
                      }`}
                    >
                      <Circle className="h-2 w-2 fill-red-500 text-red-500" />
                      Ocupado
                    </button>
                  </div>
                </div>

                <div className="py-1 border-b border-[#1f2637] text-xs">
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-300 hover:text-white hover:bg-[#1f2637] rounded-lg transition">
                    <Tv2 className="h-4 w-4 text-brand-purple" />
                    <span>Canal</span>
                  </button>
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-300 hover:text-white hover:bg-[#1f2637] rounded-lg transition">
                    <Users className="h-4 w-4 text-brand-accent" />
                    <span>Amigos</span>
                    <span className="ml-auto text-[10px] bg-brand-purple/20 text-brand-purple px-1.5 py-0.2 rounded font-bold">2</span>
                  </button>
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-300 hover:text-white hover:bg-[#1f2637] rounded-lg transition">
                    <Heart className="h-4 w-4 text-rose-400" />
                    <span>Suscripciones</span>
                  </button>
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-300 hover:text-white hover:bg-[#1f2637] rounded-lg transition">
                    <Settings className="h-4 w-4 text-gray-400" />
                    <span>Ajustes de audio y vídeo</span>
                  </button>
                </div>

                <div className="pt-1 text-xs">
                  <button
                    onClick={() => router.push("/")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 w-full overflow-hidden">
        <main className="flex-1 bg-black relative flex items-center justify-center min-h-0 overflow-hidden">
          {activeStream ? (
            <div className="w-full h-full">
              {platform === "twitch" ? (
                <TwitchPlayer channel={activeStream} />
              ) : (
                <YouTubePlayer videoId={activeStream} />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center max-w-lg">
              <div className="relative mb-6">
                <div className="h-24 w-24 rounded-full bg-brand-purple/10 border border-brand-purple/30 flex items-center justify-center text-brand-purple animate-pulse">
                  <RadioTower className="h-10 w-10" />
                </div>
                <div className="absolute inset-0 rounded-full border border-brand-purple/20 animate-ping" />
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white">
                Sala Lista y Conectada
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed">
                Usa el buscador para poner cualquier directo de Twitch o vídeo de YouTube, o haz clic en una señal recomendada:
              </p>

              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {POPULAR_CHANNELS.slice(0, 4).map((ch, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectQuickStream(ch)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#141a26] border border-[#1f2637] hover:border-brand-purple hover:text-brand-purple transition shadow"
                  >
                    <Sparkles className="h-3 w-3 text-brand-purple" />
                    <span>{ch.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>

        <aside className="w-full lg:w-[340px] border-t lg:border-t-0 lg:border-l border-[#1f2637] bg-[#0d111a] flex flex-col shrink-0 h-64 lg:h-full z-20">
          <div className="h-11 px-3 border-b border-[#1f2637] flex items-center justify-between bg-[#121824]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-gray-200">
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
              >
                {micEnabled ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
              </button>
              <div className="flex items-center gap-1 text-[11px] text-gray-400 font-bold px-1.5 py-0.5 rounded bg-[#161c28] border border-[#1f2637]">
                <Users className="h-3 w-3 text-brand-purple" />
                <span>1</span>
              </div>
            </div>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs font-normal selection:bg-purple-900/50">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="leading-relaxed hover:bg-white/[0.02] -mx-2 px-2 py-0.5 rounded">
                <span className="text-[10px] text-gray-500 mr-1.5">{msg.time}</span>
                {msg.isBadge && (
                  <span className="bg-brand-purple/20 text-brand-purple border border-brand-purple/30 text-[9px] font-bold px-1 py-0.2 rounded mr-1.5">
                    BOT
                  </span>
                )}
                <span className="font-bold mr-1.5" style={{ color: msg.color }}>
                  {msg.sender}:
                </span>
                <span className="text-gray-200 break-words">{msg.text}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-2.5 border-t border-[#1f2637] bg-[#121824]">
            <div className="flex items-center gap-2 bg-[#161c28] border border-[#1f2637] rounded-lg px-2.5 py-1.5 focus-within:border-brand-purple transition">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Enviar mensaje al chat..."
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
