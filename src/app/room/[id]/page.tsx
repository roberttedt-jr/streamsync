"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import TwitchPlayer from "@/components/video/TwitchPlayer";
import YouTubePlayer from "@/components/video/YouTubePlayer";
import GameStatsOverlay from "@/components/room/GameStatsOverlay";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  Gamepad2,
  Tv,
  Radio,
  Send,
  Users,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Share2,
  Check,
  Search,
  Trophy,
  RadioTower,
  Hand,
  Keyboard,
  LogOut,
  Maximize2,
  Minimize2,
  Play,
  Settings,
  Sparkles,
  Info,
  Shield,
  Crown,
  ChevronDown,
  X,
  Sliders,
} from "lucide-react";

interface SuggestionItem {
  name: string;
  platform: "twitch" | "youtube";
  category: string;
  id?: string;
}

const QUICK_STREAM_PRESETS: SuggestionItem[] = [
  { name: "valorant", platform: "twitch", category: "VCT / Esports" },
  { name: "eslcs", platform: "twitch", category: "CS2 / Pro League" },
  { name: "rocketleague", platform: "twitch", category: "RLCS / Torneo" },
  { name: "illojuan", platform: "twitch", category: "Gaming / Variedad" },
  { name: "elxokas", platform: "twitch", category: "Gaming / Directos" },
  { name: "midudev", platform: "twitch", category: "Programación / Tech" },
  { name: "Lofi Girl", id: "jfKfPfyJRdk", platform: "youtube", category: "Música / Chill 24/7" },
  { name: "Synthwave Radio", id: "4xDzrJKXOOY", platform: "youtube", category: "Música / Synth 24/7" },
  { name: "GameSpot Live", id: "0qL3w2eG6Jk", platform: "youtube", category: "Gaming / Directo" },
];

