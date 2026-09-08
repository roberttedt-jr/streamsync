"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import TwitchPlayer from "@/components/video/TwitchPlayer";
import YouTubePlayer from "@/components/video/YouTubePlayer";
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
  Hand,
  Keyboard,
  LogOut,
  Sparkles,
  Crown,
  X,
  Play,
  Info,
  Layers,
  Compass,
} from "lucide-react";

interface RoomData {
  id?: string;
  code: string;
  name: string;
  platform: "twitch" | "youtube";
  channel: string;
  category?: string;
  description?: string;
  isPrivate?: boolean;
  maxParticipants?: number;
  isDemo?: boolean;
}

export default function WatchPartyRoomPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params?.id ? String(params.id) : "demo";
  const isDemo = roomId.toLowerCase() === "demo";

  const { user } = useAuth();
  const { addToast } = useToast();

  const initialPlatform = (searchParams?.get("platform") as "twitch" | "youtube") || "twitch";
  const initialStream = searchParams?.get("stream") || null;

  const [roomData, setRoomData] = useState<RoomData | null>(
    isDemo
      ? {
          code: "demo",
          name: "Sala de demostración",
          platform: initialPlatform,
          channel: initialStream || "",
          category: "Entretenimiento en directo",
          description: "Vista previa interactiva de StreamSync",
          isDemo: true,
        }
      : null
  );

  const [platform, setPlatform] = useState<"twitch" | "youtube">(initialPlatform);
  const [activeStream, setActiveStream] = useState<string | null>(initialStream);
  const [streamInput, setStreamInput] = useState("");
  const [copied, setCopied] = useState(false);

  // Audio / Voice Chat state
  const [micActive, setMicActive] = useState(false);
  const [deafened, setDeafened] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [turnQueue, setTurnQueue] = useState<{ id: string; name: string }[]>([]);

  // Modals & Panels
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "participants">("chat");

  // Chat
  const [messages, setMessages] = useState<
    { id: number; sender: string; text: string; time: string; isHost?: boolean }[]
  >([]);
  const [inputMessage, setInputMessage] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Fetch real room data if not demo
  useEffect(() => {
    if (isDemo) {
      setRoomData({
        code: "demo",
        name: "Sala de demostración",
        platform: initialPlatform,
        channel: initialStream || "",
        category: "Entretenimiento en directo",
        description: "Vista previa interactiva de StreamSync",
        isDemo: true,
      });
      return;
    }

    const fetchRoom = async () => {
      try {
        const res = await fetch(`/api/rooms?code=${encodeURIComponent(roomId)}`);
        const data = await res.json();
        if (data.room) {
          setRoomData(data.room);
          if (data.room.platform) setPlatform(data.room.platform);
          if (data.room.channel && !activeStream) {
            setActiveStream(data.room.channel);
          }
        } else {
          // If room not in DB, setup minimal room info
          setRoomData({
            code: roomId,
            name: `Sala #${roomId}`,
            platform: initialPlatform,
            channel: initialStream || "",
            category: "Entretenimiento",
          });
        }
      } catch {
        setRoomData({
          code: roomId,
          name: `Sala #${roomId}`,
          platform: initialPlatform,
          channel: initialStream || "",
          category: "Entretenimiento",
        });
      }
    };

    fetchRoom();
  }, [roomId, isDemo, initialPlatform]);

  // Real participants only (no fake bots)
  const participants = useMemo(() => {
    if (!user) {
      return [];
    }
    return [
      {
        id: user.id || "local-user",
        name: user.name || "Tú",
        avatar: user.avatar,
        isHost: true,
        micActive: micActive,
        handRaised: handRaised,
      },
    ];
  }, [user, micActive, handRaised]);

  // Scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeTab]);

  // Keyboard Shortcuts (M, F, ?)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      addToast("Vídeo de YouTube cargado", "success");
    }
    setStreamInput("");
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
      addToast("Has pedido turno para hablar.", "info");
    } else {
      setTurnQueue((prev) => prev.filter((p) => p.id !== (user?.id || "guest")));
      addToast("Has bajado la mano", "info");
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      addToast("Enlace de la sala copiado al portapapeles", "success");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#08090D] text-[#F8FAFC] overflow-hidden font-sans select-none">
      {/* Top Header Bar */}
      <header className="h-14 border-b border-white/[0.08] bg-[#090B10]/95 backdrop-blur-xl px-4 flex items-center justify-between gap-3 z-40 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-white hover:opacity-80 transition group cursor-pointer"
          >
            <div className="h-8 w-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all">
              <Tv className="h-4 w-4" />
            </div>
            <span className="text-sm font-black tracking-tight hidden sm:inline">
              Stream<span className="text-purple-400">Sync</span>
            </span>
          </Link>

          <div className="h-4 w-[1px] bg-white/[0.1] mx-1 hidden sm:block" />

          {/* Room Badge */}
          <div className="flex items-center gap-2">
            {isDemo ? (
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-600/20 border border-purple-500/30 text-purple-300">
                Sala de demostración • Vista previa
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/5 border border-white/10 text-gray-200">
                {roomData?.name || `Sala #${roomId}`}
              </span>
            )}

            <span className="hidden md:flex items-center gap-1 text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>0ms Latencia</span>
            </span>
          </div>
        </div>

        {/* Change Stream Input */}
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
                  ? "Pega enlace o canal de Twitch..."
                  : "Pega enlace o ID de YouTube..."
              }
              value={streamInput}
              onChange={(e) => setStreamInput(e.target.value)}
              className="bg-transparent border-none text-xs text-white placeholder-gray-500 focus:outline-none px-2 w-full"
            />
          </div>
        </form>

        {/* Right Tools */}
        <div className="flex items-center gap-2">
          {/* Shortcuts Modal Toggle */}
          <button
            onClick={() => setShowShortcutsModal(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition cursor-pointer"
            title="Atajos de teclado (Tecla ?)"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Share Link */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-purple-400" />}
            <span className="hidden sm:inline">{copied ? "Copiado" : "Compartir"}</span>
          </button>

          {/* Leave / Back */}
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

              {/* WebRTC Voice Chat HUD Overlay */}
              <div className="absolute bottom-4 left-4 z-30 flex items-center gap-3 bg-[#090B10]/90 backdrop-blur-xl border border-white/10 p-2.5 rounded-2xl shadow-2xl">
                <div className="relative">
                  <div
                    className={`w-9 h-9 rounded-xl overflow-hidden bg-purple-600/30 flex items-center justify-center border-2 transition-all ${
                      micActive ? "border-emerald-400" : "border-white/10"
                    }`}
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-xs text-white">
                        {user?.name ? user.name.slice(0, 2).toUpperCase() : "TÚ"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    {micActive ? (
                      <span className="text-emerald-400">Micrófono activo</span>
                    ) : (
                      <span className="text-red-400">Silenciado</span>
                    )}
                  </span>
                  <span className="text-[10px] text-gray-400">Audio WebRTC</span>
                </div>

                {/* Voice Controls */}
                <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
                  <button
                    onClick={() => setMicActive(!micActive)}
                    className={`p-2 rounded-xl border transition cursor-pointer ${
                      micActive
                        ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                        : "bg-red-500/20 border-red-500/40 text-red-400"
                    }`}
                    title={micActive ? "Silenciar micrófono (M)" : "Activar micrófono (M)"}
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

                  <button
                    onClick={handleToggleHandRaise}
                    className={`p-2 rounded-xl border transition cursor-pointer flex items-center gap-1 ${
                      handRaised
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
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
            /* Professional Empty State: "Añadir stream para comenzar" */
            <div className="flex flex-col items-center justify-center p-6 text-center max-w-lg w-full mx-auto my-auto animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-3xl bg-purple-600/20 border border-purple-500/30 shadow-2xl flex items-center justify-center text-purple-300 mb-4 backdrop-blur-xl">
                <Tv className="h-8 w-8" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                Añadir stream para comenzar
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 max-w-md leading-relaxed mb-6">
                Pega el enlace de cualquier directo o vídeo de Twitch o YouTube para probarlo y sincronizarlo al instante.
              </p>

              {/* Stream Input Form */}
              <div className="w-full bg-[#0D0F17] border border-white/10 rounded-2xl p-4 text-left shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-300">Plataforma:</span>
                  <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10 text-xs">
                    <button
                      type="button"
                      onClick={() => setPlatform("twitch")}
                      className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                        platform === "twitch" ? "bg-[#9146FF] text-white" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Twitch
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlatform("youtube")}
                      className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                        platform === "youtube" ? "bg-[#FF0000] text-white" : "text-gray-400 hover:text-white"
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
                        ? "Pega URL de Twitch o nombre de canal..."
                        : "Pega URL de YouTube o ID de vídeo..."
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

              {/* Room details */}
              <div className="mt-6 text-xs text-gray-500 space-y-1">
                <div>
                  Categoría: <strong className="text-gray-300">{roomData?.category || "Entretenimiento en directo"}</strong>
                </div>
                {roomData?.description && (
                  <p className="text-gray-400 italic">"{roomData.description}"</p>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar: Chat & Participants */}
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
              <span>Participantes ({participants.length})</span>
            </button>
          </div>

          {/* Turn Queue Notification */}
          {turnQueue.length > 0 && (
            <div className="p-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs text-amber-300">
              <div className="flex items-center gap-1.5 truncate">
                <Hand className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-bold">Turno pedido:</span>
                <span className="truncate">{turnQueue[0].name}</span>
              </div>
            </div>
          )}

          {/* Tab 1: Chat Feed */}
          {activeTab === "chat" && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  /* Required empty state for chat */
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-500">
                    <p className="text-xs leading-relaxed max-w-xs">
                      El chat se activará cuando se unan participantes a una sala real.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="text-xs space-y-1">
                      <div className="flex items-center gap-1.5">
                        {msg.isHost && <Crown className="w-3 h-3 text-yellow-400" />}
                        <span className="font-bold text-gray-300">{msg.sender}</span>
                        <span className="text-[10px] text-gray-500 font-mono">{msg.time}</span>
                      </div>
                      <p className="text-gray-200">{msg.text}</p>
                    </div>
                  ))
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-[#0c1017]">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Escribe un mensaje..."
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
              {participants.length === 0 ? (
                /* Required empty state for participants */
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-500">
                  <Users className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-xs">Todavía no hay participantes.</p>
                </div>
              ) : (
                participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] border border-white/5"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-bold text-xs text-white">
                        {p.avatar ? (
                          <img src={p.avatar} alt={p.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          p.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{p.name}</span>
                          {p.isHost && <Crown className="w-3 h-3 text-yellow-400" />}
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {p.micActive ? "Micrófono activo" : "Silenciado"}
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
                ))
              )}
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
              className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Leave Room Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0D0F17] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-white">¿Deseas salir de la sala?</h3>
            <p className="text-xs text-gray-400">
              Desconectarás el chat de voz y la sincronización de vídeo en tiempo real.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowLeaveModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white transition cursor-pointer"
              >
                Permanecer
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition cursor-pointer"
              >
                Salir al Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
