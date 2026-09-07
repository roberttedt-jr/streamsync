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
  Volume2,
  VolumeX,
  RadioTower,
  ChevronDown,
  Circle,
  Trophy,
  Loader2,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface SuggestionItem {
  name: string;
  platform: "twitch" | "youtube";
  category: string;
  id?: string;
  avatar?: string;
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
  const [activeStream, setActiveStream] = useState<string | null>("ibai");

  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [apiSuggestions, setApiSuggestions] = useState<SuggestionItem[]>([]);
  const [copied, setCopied] = useState(false);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userStatus, setUserStatus] = useState<"online" | "idle" | "dnd">("online");

  const [micEnabled, setMicEnabled] = useState(true);
  const [deafened, setDeafened] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioDucking, setAudioDucking] = useState(true);

  const [showStatsOverlay, setShowStatsOverlay] = useState(true);
  const [gameStats, setGameStats] = useState<any>({
    game: "VALORANT",
    event: "VCT International Tournament",
    map: "BIND",
    score: "11 - 10",
    topFragger: "Chronicle",
    economy: "Full Buy",
  });

  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      id: 1,
      sender: "StreamSync Bot",
      color: "#22D3EE",
      isBadge: true,
      text: `Sala #${roomId} iniciada. Sincronización WebSockets activa al milisegundo.`,
      time: "Ahora",
    },
  ]);
  const [messageInput, setMessageInput] = useState("");

  const profileRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    trackEvent("room_joined", { roomId, platform });
  }, [roomId, platform]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetch("/api/game-stats?game=valorant")
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) setGameStats(data.stats);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/${roomId}/sync`);
        if (res.ok) {
          const data = await res.json();
          if (data.state && Array.isArray(data.state.messages) && data.state.messages.length > 0) {
            setChatMessages((prev) => {
              const existingIds = new Set(prev.map((m) => String(m.id)));
              const newMsgs = data.state.messages
                .filter((m: any) => !existingIds.has(String(m.id)))
                .map((m: any) => ({
                  id: m.id,
                  sender: m.user,
                  color: m.role === "BOT" ? "#22D3EE" : "#A78BFA",
                  isBadge: m.role === "BOT",
                  text: m.text,
                  time: m.timestamp,
                }));
              if (newMsgs.length > 0) {
                return [...prev, ...newMsgs];
              }
              return prev;
            });
          }
        }
      } catch {}
    }, 2500);

    return () => clearInterval(interval);
  }, [roomId]);

  useEffect(() => {
    if (!micEnabled) {
      setIsSpeaking(false);
      return;
    }

    let animationFrameId: number;
    let isCancelled = false;

    async function initMic() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) return;
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        micStreamRef.current = stream;

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkAudio = () => {
          if (!micEnabled) {
            setIsSpeaking(false);
            return;
          }
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          setIsSpeaking(average > 18);
          animationFrameId = requestAnimationFrame(checkAudio);
        };

        checkAudio();
      } catch {}
    }

    initMic();

    return () => {
      isCancelled = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [micEnabled]);

  useEffect(() => {
    if (!query.trim()) {
      setApiSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const endpoint =
          platform === "twitch"
            ? `/api/search/twitch?q=${encodeURIComponent(query)}`
            : `/api/search/youtube?q=${encodeURIComponent(query)}`;
        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          if (platform === "twitch" && Array.isArray(data.channels)) {
            setApiSuggestions(
              data.channels.map((c: any) => ({
                name: c.displayName || c.name,
                platform: "twitch",
                category: c.game || "Directo en Twitch",
                avatar: c.avatar,
              }))
            );
          } else if (platform === "youtube" && Array.isArray(data.videos)) {
            setApiSuggestions(
              data.videos.map((v: any) => ({
                name: v.name,
                platform: "youtube",
                id: v.id,
                category: v.channelTitle || "Vídeo",
                avatar: v.thumbnail,
              }))
            );
          }
        }
      } catch {}
      setSearching(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [query, platform]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      trackEvent("invite_link_copied", { roomId });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredSuggestions = useMemo(() => {
    if (apiSuggestions.length > 0) return apiSuggestions;
    if (!query.trim()) return [];
    return POPULAR_CHANNELS.filter(
      (item) =>
        item.platform === platform &&
        item.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, platform, apiSuggestions]);

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
      trackEvent("stream_switch", { platform: "twitch", channel: cleaned });
    } else {
      const ytid = extractYouTubeId(query);
      setActiveStream(ytid);
      trackEvent("stream_switch", { platform: "youtube", videoId: ytid });
    }

    setQuery("");
    setShowSuggestions(false);
  };

  const handleSelectQuickStream = (suggestion: SuggestionItem) => {
    setPlatform(suggestion.platform);
    if (suggestion.platform === "twitch") {
      setActiveStream(suggestion.name);
      trackEvent("stream_switch", { platform: "twitch", channel: suggestion.name });
    } else if (suggestion.id) {
      setActiveStream(suggestion.id);
      trackEvent("stream_switch", { platform: "youtube", videoId: suggestion.id });
    }
    setQuery("");
    setShowSuggestions(false);
  };

  const handleSendMessage = async (e: any) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!messageInput.trim()) return;

    const text = messageInput.trim();
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    const newMsg = {
      id: Date.now(),
      sender: "GamerPro",
      color: "#22D3EE",
      isBadge: false,
      text,
      time: timeStr,
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setMessageInput("");
    trackEvent("chat_message_sent", { roomId });

    try {
      fetch(`/api/rooms/${roomId}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_message",
          user: "GamerPro",
          text,
          role: "MEMBER",
        }),
      }).catch(() => {});
    } catch {}
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0B0F14] text-gray-100 overflow-hidden font-sans select-none">
      <header className="h-14 border-b border-[#1F2937] bg-[#0F141C]/90 backdrop-blur-md px-3 lg:px-4 flex items-center justify-between gap-3 z-40 shrink-0">
        <div className="flex items-center gap-2 lg:gap-3">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 hover:opacity-80 transition group"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-purple to-neon-cyan flex items-center justify-center text-white shadow-md shadow-purple-900/30">
              <Gamepad2 className="h-5 w-5 transition-transform group-hover:scale-105" />
            </div>
            <span className="font-black text-sm lg:text-base tracking-wider hidden sm:inline text-white">
              STREAM<span className="text-neon-cyan">SYNC</span>
            </span>
          </button>

          <div className="h-4 w-[1px] bg-[#1F2937] mx-1 hidden sm:block" />

          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#161c28] transition"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Inicio</span>
          </button>

          <div className="flex items-center gap-1.5 bg-[#161c28] border border-[#1F2937] px-2.5 py-1 rounded-md text-[11px] text-gray-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
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
                  ? "Buscar streamer o canal de Twitch..."
                  : "Buscar vídeo o enlace de YouTube..."
              }
              className="w-full bg-[#141a26] border border-[#1F2937] focus:border-neon-cyan rounded-lg pl-9 pr-16 py-1.5 text-xs text-white placeholder-gray-500 outline-none transition"
            />
            {searching ? (
              <div className="absolute right-2 text-neon-cyan">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              </div>
            ) : (
              <button
                type="submit"
                className="absolute right-1 px-2.5 py-1 bg-gradient-to-r from-brand-purple to-neon-purple hover:to-neon-cyan text-[11px] font-bold text-white rounded-md transition shadow"
              >
                Cargar
              </button>
            )}
          </form>

          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#141a26] border border-[#1F2937] rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="p-2 border-b border-[#1F2937] flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-neon-cyan" />
                  <span>Resultados en tiempo real</span>
                </div>
                <span className="text-neon-cyan text-[9px]">API Conectada</span>
              </div>
              <div className="max-h-56 overflow-y-auto">
                {filteredSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectQuickStream(item)}
                    className="w-full px-3 py-2 text-left hover:bg-[#1F2937] flex items-center justify-between text-xs transition border-b border-[#1F2937]/40 last:border-0"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {item.avatar ? (
                        <img
                          src={item.avatar}
                          alt={item.name}
                          className="h-6 w-6 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-brand-purple/20 flex items-center justify-center text-[10px] font-bold text-neon-cyan shrink-0">
                          {item.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="font-semibold text-gray-200 truncate">{item.name}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0 ml-2">{item.category}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#141a26] border border-[#1F2937] p-0.5 rounded-lg">
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
                  ? "bg-red-600 text-white shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Tv className="h-3 w-3" />
              <span className="hidden sm:inline">YouTube</span>
            </button>
          </div>

          <button
            onClick={() => setShowStatsOverlay(!showStatsOverlay)}
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
              showStatsOverlay
                ? "bg-neon-cyan/15 text-neon-cyan border-neon-cyan/40"
                : "bg-surface border-surfaceBorder text-gray-400 hover:text-white"
            }`}
          >
            <Trophy className="h-3.5 w-3.5" />
            <span className="hidden lg:inline text-[11px]">Overlay Stats</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#141a26] border border-[#1F2937] hover:border-neon-cyan/50 transition text-gray-300"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Share2 className="h-3.5 w-3.5 text-gray-400" />
            )}
            <span className="hidden md:inline text-[11px]">{copied ? "Copiado" : "Invitar"}</span>
          </button>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-neon-cyan/50 transition"
            >
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-purple to-neon-cyan border border-white/20 flex items-center justify-center font-bold text-xs text-white">
                  GP
                </div>
                <span
                  className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#0B0F14] ${
                    userStatus === "online"
                      ? "bg-emerald-400"
                      : userStatus === "idle"
                      ? "bg-amber-400"
                      : "bg-red-500"
                  }`}
                />
              </div>
              <ChevronDown className="h-3 w-3 text-gray-400 hidden sm:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-[#1F2937] bg-[#141a26] shadow-2xl p-2 z-50">
                <div className="p-2 border-b border-[#1F2937] flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-brand-purple to-neon-cyan flex items-center justify-center font-black text-sm text-white shadow">
                    GP
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-sm text-white truncate">GamerPro</p>
                    <p className="text-[11px] text-gray-400 truncate">@gamerpro_live</p>
                  </div>
                </div>

                <div className="py-2 px-1 border-b border-[#1F2937]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 px-2 mb-1">
                    Estado en la sala
                  </p>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => setUserStatus("online")}
                      className={`flex items-center justify-center gap-1 py-1 rounded text-[10px] font-semibold transition ${
                        userStatus === "online" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-gray-400 hover:bg-[#1F2937]"
                      }`}
                    >
                      <Circle className="h-2 w-2 fill-emerald-400 text-emerald-400" />
                      Online
                    </button>
                    <button
                      onClick={() => setUserStatus("idle")}
                      className={`flex items-center justify-center gap-1 py-1 rounded text-[10px] font-semibold transition ${
                        userStatus === "idle" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-gray-400 hover:bg-[#1F2937]"
                      }`}
                    >
                      <Circle className="h-2 w-2 fill-amber-400 text-amber-400" />
                      Ausente
                    </button>
                    <button
                      onClick={() => setUserStatus("dnd")}
                      className={`flex items-center justify-center gap-1 py-1 rounded text-[10px] font-semibold transition ${
                        userStatus === "dnd" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "text-gray-400 hover:bg-[#1F2937]"
                      }`}
                    >
                      <Circle className="h-2 w-2 fill-red-500 text-red-500" />
                      Ocupado
                    </button>
                  </div>
                </div>

                <div className="py-1 border-b border-[#1F2937] text-xs">
                  <button
                    onClick={() => setAudioDucking(!audioDucking)}
                    className="w-full flex items-center justify-between px-3 py-2 text-gray-300 hover:text-white hover:bg-[#1F2937] rounded-lg transition"
                  >
                    <span>Atenuación de stream (Ducking)</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${audioDucking ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-800 text-gray-400"}`}>
                      {audioDucking ? "ON" : "OFF"}
                    </span>
                  </button>
                  <button
                    onClick={() => router.push("/")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition text-xs mt-1"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Salir de la sala</span>
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
            <div className="w-full h-full relative">
              {platform === "twitch" ? (
                <TwitchPlayer channel={activeStream} />
              ) : (
                <YouTubePlayer videoId={activeStream} />
              )}

              {showStatsOverlay && (
                <div className="absolute top-4 left-4 z-30 max-w-xs sm:max-w-sm rounded-xl border border-neon-cyan/40 bg-[#0B0F14]/85 backdrop-blur-md p-3 shadow-2xl shadow-black/80 pointer-events-auto transition-all">
                  <div className="flex items-center justify-between border-b border-surfaceBorder/60 pb-2 mb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-neon-cyan uppercase tracking-wider">
                      <Trophy className="h-3.5 w-3.5" />
                      <span>{gameStats.game} Overlay</span>
                    </div>
                    <span className="text-[10px] bg-neon-cyan/15 text-neon-cyan font-mono px-2 py-0.5 rounded border border-neon-cyan/30">
                      MAPA • {gameStats.map}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-surface/80 p-1.5 rounded-lg border border-surfaceBorder">
                      <div className="text-[10px] text-gray-400 uppercase">Rondas</div>
                      <div className="font-bold text-white text-sm">{gameStats.score}</div>
                    </div>
                    <div className="bg-surface/80 p-1.5 rounded-lg border border-surfaceBorder">
                      <div className="text-[10px] text-gray-400 uppercase">Top Fragger</div>
                      <div className="font-bold text-neon-pink text-sm truncate">{gameStats.topFragger}</div>
                    </div>
                    <div className="bg-surface/80 p-1.5 rounded-lg border border-surfaceBorder">
                      <div className="text-[10px] text-gray-400 uppercase">Economía</div>
                      <div className="font-bold text-emerald-400 text-sm">{gameStats.economy}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="absolute bottom-4 left-4 z-30 flex items-center gap-3 bg-[#0B0F14]/90 backdrop-blur-xl border border-surfaceBorder/80 px-4 py-2 rounded-2xl shadow-2xl">
                <div className="relative">
                  <div
                    className={`h-9 w-9 rounded-full bg-gradient-to-tr from-brand-purple to-neon-cyan flex items-center justify-center font-bold text-xs text-white transition-all ${
                      isSpeaking ? "ring-2 ring-emerald-400 shadow-glow-cyan scale-105" : ""
                    }`}
                  >
                    GP
                  </div>
                  {isSpeaking && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </div>

                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    {isSpeaking ? (
                      <span className="text-emerald-400">Estás hablando...</span>
                    ) : micEnabled ? (
                      <span className="text-gray-300">Voz conectada</span>
                    ) : (
                      <span className="text-red-400">Micrófono silenciado</span>
                    )}
                  </span>
                  <span className="text-[10px] text-gray-400">Canal de voz WebRTC • Ultra baja latencia</span>
                </div>

                <div className="flex items-center gap-1.5 ml-2">
                  <button
                    onClick={() => {
                      setMicEnabled(!micEnabled);
                      trackEvent("voice_toggle", { enabled: !micEnabled });
                    }}
                    className={`p-2 rounded-xl border transition ${
                      micEnabled
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                        : "bg-red-500/20 border-red-500/40 text-red-400"
                    }`}
                  >
                    {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </button>

                  <button
                    onClick={() => setDeafened(!deafened)}
                    className={`p-2 rounded-xl border transition ${
                      deafened
                        ? "bg-red-500/20 border-red-500/40 text-red-400"
                        : "bg-surface border-surfaceBorder text-gray-400 hover:text-white"
                    }`}
                  >
                    {deafened ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center max-w-lg">
              <div className="relative mb-6">
                <div className="h-24 w-24 rounded-full bg-brand-purple/10 border border-brand-purple/30 flex items-center justify-center text-neon-cyan animate-pulse">
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#141a26] border border-[#1F2937] hover:border-neon-cyan hover:text-neon-cyan transition shadow"
                  >
                    <Sparkles className="h-3 w-3 text-neon-cyan" />
                    <span>{ch.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>

        <aside className="w-full lg:w-[340px] border-t lg:border-t-0 lg:border-l border-[#1F2937] bg-[#0F141C] flex flex-col shrink-0 h-64 lg:h-full z-20">
          <div className="h-11 px-3 border-b border-[#1F2937] flex items-center justify-between bg-[#121824]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-gray-200">
                CHAT EN VIVO
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                SYNC
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[11px] text-gray-400 font-bold px-1.5 py-0.5 rounded bg-[#161c28] border border-[#1F2937]">
                <Users className="h-3 w-3 text-neon-cyan" />
                <span>4 en sala</span>
              </div>
            </div>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs font-normal selection:bg-purple-900/50">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="leading-relaxed hover:bg-white/[0.02] -mx-2 px-2 py-0.5 rounded">
                <span className="text-[10px] text-gray-500 mr-1.5">{msg.time}</span>
                {msg.isBadge && (
                  <span className="bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 text-[9px] font-bold px-1 py-0.2 rounded mr-1.5">
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

          <form onSubmit={handleSendMessage} className="p-2.5 border-t border-[#1F2937] bg-[#121824]">
            <div className="flex items-center gap-2 bg-[#161c28] border border-[#1F2937] rounded-lg px-2.5 py-1.5 focus-within:border-neon-cyan transition">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Enviar mensaje al squad..."
                className="w-full bg-transparent text-xs text-white placeholder-gray-500 outline-none"
              />
              <button
                type="submit"
                className="text-neon-cyan hover:text-white p-1 rounded transition"
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