function WatchPartyRoomContent() {
  const router = useRouter();
  const params: any = useParams();
  const searchParams = useSearchParams();
  const roomId = params?.id ? String(params.id) : "gaming-hub";
  const { user } = useAuth();
  const { addToast } = useToast();

  const initialPlatform = (searchParams?.get("platform") as "twitch" | "youtube") || "twitch";
  const initialStream = searchParams?.get("stream") || null;

  const [platform, setPlatform] = useState<"twitch" | "youtube">(initialPlatform);
  const [activeStream, setActiveStream] = useState<string | null>(initialStream);
  const [streamInput, setStreamInput] = useState("");
  const [copied, setCopied] = useState(false);

  // Audio / Voice Chat & Turn Queue State
  const [micActive, setMicActive] = useState(true);
  const [deafened, setDeafened] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [turnQueue, setTurnQueue] = useState<{ id: string; name: string; avatar?: string }[]>([]);
  const [audioDucking, setAudioDucking] = useState(true);

  // Stats Overlay
  const [showStats, setShowStats] = useState(true);

  // Modals & Panels
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"chat" | "participants">("chat");

  // Chat
  const [messages, setMessages] = useState<
    { id: number; sender: string; text: string; time: string; isHost?: boolean; isSystem?: boolean }[]
  >([
    {
      id: 1,
      sender: "StreamSync",
      text: `¡Bienvenidos a la sala #${roomId}! Sincronización WebRTC activa a 0ms.`,
      time: "Ahora",
      isSystem: true,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Participants
  const participants = useMemo(() => {
    const list = [
      {
        id: user?.id || "local-user",
        name: user?.name || "Tú (Gamer)",
        avatar: user?.avatar,
        isHost: true,
        speaking: isSpeaking,
        micActive: micActive,
        handRaised: handRaised,
      },
      {
        id: "p_1",
        name: "Carlos_R",
        avatar: "",
        isHost: false,
        speaking: true,
        micActive: true,
        handRaised: false,
      },
      {
        id: "p_2",
        name: "ElenaGamer",
        avatar: "",
        isHost: false,
        speaking: false,
        micActive: false,
        handRaised: true,
      },
    ];
    return list;
  }, [user, isSpeaking, micActive, handRaised]);

  // Simulate speaking detection pulses
  useEffect(() => {
    if (!micActive) {
      setIsSpeaking(false);
      return;
    }
    const interval = setInterval(() => {
      setIsSpeaking(Math.random() > 0.65);
    }, 2800);
    return () => clearInterval(interval);
  }, [micActive]);

  // Scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatOpen]);

  // Keyboard Shortcuts Listener (M, P, S, F, ?)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      switch (e.key.toLowerCase()) {
        case "m":
          e.preventDefault();
          setMicActive((prev) => {
            const next = !prev;
            addToast(next ? "Micrófono activado" : "Micrófono silenciado", "info");
            return next;
          });
          break;
        case "s":
          e.preventDefault();
          setShowStats((prev) => !prev);
          break;
        case "f":
          e.preventDefault();
          toggleFullScreen();
          break;
        case "?":
          e.preventDefault();
          setShowShortcutsModal((prev) => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const extractYouTubeId = (input: string): string => {
    const trimmed = input.trim();
    if (trimmed.includes("v=")) return trimmed.split("v=")[1].split("&")[0];
    if (trimmed.includes("youtu.be/")) return trimmed.split("youtu.be/")[1].split("?")[0];
    if (trimmed.includes("youtube.com/live/")) return trimmed.split("youtube.com/live/")[1].split("?")[0];
    return trimmed;
  };

  const handleApplyStream = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!streamInput.trim()) return;

    if (platform === "twitch") {
      const clean = streamInput
        .replace("https://www.twitch.tv/", "")
        .replace("https://twitch.tv/", "")
        .replace("@", "")
        .trim();
      setActiveStream(clean);
      addToast(`Canal de Twitch cargado: ${clean}`, "success");
    } else {
      const id = extractYouTubeId(streamInput);
      setActiveStream(id);
      addToast("Vídeo de YouTube sincronizado", "success");
    }
    setStreamInput("");
  };

  const handleSelectPreset = (preset: SuggestionItem) => {
    setPlatform(preset.platform);
    const target = preset.platform === "twitch" ? preset.name : (preset.id || preset.name);
    setActiveStream(target);
    addToast(`Cargado ${preset.name} (${preset.platform})`, "success");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: user?.name || "Invitado",
        text: inputMessage.trim(),
        time: timeStr,
        isHost: true,
      },
    ]);
    setInputMessage("");
  };

  const handleToggleHandRaise = () => {
    const nextState = !handRaised;
    setHandRaised(nextState);
    if (nextState) {
      const entry = { id: user?.id || "guest", name: user?.name || "Tú" };
      setTurnQueue((prev) => [...prev, entry]);
      addToast("Has pedido turno para hablar. Tu turno está en la cola.", "info");
    } else {
      setTurnQueue((prev) => prev.filter((p) => p.id !== (user?.id || "guest")));
      addToast("Has bajado la mano", "info");
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      addToast("Enlace de la Watch Party copiado al portapapeles", "success");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#08090D] text-[#F8FAFC] overflow-hidden font-sans select-none">
      {/* Top Room Navigation Bar */}
      <header className="h-14 border-b border-white/[0.08] bg-[#090B10]/95 backdrop-blur-xl px-4 flex items-center justify-between gap-3 z-40 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-white hover:opacity-80 transition group cursor-pointer"
          >
            <div className="h-8 w-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all">
              <Gamepad2 className="h-4 w-4" />
            </div>
            <span className="text-sm font-black tracking-tight hidden sm:inline">
              Stream<span className="text-purple-400">Sync</span>
            </span>
          </Link>

          <div className="h-4 w-[1px] bg-white/[0.1] mx-1 hidden sm:block" />

          {/* Room Name Badge */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/5 border border-white/10 text-gray-200">
              Sala #{roomId}
            </span>
            <span className="hidden md:flex items-center gap-1 text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sincronizado 0ms</span>
            </span>
          </div>
        </div>

        {/* Center Stream Changer */}
        <form onSubmit={handleApplyStream} className="hidden md:flex items-center gap-2 max-w-sm w-full mx-2">
          <div className="flex items-center bg-black/50 border border-white/10 rounded-xl px-2 py-1 w-full focus-within:border-purple-500 transition">
            <button
              type="button"
              onClick={() => setPlatform(platform === "twitch" ? "youtube" : "twitch")}
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 transition ${
                platform === "twitch"
                  ? "bg-[#9146FF] text-white"
                  : "bg-[#FF0000] text-white"
              }`}
            >
              {platform === "twitch" ? <Radio className="w-3 h-3" /> : <Tv className="w-3 h-3" />}
              <span>{platform}</span>
            </button>
            <input
              type="text"
              placeholder={
                platform === "twitch"
                  ? "Canal de Twitch (ej. valorant)..."
                  : "ID o URL de YouTube..."
              }
              value={streamInput}
              onChange={(e) => setStreamInput(e.target.value)}
              className="bg-transparent border-none text-xs text-white placeholder-gray-500 focus:outline-none px-2 w-full"
            />
          </div>
        </form>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2">
          {/* Game Stats HUD Toggle */}
          <button
            onClick={() => setShowStats(!showStats)}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              showStats
                ? "bg-purple-600/20 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-500/20"
                : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
            }`}
            title="Alternar HUD de Estadísticas (Tecla S)"
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span className="hidden lg:inline text-[11px]">HUD Stats</span>
          </button>

          {/* Waiting Screen Return Button */}
          {activeStream && (
            <button
              onClick={() => setActiveStream(null)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition cursor-pointer"
              title="Volver a la pantalla de espera interactiva"
            >
              <RadioTower className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[11px]">Espera</span>
            </button>
          )}

          {/* Keyboard Shortcuts Guide */}
          <button
            onClick={() => setShowShortcutsModal(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition cursor-pointer"
            title="Atajos de teclado (Tecla ?)"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Share / Invite Link */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-purple-400" />}
            <span className="hidden sm:inline">{copied ? "Copiado" : "Invitar"}</span>
          </button>

          {/* Leave Button */}
          <button
            onClick={() => setShowLeaveModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* Main Room Body */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 w-full overflow-hidden">
        {/* Stream Player Area */}
        <main className="flex-1 bg-black relative flex items-center justify-center min-h-0 overflow-hidden">
          {activeStream ? (
            <div className="w-full h-full relative">
              {platform === "twitch" ? (
                <TwitchPlayer channel={activeStream} />
              ) : (
                <YouTubePlayer videoId={activeStream} />
              )}

              {/* Floating Game Stats Overlay Component */}
              {showStats && (
                <div className="absolute top-4 left-4 z-30 pointer-events-auto">
                  <GameStatsOverlay
                    gameTitle="VALORANT Champions Tour 2026"
                    score={88}
                    genre="Tactical FPS / Competitivo"
                    developer="Riot Games"
                    releaseDate="2020"
                    coverImage="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&auto=format&fit=crop&q=80"
                    onClose={() => setShowStats(false)}
                  />
                </div>
              )}

              {/* WebRTC Voice Chat HUD Overlay */}
              <div className="absolute bottom-4 left-4 z-30 flex items-center gap-3 bg-[#090B10]/90 backdrop-blur-xl border border-white/10 p-2.5 rounded-2xl shadow-2xl">
                {/* User Avatar with Speaking Pulse */}
                <div className="relative">
                  <div
                    className={`w-9 h-9 rounded-xl overflow-hidden bg-purple-600/30 flex items-center justify-center border-2 transition-all ${
                      isSpeaking ? "border-emerald-400 scale-105" : "border-white/10"
                    }`}
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-xs text-white">
                        {user?.name ? user.name.slice(0, 2).toUpperCase() : "ME"}
                      </span>
                    )}
                  </div>
                  {isSpeaking && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </div>

                {/* Animated Voice Wave Visualizer */}
                <div className="flex items-center gap-1 h-6 px-1">
                  {[40, 75, 20, 90, 50].map((h, i) => (
                    <span
                      key={i}
                      className={`w-1 rounded-full transition-all duration-150 ${
                        isSpeaking
                          ? "bg-emerald-400 animate-[wave-pulse_1s_ease-in-out_infinite]"
                          : "bg-white/20"
                      }`}
                      style={{
                        height: isSpeaking ? `${h}%` : "20%",
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </div>

                {/* Status info */}
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    {isSpeaking ? (
                      <span className="text-emerald-400">Transmitiendo voz...</span>
                    ) : micActive ? (
                      <span>{user?.name || "Invitado"}</span>
                    ) : (
                      <span className="text-red-400">Silenciado</span>
                    )}
                  </span>
                  <span className="text-[10px] text-gray-400">Canal HD WebRTC</span>
                </div>

                {/* Voice Controls: Mute, Deafen, Hand-Raise */}
                <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
                  <button
                    onClick={() => setMicActive(!micActive)}
                    className={`p-2 rounded-xl border transition cursor-pointer ${
                      micActive
                        ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                        : "bg-red-500/20 border-red-500/40 text-red-400"
                    }`}
                    title={micActive ? "Silenciar micrófono (Tecla M)" : "Activar micrófono (Tecla M)"}
                  >
                    {micActive ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-red-400" />}
                  </button>

                  <button
                    onClick={() => setDeafened(!deafened)}
                    className={`p-2 rounded-xl border transition cursor-pointer ${
                      deafened
                        ? "bg-red-500/20 border-red-500/40 text-red-400"
                        : "bg-white/5 border-white/10 text-gray-300 hover:text-white"
                    }`}
                    title="Ensordecer audio de la sala"
                  >
                    {deafened ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  {/* Turn-to-speak Hand Raise Button */}
                  <button
                    onClick={handleToggleHandRaise}
                    className={`p-2 rounded-xl border transition cursor-pointer flex items-center gap-1 ${
                      handRaised
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-md shadow-amber-500/20"
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-amber-300"
                    }`}
                    title="Pedir turno para hablar"
                  >
                    <Hand className={`w-4 h-4 ${handRaised ? "animate-bounce" : ""}`} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Interactive Waiting Screen */
            <div className="flex flex-col items-center justify-center p-6 text-center max-w-xl w-full mx-auto my-auto animate-in fade-in duration-300">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono mb-5 text-gray-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                <span className="tracking-wider uppercase font-semibold text-gray-200">
                  Pantalla de Espera
                </span>
                <span className="text-white/20">•</span>
                <span className="text-emerald-400 font-bold">Sincronización Lista (0ms)</span>
              </div>

              <div className="relative mb-5">
                <div className="h-20 w-20 rounded-3xl bg-gradient-to-b from-purple-600/30 to-purple-900/10 border border-purple-500/30 shadow-2xl flex items-center justify-center text-purple-300 backdrop-blur-xl">
                  <RadioTower className="h-10 w-10 animate-pulse" />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-black" />
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                Esperando retransmisión
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 max-w-md leading-relaxed mb-6">
                Elige un canal o escribe cualquier URL para comenzar la reproducción sincronizada al milisegundo para todos en la sala.
              </p>

              {/* In-Waiting Stream Launcher Box */}
              <div className="w-full bg-[#0D0F17] border border-white/10 rounded-2xl p-4 mb-5 text-left shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-300">Empezar a transmitir:</span>
                  <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10 text-xs">
                    <button
                      type="button"
                      onClick={() => setPlatform("twitch")}
                      className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                        platform === "twitch" ? "bg-[#9146FF] text-white" : "text-gray-400"
                      }`}
                    >
                      Twitch
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlatform("youtube")}
                      className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                        platform === "youtube" ? "bg-[#FF0000] text-white" : "text-gray-400"
                      }`}
                    >
                      YouTube
                    </button>
                  </div>
                </div>

                <form onSubmit={handleApplyStream} className="flex gap-2">
                  <input
                    type="text"
                    placeholder={
                      platform === "twitch"
                        ? "Nombre de canal de Twitch..."
                        : "ID o enlace del vídeo..."
                    }
                    value={streamInput}
                    onChange={(e) => setStreamInput(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    className="liquid-btn-primary px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cargar
                  </button>
                </form>
              </div>

              {/* Quick suggestions presets */}
              <div className="w-full">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Canales recomendados
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {QUICK_STREAM_PRESETS.slice(0, 6).map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectPreset(preset)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-purple-600/20 text-xs font-medium text-gray-300 hover:text-purple-300 border border-white/5 hover:border-purple-500/30 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar: Chat & Voice Queue */}
        <aside className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-white/10 bg-[#090B10] flex flex-col h-72 lg:h-auto shrink-0">
          {/* Sidebar Tabs */}
          <div className="flex items-center border-b border-white/10 p-2 gap-1 bg-[#090B10]">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "chat"
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span>Chat en Vivo</span>
            </button>

            <button
              onClick={() => setActiveTab("participants")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "participants"
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>Miembros ({participants.length})</span>
            </button>
          </div>

          {/* Turn Queue Alert if any hands are raised */}
          {turnQueue.length > 0 && (
            <div className="p-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs text-amber-300">
              <div className="flex items-center gap-1.5 truncate">
                <Hand className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-bold">Turno de palabra:</span>
                <span className="truncate">{turnQueue[0].name}</span>
              </div>
              <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded font-mono font-bold">
                {turnQueue.length} en cola
              </span>
            </div>
          )}

          {/* Tab 1: Chat Feed */}
          {activeTab === "chat" && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`text-xs space-y-1 ${
                      msg.isSystem ? "p-2 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-300" : ""
                    }`}
                  >
                    {!msg.isSystem && (
                      <div className="flex items-center gap-1.5">
                        {msg.isHost && <Crown className="w-3 h-3 text-yellow-400" />}
                        <span className="font-bold text-gray-300">{msg.sender}</span>
                        <span className="text-[10px] text-gray-500 font-mono">{msg.time}</span>
                      </div>
                    )}
                    <p className={msg.isSystem ? "font-medium" : "text-gray-200"}>{msg.text}</p>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-[#0c1017]">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Escribe un mensaje en la sala..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Tab 2: Participants List */}
          {activeTab === "participants" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                En esta sala
              </span>
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] border border-white/5"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-bold text-xs text-white">
                        {p.avatar ? (
                          <img src={p.avatar} alt={p.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          p.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      {p.speaking && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{p.name}</span>
                        {p.isHost && <Crown className="w-3 h-3 text-yellow-400" />}
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {p.speaking ? "Hablando..." : p.micActive ? "En línea" : "Silenciado"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {p.handRaised && (
                      <span className="p-1 rounded-lg bg-amber-500/20 text-amber-300" title="Mano levantada">
                        <Hand className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {p.micActive ? (
                      <Mic className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <MicOff className="w-3.5 h-3.5 text-red-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0D0F17] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Atajos de Teclado StreamSync</h3>
              </div>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                <span className="text-gray-300">Silenciar / Activar micrófono</span>
                <kbd className="px-2 py-1 rounded bg-white/10 font-mono font-bold text-purple-300 border border-white/15">
                  M
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                <span className="text-gray-300">Mostrar / Ocultar HUD de Juego</span>
                <kbd className="px-2 py-1 rounded bg-white/10 font-mono font-bold text-purple-300 border border-white/15">
                  S
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                <span className="text-gray-300">Pantalla completa</span>
                <kbd className="px-2 py-1 rounded bg-white/10 font-mono font-bold text-purple-300 border border-white/15">
                  F
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                <span className="text-gray-300">Abrir esta guía de atajos</span>
                <kbd className="px-2 py-1 rounded bg-white/10 font-mono font-bold text-purple-300 border border-white/15">
                  ?
                </kbd>
              </div>
            </div>

            <button
              onClick={() => setShowShortcutsModal(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Leave Confirmation Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0D0F17] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4 text-center animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white mb-1">¿Salir de la Watch Party?</h3>
              <p className="text-xs text-gray-400">
                Se desconectará tu canal de voz y saldrás de la sincronización de la sala #{roomId}.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowLeaveModal(false)}
                className="py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition cursor-pointer"
              >
                Permanecer
              </button>
              <button
                onClick={() => {
                  setShowLeaveModal(false);
                  router.push("/dashboard");
                }}
                className="py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition shadow-lg shadow-red-600/30 cursor-pointer"
              >
                Salir ahora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WatchPartyRoomPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08090D] flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <WatchPartyRoomContent />
    </Suspense>
  );
}
