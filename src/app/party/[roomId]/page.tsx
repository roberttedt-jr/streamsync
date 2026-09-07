"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
  Plus,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/auth/AuthModal";

interface SuggestionItem {
  name: string;
  platform: "twitch" | "youtube";
  category: string;
  id?: string;
  avatar?: string;
}

const POPULAR_CHANNELS: SuggestionItem[] = [
  { name: "valorant", platform: "twitch", category: "VCT / Esports" },
  { name: "eslcs", platform: "twitch", category: "Counter-Strike 2 / Pro" },
  { name: "rocketleague", platform: "twitch", category: "RLCS / Torneo" },
  { name: "elxokas", platform: "twitch", category: "Gaming / Variedad" },
  { name: "auronplay", platform: "twitch", category: "Minecraft / GTA" },
  { name: "illojuan", platform: "twitch", category: "Variedad / Retro" },
  { name: "rubius", platform: "twitch", category: "Gaming / Directos" },
  { name: "midudev", platform: "twitch", category: "Programación / Tech" },
  { name: "Lofi Girl", id: "jfKfPfyJRdk", platform: "youtube", category: "Música / Chill 24/7" },
  { name: "Synthwave Radio", id: "4xDzrJKXOOY", platform: "youtube", category: "Música / Synth 24/7" },
  { name: "GameSpot Live", id: "0qL3w2eG6Jk", platform: "youtube", category: "Gaming / Directo" },
];

function PartyRoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeParams: any = useParams();
  const roomId = routeParams?.roomId ? String(routeParams.roomId) : "default";
  const { user, logout } = useAuth();

  const urlStream = searchParams?.get("stream") || null;
  const urlPlatform = (searchParams?.get("platform") as "twitch" | "youtube") || "twitch";

  const [platform, setPlatform] = useState<"twitch" | "youtube">(urlPlatform);
  const [activeStream, setActiveStream] = useState<string | null>(urlStream);

  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [apiSuggestions, setApiSuggestions] = useState<SuggestionItem[]>([]);
  const [copied, setCopied] = useState(false);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userStatus, setUserStatus] = useState<"online" | "idle" | "dnd">("online");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  const [micEnabled, setMicEnabled] = useState(true);
  const [deafened, setDeafened] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioDucking, setAudioDucking] = useState(true);

  const [showStatsOverlay, setShowStatsOverlay] = useState(false);
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
      color: "#38BDF8",
      isBadge: true,
      text: `Sala #${roomId} iniciada. Sincronización activa al milisegundo.`,
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
    if (!urlStream) {
      fetch(`/api/rooms?code=${roomId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.room?.channel && data.room.channel.trim()) {
            setActiveStream(data.room.channel);
            if (data.room.platform) setPlatform(data.room.platform);
          }
        })
        .catch(() => {});
    }
  }, [roomId, urlStream]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/${roomId}/sync`);
        if (res.ok) {
          const data = await res.json();
          if (data.state) {
            if (data.state.channel && data.state.channel.trim() && !activeStream) {
              setActiveStream(data.state.channel);
              if (data.state.platform) setPlatform(data.state.platform);
            }
            if (Array.isArray(data.state.messages) && data.state.messages.length > 0) {
              setChatMessages((prev) => {
                const existingIds = new Set(prev.map((m) => String(m.id)));
                const newMsgs = data.state.messages
                  .filter((m: any) => !existingIds.has(String(m.id)))
                  .map((m: any) => ({
                    id: m.id,
                    sender: m.user,
                    color: m.role === "BOT" ? "#38BDF8" : "#A78BFA",
                    isBadge: m.role === "BOT",
                    text: m.text,
                    time: m.time || "Ahora",
                  }));
                return [...prev, ...newMsgs];
              });
            }
          }
        }
      } catch {}
    }, 4000);

    return () => clearInterval(interval);
  }, [roomId, activeStream]);

  useEffect(() => {
    let animationFrameId: number;
    let isCancelled = false;

    async function initMic() {
      if (!micEnabled || typeof window === "undefined") {
        setIsSpeaking(false);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        });

        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        micStreamRef.current = stream;
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioContextRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkAudio = () => {
          if (isCancelled) return;
          if (!analyserRef.current) {
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

    let targetStream = "";
    if (platform === "twitch") {
      targetStream = query
        .replace("https://www.twitch.tv/", "")
        .replace("https://twitch.tv/", "")
        .replace("@", "")
        .trim();
      setActiveStream(targetStream);
      trackEvent("stream_switch", { platform: "twitch", channel: targetStream });
    } else {
      targetStream = extractYouTubeId(query);
      setActiveStream(targetStream);
      trackEvent("stream_switch", { platform: "youtube", videoId: targetStream });
    }

    try {
      fetch(`/api/rooms/${roomId}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_playback",
          channel: targetStream,
          platform,
        }),
      }).catch(() => {});
    } catch {}

    setQuery("");
    setShowSuggestions(false);
  };

  const handleSelectQuickStream = (suggestion: SuggestionItem) => {
    setPlatform(suggestion.platform);
    const target = suggestion.platform === "twitch" ? suggestion.name : (suggestion.id || suggestion.name);
    setActiveStream(target);
    trackEvent("stream_switch", { platform: suggestion.platform, channel: target });

    try {
      fetch(`/api/rooms/${roomId}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_playback",
          channel: target,
          platform: suggestion.platform,
        }),
      }).catch(() => {});
    } catch {}

    setQuery("");
    setShowSuggestions(false);
  };

  const handleSendMessage = async (e: any) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!messageInput.trim()) return;

    const text = messageInput.trim();
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    const senderName = user?.name || "Invitado";
    const newMsg = {
      id: Date.now(),
      sender: senderName,
      color: "#38BDF8",
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
          user: senderName,
          text,
          role: "MEMBER",
        }),
      }).catch(() => {});
    } catch {}
  };

  const handleCreateNewRoom = () => {
    if (!user) {
      setAuthNotice("Debes tener una cuenta para crear una nueva watch party.");
      setAuthModalOpen(true);
      return;
    }

    const code = Math.random().toString(36).substring(2, 8);
    router.push(`/party/${code}`);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#090B10] text-[#F8FAFC] overflow-hidden font-sans select-none">
      <header className="h-14 border-b border-white/[0.08] bg-[#090B10] px-4 flex items-center justify-between gap-3 z-40 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2.5 hover:opacity-80 transition group cursor-pointer"
          >
            <div className="h-8 w-8 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center transition-colors group-hover:border-white/20">
              <Gamepad2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white hidden sm:inline">
              Stream<span className="text-gray-400">Sync</span>
            </span>
          </button>

          <div className="h-4 w-[1px] bg-white/[0.08] mx-1 hidden sm:block" />

          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/[0.04] transition cursor-pointer"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Inicio</span>
          </button>

          <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-lg text-xs text-gray-300 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>#{roomId}</span>
          </div>
        </div>

        <div className="relative flex-1 max-w-md mx-2">
          <form onSubmit={handleLoadStream} className="flex items-center relative">
            <Search className="absolute left-3 h-3.5 w-3.5 text-gray-500 pointer-events-none" />
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
              className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-white/30 rounded-xl pl-9 pr-16 py-1.5 text-xs text-white placeholder-gray-500 outline-none transition"
            />
            {searching ? (
              <div className="absolute right-3 text-gray-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              </div>
            ) : (
              <button
                type="submit"
                className="absolute right-1 px-3 py-1 bg-white text-black font-semibold text-xs rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Cargar
              </button>
            )}
          </form>

          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#0D0F17] border border-white/[0.08] rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="p-2 border-b border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                <span>Resultados de búsqueda</span>
                <span className="text-emerald-400 text-[9px]">En Directo</span>
              </div>
              <div className="max-h-56 overflow-y-auto">
                {filteredSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectQuickStream(item)}
                    className="w-full px-3 py-2 text-left hover:bg-white/[0.04] flex items-center justify-between text-xs transition border-b border-white/[0.04] last:border-0 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {item.avatar ? (
                        <img
                          src={item.avatar}
                          alt={item.name}
                          className="h-6 w-6 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
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
          <div className="flex items-center bg-white/[0.03] border border-white/[0.08] p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => {
                setPlatform("twitch");
                setQuery("");
              }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition ${
                platform === "twitch"
                  ? "bg-[#9146FF] text-white"
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
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition ${
                platform === "youtube"
                  ? "bg-red-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Tv className="h-3 w-3" />
              <span className="hidden sm:inline">YouTube</span>
            </button>
          </div>

          <button
            onClick={() => setShowStatsOverlay(!showStatsOverlay)}
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
              showStatsOverlay
                ? "bg-white text-black border-white"
                : "bg-white/[0.03] border-white/[0.08] text-gray-400 hover:text-white"
            }`}
          >
            <Trophy className="h-3.5 w-3.5" />
            <span className="hidden lg:inline text-[11px]">HUD Stats</span>
          </button>

          {activeStream && (
            <button
              onClick={() => {
                setActiveStream(null);
                try {
                  fetch(`/api/rooms/${roomId}/sync`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "update_playback", channel: "" }),
                  }).catch(() => {});
                } catch {}
              }}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] text-gray-300 hover:text-white transition cursor-pointer"
              title="Volver a la pantalla de espera"
            >
              <RadioTower className="h-3.5 w-3.5 text-gray-400" />
              <span className="hidden lg:inline text-[11px]">Pantalla de Espera</span>
            </button>
          )}

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] transition text-gray-300 cursor-pointer"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Share2 className="h-3.5 w-3.5 text-gray-400" />
            )}
            <span className="hidden md:inline text-[11px]">{copied ? "Copiado" : "Invitar"}</span>
          </button>

          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-white/20 transition cursor-pointer"
              >
                <div className="relative">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover border border-white/20"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-white/[0.08] border border-white/20 flex items-center justify-center font-bold text-xs text-white">
                      {user.name ? user.name.slice(0, 2).toUpperCase() : "GP"}
                    </div>
                  )}
                  <span
                    className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#090B10] ${
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
                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-white/[0.08] bg-[#0D0F17] shadow-2xl p-2 z-50 animate-in fade-in duration-150">
                  <div className="p-2 border-b border-white/[0.06] flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-10 w-10 rounded-full object-cover border border-white/20"
                    />
                    <div className="overflow-hidden">
                      <p className="font-bold text-sm text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-gray-400 truncate">@{user.username}</p>
                    </div>
                  </div>

                  {(user.twitchUsername || user.youtubeHandle) && (
                    <div className="py-2 px-1 border-b border-white/[0.06] space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 px-2 mb-1">
                        Mis Streams Vinculados
                      </p>
                      {user.twitchUsername && (
                        <button
                          onClick={() => {
                            setPlatform("twitch");
                            setActiveStream(user.twitchUsername!);
                            setShowProfileMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#9146FF] hover:bg-white/[0.05] rounded-lg transition text-left cursor-pointer"
                        >
                          <Radio className="h-3.5 w-3.5" />
                          <span className="truncate">Cargar mi Twitch: {user.twitchUsername}</span>
                        </button>
                      )}
                      {user.youtubeHandle && (
                        <button
                          onClick={() => {
                            setPlatform("youtube");
                            setActiveStream(user.youtubeHandle!);
                            setShowProfileMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-400 hover:bg-white/[0.05] rounded-lg transition text-left cursor-pointer"
                        >
                          <Tv className="h-3.5 w-3.5" />
                          <span className="truncate">Cargar mi YouTube: {user.youtubeHandle}</span>
                        </button>
                      )}
                    </div>
                  )}

                  <div className="py-2 px-1 border-b border-white/[0.06]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 px-2 mb-1">
                      Estado en la sala
                    </p>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => setUserStatus("online")}
                        className={`flex items-center justify-center gap-1 py-1 rounded text-[10px] font-semibold transition cursor-pointer ${
                          userStatus === "online" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-gray-400 hover:bg-white/[0.04]"
                        }`}
                      >
                        <Circle className="h-2 w-2 fill-emerald-400 text-emerald-400" />
                        Online
                      </button>
                      <button
                        onClick={() => setUserStatus("idle")}
                        className={`flex items-center justify-center gap-1 py-1 rounded text-[10px] font-semibold transition cursor-pointer ${
                          userStatus === "idle" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-gray-400 hover:bg-white/[0.04]"
                        }`}
                      >
                        <Circle className="h-2 w-2 fill-amber-400 text-amber-400" />
                        Ausente
                      </button>
                      <button
                        onClick={() => setUserStatus("dnd")}
                        className={`flex items-center justify-center gap-1 py-1 rounded text-[10px] font-semibold transition cursor-pointer ${
                          userStatus === "dnd" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "text-gray-400 hover:bg-white/[0.04]"
                        }`}
                      >
                        <Circle className="h-2 w-2 fill-red-500 text-red-500" />
                        Ocupado
                      </button>
                    </div>
                  </div>

                  <div className="py-1 border-b border-white/[0.06] text-xs">
                    <button
                      onClick={handleCreateNewRoom}
                      className="w-full flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/[0.04] rounded-lg transition cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Crear Nueva Sala</span>
                    </button>
                    <button
                      onClick={() => setAudioDucking(!audioDucking)}
                      className="w-full flex items-center justify-between px-3 py-2 text-gray-300 hover:text-white hover:bg-white/[0.04] rounded-lg transition cursor-pointer"
                    >
                      <span>Atenuación de audio</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${audioDucking ? "bg-emerald-500/20 text-emerald-400" : "bg-white/[0.06] text-gray-400"}`}>
                        {audioDucking ? "ON" : "OFF"}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition text-xs mt-1 cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthNotice("Crea tu cuenta para guardar tu progreso, personalizar tu perfil y crear tus propias salas.");
                setAuthModalOpen(true);
              }}
              className="liquid-btn-primary px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Crear Cuenta
            </button>
          )}
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
                <div className="absolute top-4 left-4 z-30 max-w-xs sm:max-w-sm rounded-xl border border-white/[0.1] bg-[#0D0F17]/95 backdrop-blur-md p-3 shadow-2xl pointer-events-auto transition-all animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 mb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                      <Trophy className="h-3.5 w-3.5 text-yellow-400" />
                      <span>{gameStats.game} Overlay</span>
                    </div>
                    <span className="text-[10px] bg-white/[0.06] text-gray-300 font-mono px-2 py-0.5 rounded">
                      MAPA • {gameStats.map}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white/[0.02] p-1.5 rounded-lg border border-white/[0.06]">
                      <div className="text-[10px] text-gray-400 uppercase">Rondas</div>
                      <div className="font-bold text-white text-sm">{gameStats.score}</div>
                    </div>
                    <div className="bg-white/[0.02] p-1.5 rounded-lg border border-white/[0.06]">
                      <div className="text-[10px] text-gray-400 uppercase">Top Fragger</div>
                      <div className="font-bold text-white text-sm truncate">{gameStats.topFragger}</div>
                    </div>
                    <div className="bg-white/[0.02] p-1.5 rounded-lg border border-white/[0.06]">
                      <div className="text-[10px] text-gray-400 uppercase">Economía</div>
                      <div className="font-bold text-emerald-400 text-sm">{gameStats.economy}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="absolute bottom-4 left-4 z-30 flex items-center gap-3 bg-[#0D0F17]/90 backdrop-blur-xl border border-white/[0.08] px-3.5 py-2 rounded-xl shadow-2xl">
                <div className="relative">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className={`h-8 w-8 rounded-full object-cover border border-white/20 transition-all ${
                        isSpeaking ? "ring-2 ring-emerald-400 scale-105" : ""
                      }`}
                    />
                  ) : (
                    <div
                      className={`h-8 w-8 rounded-full bg-white/[0.08] flex items-center justify-center font-bold text-xs text-white transition-all ${
                        isSpeaking ? "ring-2 ring-emerald-400 scale-105" : ""
                      }`}
                    >
                      {user?.name ? user.name.slice(0, 2).toUpperCase() : "IN"}
                    </div>
                  )}
                  {isSpeaking && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </div>

                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    {isSpeaking ? (
                      <span className="text-emerald-400">Hablando...</span>
                    ) : micEnabled ? (
                      <span className="text-gray-300">{user?.name || "Invitado"}</span>
                    ) : (
                      <span className="text-red-400">Silenciado</span>
                    )}
                  </span>
                  <span className="text-[10px] text-gray-500">Voz sincronizada 0ms</span>
                </div>

                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => {
                      setMicEnabled(!micEnabled);
                      trackEvent("voice_toggle", { enabled: !micEnabled });
                    }}
                    className={`p-1.5 rounded-lg border transition cursor-pointer ${
                      micEnabled
                        ? "bg-white/[0.06] border-white/[0.08] text-white"
                        : "bg-red-500/20 border-red-500/40 text-red-400"
                    }`}
                  >
                    {micEnabled ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
                  </button>

                  <button
                    onClick={() => setDeafened(!deafened)}
                    className={`p-1.5 rounded-lg border transition cursor-pointer ${
                      deafened
                        ? "bg-red-500/20 border-red-500/40 text-red-400"
                        : "bg-white/[0.06] border-white/[0.08] text-gray-300 hover:text-white"
                    }`}
                  >
                    {deafened ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center max-w-xl w-full mx-auto my-auto animate-in fade-in duration-300 overflow-y-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono mb-5 text-gray-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="tracking-wider uppercase font-semibold text-gray-200">Pantalla de Espera</span>
                <span className="text-white/20">•</span>
                <span className="text-emerald-400">Sincronización Lista (0ms)</span>
              </div>

              <div className="relative mb-5">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.1] shadow-2xl flex items-center justify-center text-white backdrop-blur-xl">
                  <RadioTower className="h-8 w-8 sm:h-9 sm:w-9 text-gray-200 animate-pulse" />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-black"></span>
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
                Esperando retransmisión
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 max-w-md leading-relaxed mb-6 font-normal">
                Esta sala está conectada. Elige un canal o vídeo para comenzar a verlo sincronizado con todos los miembros de la sala.
              </p>

              {/* Selector interactivo dentro de la pantalla de espera */}
              <div className="w-full bg-[#0D0F17] border border-white/[0.08] rounded-2xl p-4 mb-5 text-left shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-300">Iniciar emisión en la sala:</span>
                  <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.06] text-[11px]">
                    <button
                      type="button"
                      onClick={() => setPlatform("twitch")}
                      className={`px-2.5 py-0.5 rounded-md font-medium transition cursor-pointer ${
                        platform === "twitch" ? "bg-[#9146FF] text-white" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Twitch
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlatform("youtube")}
                      className={`px-2.5 py-0.5 rounded-md font-medium transition cursor-pointer ${
                        platform === "youtube" ? "bg-[#FF0000] text-white" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      YouTube
                    </button>
                  </div>
                </div>

                <form onSubmit={handleLoadStream} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                      platform === "twitch"
                        ? "Escribe streamer o canal (ej. valorant, eslcs)..."
                        : "Pega enlace o ID de vídeo de YouTube..."
                    }
                    className="flex-1 bg-white/[0.03] border border-white/[0.08] focus:border-white/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 outline-none transition"
                  />
                  <button
                    type="submit"
                    disabled={!query.trim()}
                    className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  >
                    Reproducir
                  </button>
                </form>

                {user && (user.twitchUsername || user.youtubeHandle) && (
                  <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-[11px] text-gray-500">Tus canales:</span>
                    {user.twitchUsername && (
                      <button
                        type="button"
                        onClick={() => {
                          setPlatform("twitch");
                          setActiveStream(user.twitchUsername!);
                          try {
                            fetch(`/api/rooms/${roomId}/sync`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ action: "update_playback", channel: user.twitchUsername, platform: "twitch" }),
                            }).catch(() => {});
                          } catch {}
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#9146FF]/20 hover:bg-[#9146FF]/30 border border-[#9146FF]/30 text-[#A970FF] text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Radio className="h-3 w-3" />
                        <span>Cargar mi Twitch (@{user.twitchUsername})</span>
                      </button>
                    )}
                    {user.youtubeHandle && (
                      <button
                        type="button"
                        onClick={() => {
                          setPlatform("youtube");
                          setActiveStream(user.youtubeHandle!);
                          try {
                            fetch(`/api/rooms/${roomId}/sync`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ action: "update_playback", channel: user.youtubeHandle, platform: "youtube" }),
                            }).catch(() => {});
                          } catch {}
                        }}
                        className="px-2.5 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 text-red-400 text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Tv className="h-3 w-3" />
                        <span>Cargar mi YouTube (@{user.youtubeHandle})</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Grid de sugerencias */}
              <div className="w-full text-left mb-5">
                <p className="text-[11px] font-mono text-gray-500 uppercase tracking-wider mb-2">
                  Sugerencias Populares
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {POPULAR_CHANNELS.slice(0, 6).map((ch, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectQuickStream(ch)}
                      className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/20 hover:bg-white/[0.04] transition text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`h-1.5 w-1.5 rounded-full ${ch.platform === "twitch" ? "bg-[#9146FF]" : "bg-red-500"}`} />
                        <span className="text-xs font-bold text-gray-200 group-hover:text-white truncate">
                          {ch.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500 block truncate">
                        {ch.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* HUD de Voz y Enlace */}
              <div className="w-full flex flex-col sm:flex-row items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className={`h-7 w-7 rounded-full object-cover border border-white/20 transition-all ${
                          isSpeaking ? "ring-2 ring-emerald-400 scale-105" : ""
                        }`}
                      />
                    ) : (
                      <div
                        className={`h-7 w-7 rounded-full bg-white/[0.08] flex items-center justify-center font-bold text-xs text-white transition-all ${
                          isSpeaking ? "ring-2 ring-emerald-400 scale-105" : ""
                        }`}
                      >
                        {user?.name ? user.name.slice(0, 2).toUpperCase() : "IN"}
                      </div>
                    )}
                    {isSpeaking && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    )}
                  </div>

                  <div className="text-left">
                    <span className="text-xs font-semibold text-white block">
                      {isSpeaking ? (
                        <span className="text-emerald-400">Hablando...</span>
                      ) : micEnabled ? (
                        <span className="text-gray-300">Voz Activa • {user?.name || "Tú"}</span>
                      ) : (
                        <span className="text-red-400">Micrófono silenciado</span>
                      )}
                    </span>
                    <span className="text-[10px] text-gray-500">Audio WebRTC integrado</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setMicEnabled(!micEnabled);
                      trackEvent("voice_toggle", { enabled: !micEnabled });
                    }}
                    className={`p-1.5 rounded-xl border transition cursor-pointer ${
                      micEnabled
                        ? "bg-white/[0.06] border-white/[0.08] text-white"
                        : "bg-red-500/20 border-red-500/40 text-red-400"
                    }`}
                    title={micEnabled ? "Silenciar micrófono" : "Activar micrófono"}
                  >
                    {micEnabled ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
                  </button>

                  <button
                    onClick={() => setDeafened(!deafened)}
                    className={`p-1.5 rounded-xl border transition cursor-pointer ${
                      deafened
                        ? "bg-red-500/20 border-red-500/40 text-red-400"
                        : "bg-white/[0.06] border-white/[0.08] text-gray-300 hover:text-white"
                    }`}
                    title={deafened ? "Reactivar sonido" : "Ensordecer"}
                  >
                    {deafened ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="ml-1 px-3 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-gray-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5 text-gray-400" />}
                    <span>{copied ? "¡Copiado!" : "Invitar amigos"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        <aside className="w-full lg:w-[320px] border-t lg:border-t-0 lg:border-l border-white/[0.08] bg-[#0D0F17] flex flex-col shrink-0 h-64 lg:h-full z-20">
          <div className="h-12 px-4 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                Chat en Vivo
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                SYNC 0ms
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-gray-400 font-mono">
              <Users className="h-3 w-3 text-gray-400" />
              <span>4</span>
            </div>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs font-normal">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="leading-relaxed hover:bg-white/[0.02] -mx-2 px-2 py-0.5 rounded">
                <span className="text-[10px] text-gray-500 mr-1.5 font-mono">{msg.time}</span>
                {msg.isBadge && (
                  <span className="bg-white/[0.08] text-white text-[9px] font-bold px-1 py-0.5 rounded mr-1.5">
                    BOT
                  </span>
                )}
                <span className="font-semibold mr-1.5 text-white">
                  {msg.sender}:
                </span>
                <span className="text-gray-300 break-words">{msg.text}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-white/[0.06] bg-[#0D0F17]">
            <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-1.5 focus-within:border-white/30 transition">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Enviar mensaje al squad..."
                className="w-full bg-transparent text-xs text-white placeholder-gray-500 outline-none"
              />
              <button
                type="submit"
                className="text-white hover:text-gray-300 p-1 rounded transition cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </aside>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab="register"
        notice={authNotice}
      />
    </div>
  );
}

export default function PartyPage() {
  return (
    <AuthProvider>
      <PartyRoomContent />
    </AuthProvider>
  );
}
