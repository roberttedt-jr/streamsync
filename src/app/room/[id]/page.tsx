"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import TwitchPlayer, { parseTwitchTarget } from "@/components/video/TwitchPlayer";
import MediaPermissionModal from "@/components/room/MediaPermissionModal";
import VideoGrid from "@/components/room/VideoGrid";
import HostOptionsModal from "@/components/room/HostOptionsModal";
import { WebRTCManager } from "@/lib/webrtc";
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
  Video,
  VideoOff,
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
  ChevronDown,
  ChevronUp,
  Settings,
  PhoneOff,
  MessageSquare,
  Phone,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";


interface RoomData {
  id?: string;
  code: string;
  name: string;
  platform: "twitch";
  channel: string;
  category?: string;
  description?: string;
  isPrivate?: boolean;
  maxParticipants?: number;
  communicationMode?: "CHAT_ONLY" | "VOICE" | "VIDEO" | "FLEXIBLE";
  allowVoice?: boolean;
  allowVideo?: boolean;
  isClosed?: boolean;
  hostId?: string | null;
  host?: { id: string; name?: string | null; image?: string | null; username?: string | null } | null;
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

  const initialPlatform = "twitch";
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
          communicationMode: "FLEXIBLE",
          allowVoice: true,
          allowVideo: true,
          isDemo: true,
        }
      : null
  );

  const [platform, setPlatform] = useState<"twitch">("twitch");
  const [activeStream, setActiveStream] = useState<string | null>(initialStream);
  const [streamInput, setStreamInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [mobileTab, setMobileTab] = useState<"chat" | "stream" | "participants" | "call">("chat");

  // Tab-unique connectionId for multi-user presence
  const [connectionId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      let id = sessionStorage.getItem("streamsync_conn_id");
      if (!id) {
        id = "conn_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now().toString(36);
        sessionStorage.setItem("streamsync_conn_id", id);
      }
      return id;
    }
    return "conn_init";
  });

  // Synced remote participants
  const [syncedParticipants, setSyncedParticipants] = useState<any[]>([]);

  // Communication & Media WebRTC state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [micActive, setMicActive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [deafened, setDeafened] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [turnQueue, setTurnQueue] = useState<{ id: string; name: string }[]>([]);
  const [isAudioDockMinimized, setIsAudioDockMinimized] = useState(false);

  // WebRTC Manager & Remote Streams
  const webrtcManagerRef = useRef<WebRTCManager | null>(null);
  const pendingSignalsRef = useRef<any[]>([]);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());

  // Initialize WebRTCManager
  useEffect(() => {
    if (isDemo || !connectionId) return;

    const manager = new WebRTCManager({
      connectionId,
      onRemoteStream: (remoteId, stream) => {
        setRemoteStreams((prev) => {
          const next = new Map(prev);
          next.set(remoteId, stream);
          return next;
        });
      },
      onRemoteStreamRemoved: (remoteId) => {
        setRemoteStreams((prev) => {
          const next = new Map(prev);
          next.delete(remoteId);
          return next;
        });
      },
      sendSignal: (signal) => {
        pendingSignalsRef.current.push({
          targetConnectionId: signal.targetConnectionId,
          type: signal.type,
          payload: signal.payload,
        });
      },
    });

    webrtcManagerRef.current = manager;

    return () => {
      manager.destroy();
      webrtcManagerRef.current = null;
    };
  }, [connectionId, isDemo]);

  // Opt-in Media Permission Modal
  const [requestedMediaType, setRequestedMediaType] = useState<"voice" | "video" | null>(null);

  // Modals & Panels
  const [showHostOptionsModal, setShowHostOptionsModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isRoomClosedByHost, setIsRoomClosedByHost] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "participants">("chat");

  // Chat
  const [messages, setMessages] = useState<
    { id: string | number; sender: string; text: string; time: string; isHost?: boolean | null; avatar?: string | null }[]
  >([]);
  const [inputMessage, setInputMessage] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Audio Context for speaking detector
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Fetch real room data
  const fetchRoom = useCallback(async () => {
    if (isDemo) return;

    try {
      const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}`);
      const data = await res.json();

      if (res.status === 410 || data.isClosed) {
        setIsRoomClosedByHost(true);
        if (localStream) {
          localStream.getTracks().forEach((t) => t.stop());
        }
        return;
      }

      if (data.room) {
        setRoomData(data.room);
        if (data.room.platform) setPlatform(data.room.platform);
        if (data.room.channel && data.room.channel !== activeStream) {
          setActiveStream(data.room.channel);
        }
      } else {
        // Fallback room data
        setRoomData((prev) =>
          prev || {
            code: roomId,
            name: `Sala #${roomId}`,
            platform: initialPlatform,
            channel: initialStream || "",
            category: "Entretenimiento",
            communicationMode: "FLEXIBLE",
            allowVoice: true,
            allowVideo: true,
          }
        );
      }
    } catch {
      setRoomData((prev) =>
        prev || {
          code: roomId,
          name: `Sala #${roomId}`,
          platform: initialPlatform,
          channel: initialStream || "",
          category: "Entretenimiento",
          communicationMode: "FLEXIBLE",
          allowVoice: true,
          allowVideo: true,
        }
      );
    }
  }, [roomId, isDemo, initialPlatform, activeStream, localStream]);

  useEffect(() => {
    fetchRoom();
    // Poll every 12 seconds to ensure synchronized room closure / metadata
    const interval = setInterval(fetchRoom, 12000);
    return () => clearInterval(interval);
  }, [fetchRoom]);

  // Speaking level indicator via Web Audio API
  useEffect(() => {
    if (!localStream || !micActive) {
      setIsSpeaking(false);
      return;
    }

    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length === 0 || !audioTracks[0].enabled) {
      setIsSpeaking(false);
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      const source = ctx.createMediaStreamSource(localStream);
      source.connect(analyser);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setIsSpeaking(avg > 15);
        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      animFrameRef.current = requestAnimationFrame(checkVolume);
    } catch (e) {
      console.warn("AudioContext init warning:", e);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [localStream, micActive]);

  // Clean up all media tracks when component unmounts
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [localStream]);

  // Host verification
  const [isSessionCreator, setIsSessionCreator] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && roomId) {
      if (
        sessionStorage.getItem("streamsync_created_room_" + roomId) === "true" ||
        (roomData && sessionStorage.getItem("streamsync_created_room_" + roomData.code) === "true")
      ) {
        setIsSessionCreator(true);
      }
    }
  }, [roomId, roomData]);

  const isHost = useMemo(() => {
    if (isDemo) return true;
    if (isSessionCreator) return true;
    if (!user || !roomData) return false;
    return (
      roomData.hostId === user.id ||
      (roomData.host && (roomData.host as any).id === user.id)
    );
  }, [isDemo, isSessionCreator, user, roomData]);

  // Communication mode flags
  const commMode = roomData?.communicationMode || "FLEXIBLE";
  const allowsVoice = commMode !== "CHAT_ONLY";
  const allowsVideo = commMode === "VIDEO" || commMode === "FLEXIBLE";

  // Opt-in Media Permission Handlers
  const handleToggleMic = () => {
    if (!allowsVoice) {
      if (typeof addToast === "function") {
        addToast("Esta sala está configurada en modo 'Solo Chat'.", "info");
      }
      return;
    }

    // If stream not yet acquired: trigger opt-in modal!
    if (!localStream || localStream.getAudioTracks().length === 0) {
      setRequestedMediaType("voice");
      return;
    }

    // Toggle track enabled
    const audioTrack = localStream.getAudioTracks()[0];
    const nextState = !micActive;
    audioTrack.enabled = nextState;
    setMicActive(nextState);
    if (typeof addToast === "function") {
      addToast(nextState ? "Micrófono activado" : "Micrófono silenciado", "info");
    }
  };

  const handleToggleCamera = () => {
    if (!allowsVideo) {
      if (typeof addToast === "function") {
        addToast("Esta sala no tiene habilitada la cámara de vídeo.", "info");
      }
      return;
    }

    // If video track not yet acquired: trigger opt-in modal!
    if (!localStream || localStream.getVideoTracks().length === 0) {
      setRequestedMediaType("video");
      return;
    }

    const videoTrack = localStream.getVideoTracks()[0];
    const nextState = !cameraActive;
    videoTrack.enabled = nextState;
    setCameraActive(nextState);
    if (typeof addToast === "function") {
      addToast(nextState ? "Cámara encendida" : "Cámara apagada", "info");
    }
  };

  const handlePermissionGranted = (stream: MediaStream, type: "voice" | "video") => {
    setLocalStream(stream);
    webrtcManagerRef.current?.setLocalStream(stream);
    setMicActive(stream.getAudioTracks().length > 0);
    if (type === "video") {
      setCameraActive(stream.getVideoTracks().length > 0);
    }
    if (typeof addToast === "function") {
      addToast(
        type === "video" ? "Cámara y micrófono conectados" : "Micrófono conectado con éxito",
        "success"
      );
    }
  };

  const handleLeaveVoice = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    webrtcManagerRef.current?.setLocalStream(null);
    setMicActive(false);
    setCameraActive(false);
    setIsSpeaking(false);
    if (typeof addToast === "function") {
      addToast("Has salido de la llamada de voz/vídeo", "info");
    }
  };

  // Sincronización periódica y latido de presencia multiusuario con el servidor
  const syncRoom = useCallback(async () => {
    if (!roomId) return;
    try {
      const outgoingSignals = [...pendingSignalsRef.current];
      pendingSignalsRef.current = [];

      const payload = {
        action: "sync",
        connectionId,
        userId: user?.id || null,
        name: user?.name || (isHost ? "Anfitrión" : `Invitado ${connectionId.slice(-4)}`),
        avatar: user?.avatar || null,
        isHost,
        role: isHost ? "HOST" : "MEMBER",
        isMuted: !micActive,
        cameraEnabled: cameraActive,
        isSpeaking,
        handRaised,
        signals: outgoingSignals,
      };

      const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 410) {
        setIsRoomClosedByHost(true);
        if (localStream) {
          localStream.getTracks().forEach((t) => t.stop());
        }
        return;
      }

      if (res.ok) {
        const data = await res.json();
        if (data.isClosed) {
          setIsRoomClosedByHost(true);
          if (localStream) {
            localStream.getTracks().forEach((t) => t.stop());
          }
          return;
        }

        if (data.participants && Array.isArray(data.participants)) {
          setSyncedParticipants(data.participants);
          webrtcManagerRef.current?.syncPeers(data.participants.map((p: any) => p.connectionId));
        }

        if (data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }

        if (data.signals && Array.isArray(data.signals) && webrtcManagerRef.current) {
          for (const sig of data.signals) {
            webrtcManagerRef.current.handleSignal(sig);
          }
        }
      }
    } catch (err) {
      console.warn("Heartbeat sync warning:", err);
    }
  }, [roomId, connectionId, user, isHost, micActive, cameraActive, isSpeaking, handRaised, localStream]);

  // Loop cada 2.5s para presencia real entre sesiones
  useEffect(() => {
    syncRoom();
    const interval = setInterval(syncRoom, 2500);
    return () => clearInterval(interval);
  }, [syncRoom]);

  // Notificar salida al cerrar pestaña / desmontar
  useEffect(() => {
    const handleUnload = () => {
      navigator.sendBeacon(
        `/api/rooms/${encodeURIComponent(roomId)}/sync`,
        JSON.stringify({ action: "leave", connectionId })
      );
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      fetch(`/api/rooms/${encodeURIComponent(roomId)}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "leave", connectionId }),
        keepalive: true,
      }).catch(() => {});
    };
  }, [roomId, connectionId]);

  // Lista de participantes combinada: sincronizada del servidor con stream local y remoto
  const participants = useMemo(() => {
    if (syncedParticipants.length > 0) {
      const mapped = syncedParticipants.map((p) => {
        if (p.connectionId === connectionId) {
          return {
            ...p,
            id: p.connectionId,
            name: user?.name ? `${user.name} (Tú)` : "Tú",
            avatar: user?.avatar || p.avatar,
            isHost: isHost,
            micActive: micActive,
            cameraActive: cameraActive,
            isSpeaking: isSpeaking,
            stream: localStream,
            handRaised: handRaised,
          };
        }
        return {
          ...p,
          id: p.connectionId,
          micActive: Boolean(p.micActive),
          cameraActive: Boolean(p.cameraActive),
          isSpeaking: Boolean(p.isSpeaking),
          handRaised: Boolean(p.handRaised),
          isHost: p.isHost || p.role === "HOST",
          stream: remoteStreams.get(p.connectionId) || null,
        };
      });

      // Asegurar que el usuario local siempre está incluido
      if (!mapped.some((p) => p.connectionId === connectionId)) {
        mapped.unshift({
          id: connectionId,
          connectionId,
          name: user?.name ? `${user.name} (Tú)` : "Tú",
          avatar: user?.avatar,
          isHost: isHost,
          micActive: micActive,
          cameraActive: cameraActive,
          isSpeaking: isSpeaking,
          stream: localStream,
          handRaised: handRaised,
        });
      }

      return mapped;
    }

    return [
      {
        id: connectionId,
        connectionId,
        name: user?.name ? `${user.name} (Tú)` : "Tú",
        avatar: user?.avatar,
        isHost: isHost,
        micActive: micActive,
        cameraActive: cameraActive,
        isSpeaking: isSpeaking,
        stream: localStream,
        handRaised: handRaised,
      },
    ];
  }, [
    syncedParticipants,
    connectionId,
    user,
    isHost,
    micActive,
    cameraActive,
    isSpeaking,
    localStream,
    handRaised,
    remoteStreams,
  ]);

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
          handleToggleMic();
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
  }, [localStream, micActive, allowsVoice]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleApplyStream = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!streamInput.trim()) return;

    const parsed = parseTwitchTarget(streamInput);
    const clean = parsed ? parsed.id : streamInput.trim();

    setActiveStream(clean);
    if (typeof addToast === "function") {
      addToast(`Canal de Twitch cargado: ${clean}`, "success");
    }

    // Sincronizar con backend si es anfitrión en sala real
    if (isHost && !isDemo && roomId) {
      fetch(`/api/rooms/${encodeURIComponent(roomId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: clean }),
      }).catch((err) => console.warn("[StreamSync] Error al sincronizar canal:", err));
    }

    setStreamInput("");
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const text = inputMessage.trim();
    const senderName = user?.name || (isHost ? "Anfitrión" : `Invitado ${connectionId.slice(-4)}`);
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Inserción optimista
    setMessages((prev) => [
      ...prev,
      {
        id: "local-" + Date.now(),
        sender: senderName,
        text,
        time: timeStr,
        isHost,
      },
    ]);
    setInputMessage("");

    try {
      const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_message",
          connectionId,
          userId: user?.id || null,
          sender: senderName,
          avatar: user?.avatar || null,
          text,
          isHost,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
        if (data.participants && Array.isArray(data.participants)) {
          setSyncedParticipants(data.participants);
        }
      }
    } catch (err) {
      console.error("Error sending message to sync route:", err);
    }
  };

  const handleToggleHandRaise = () => {
    const nextState = !handRaised;
    setHandRaised(nextState);
    if (nextState) {
      const entry = { id: user?.id || "guest", name: user?.name || "Tú" };
      setTurnQueue((prev) => [...prev, entry]);
      if (typeof addToast === "function") {
        addToast("Has pedido turno para hablar.", "info");
      }
    } else {
      setTurnQueue((prev) => prev.filter((p) => p.id !== (user?.id || "guest")));
      if (typeof addToast === "function") {
        addToast("Has bajado la mano", "info");
      }
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      if (typeof addToast === "function") {
        addToast("Enlace de la sala copiado al portapapeles", "success");
      }
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleLeaveRoom = () => {
    handleLeaveVoice();
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#08090D] text-[#F8FAFC] overflow-hidden font-sans select-none">
      {/* Top Header Bar with Safe-Top for Dynamic Island / Notch */}
      <header className="border-b border-white/[0.08] bg-[#090B10]/95 backdrop-blur-xl px-3 sm:px-4 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] flex items-center justify-between gap-2 sm:gap-3 z-40 shrink-0 min-h-[56px]">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            title="Volver al dashboard"
            aria-label="Volver al dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          {/* Room Title & Live status */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[140px] xs:max-w-[180px] sm:max-w-[240px]">
                {roomData?.name || `Sala #${roomId}`}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden xs:inline">En vivo</span>
              </span>
            </div>
            <span className="text-[10px] text-gray-400 truncate">
              {participants.length} {participants.length === 1 ? "participante" : "participantes"} • Twitch
            </span>
          </div>
        </div>

        {/* Change Stream Input (Desktop center) */}
        <form onSubmit={handleApplyStream} className="hidden md:flex items-center gap-2 max-w-sm w-full mx-2">
          <div className="flex items-center bg-black/50 border border-white/10 rounded-xl px-2 py-1 w-full focus-within:border-purple-500 transition">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 bg-[#9146FF] text-white">
              <Radio className="w-3 h-3" />
              <span>Twitch</span>
            </span>
            <input
              type="text"
              placeholder="Canal o enlace de Twitch (ej. ibai)..."
              value={streamInput}
              onChange={(e) => setStreamInput(e.target.value)}
              className="bg-transparent border-none text-xs text-white placeholder-gray-500 focus:outline-none px-2 w-full"
            />
          </div>
        </form>

        {/* Right Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Host Options Gear (Only for Room Host) */}
          {isHost && (
            <button
              onClick={() => setShowHostOptionsModal(true)}
              className="p-2.5 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 text-purple-300 hover:text-white border border-purple-500/30 transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Opciones y administración de la sala"
              aria-label="Ajustes de anfitrión"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {/* Shortcuts Modal Toggle (Desktop) */}
          <button
            onClick={() => setShowShortcutsModal(true)}
            className="hidden sm:flex p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition cursor-pointer min-h-[44px] min-w-[44px] items-center justify-center"
            title="Atajos de teclado (Tecla ?)"
            aria-label="Atajos de teclado"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Share Link */}
          <button
            onClick={handleCopyLink}
            className="p-2.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center gap-1.5"
            title="Copiar enlace de invitación"
            aria-label="Compartir sala"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-purple-400" />}
            <span className="hidden sm:inline">{copied ? "Copiado" : "Compartir"}</span>
          </button>

          {/* Leave / Back */}
          <button
            onClick={() => setShowLeaveModal(true)}
            className="p-2.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center gap-1.5"
            title="Salir de la sala"
            aria-label="Salir de la sala"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* Mobile Room Body (< lg) */}
      <div className="flex lg:hidden flex-1 min-h-0 flex-col w-full overflow-hidden bg-[#090B10]">
        {/* Mobile Twitch Player Area (16:9 strict, zero letterboxing) */}
        {activeStream ? (
          <div className="w-full shrink-0 aspect-video bg-black relative flex items-center justify-center overflow-hidden border-b border-white/10">
            <TwitchPlayer channel={activeStream} />
          </div>
        ) : (
          <div className="w-full shrink-0 aspect-video bg-[#0C0F17] flex flex-col items-center justify-center p-4 text-center border-b border-white/10">
            <Tv className="w-8 h-8 text-purple-400 mb-1.5" />
            <p className="text-xs font-bold text-white">Sin directo seleccionado</p>
            <button
              onClick={() => setMobileTab("stream")}
              className="mt-2 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-[11px] font-bold cursor-pointer"
            >
              Configurar Stream
            </button>
          </div>
        )}

        {/* Mobile Segmented Control Bar */}
        <div className="shrink-0 px-2 py-1.5 bg-[#0C0F17] border-b border-white/10 safe-x">
          <div className={`grid ${allowsVoice ? "grid-cols-4" : "grid-cols-3"} w-full bg-white/[0.04] p-1 rounded-xl gap-1`}>
            <button
              onClick={() => setMobileTab("chat")}
              className={`h-10 min-h-[40px] max-h-[40px] px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer select-none whitespace-nowrap overflow-hidden ${
                mobileTab === "chat"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span>Chat</span>
            </button>

            <button
              onClick={() => setMobileTab("stream")}
              className={`h-10 min-h-[40px] max-h-[40px] px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer select-none whitespace-nowrap overflow-hidden ${
                mobileTab === "stream"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Radio className="w-3.5 h-3.5 shrink-0" />
              <span>Stream</span>
            </button>

            <button
              onClick={() => setMobileTab("participants")}
              className={`h-10 min-h-[40px] max-h-[40px] px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer select-none whitespace-nowrap overflow-hidden ${
                mobileTab === "participants"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">Personas</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold leading-none shrink-0 ${
                  mobileTab === "participants"
                    ? "bg-white/20 text-white"
                    : "bg-white/10 text-purple-300"
                }`}
              >
                {participants.length}
              </span>
            </button>

            {allowsVoice && (
              <button
                onClick={() => setMobileTab("call")}
                className={`h-10 min-h-[40px] max-h-[40px] px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer select-none whitespace-nowrap overflow-hidden ${
                  mobileTab === "call"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : micActive || cameraActive
                    ? "text-emerald-400 font-bold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {micActive ? (
                  <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
                ) : (
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>Llamada</span>
                {(micActive || cameraActive) && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Active Tab View (Fills remaining height) */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#090B10]">
          {/* TAB 1: Chat Feed */}
          {mobileTab === "chat" && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3 overscroll-contain">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-500">
                    <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
                    <p className="text-xs leading-relaxed max-w-xs">
                      El chat está listo. Escribe para saludar a los participantes.
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
                      <p className="text-gray-200 text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  ))
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Fixed Chat Input with iOS Safe Area Bottom */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-white/10 bg-[#0C0F17] shrink-0"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Escribe un mensaje..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-base text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 min-h-[44px]"
                  />
                  <button
                    type="submit"
                    className="min-h-[44px] min-w-[44px] px-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition cursor-pointer flex items-center justify-center shrink-0"
                    aria-label="Enviar mensaje"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: Stream Info */}
          {mobileTab === "stream" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] overscroll-contain">
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Directo Activo</span>
                  <span className="flex items-center gap-1 text-[11px] text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                    <Radio className="w-3 h-3" />
                    <span>Twitch</span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-white">{activeStream || "Sin canal"}</span>
                  {activeStream && (
                    <a
                      href={`https://twitch.tv/${activeStream}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
                    >
                      <span>Abrir en Twitch</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Change Stream Form for Host or Demo */}
              {(isHost || isDemo) && (
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2.5">
                  <span className="text-xs font-bold text-gray-300">Cambiar canal de Twitch</span>
                  <form onSubmit={handleApplyStream} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Canal o URL (ej. ibai)..."
                      value={streamInput}
                      onChange={(e) => setStreamInput(e.target.value)}
                      className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-base text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 min-h-[44px]"
                    />
                    <button
                      type="submit"
                      className="liquid-btn-primary px-4 rounded-xl text-xs font-bold cursor-pointer min-h-[44px]"
                    >
                      Cargar
                    </button>
                  </form>
                </div>
              )}

              {/* Room Info */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2 text-xs text-gray-300">
                <div>
                  <span className="text-gray-500">Nombre: </span>
                  <strong className="text-white">{roomData?.name || "Sala StreamSync"}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Código de sala: </span>
                  <span className="font-mono text-purple-300 font-bold">{roomData?.code || roomId}</span>
                </div>
                <div>
                  <span className="text-gray-500">Categoría: </span>
                  <strong className="text-gray-200">{roomData?.category || "Entretenimiento en directo"}</strong>
                </div>
                {roomData?.description && (
                  <p className="text-gray-400 italic pt-1 border-t border-white/5">
                    "{roomData.description}"
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Participants List */}
          {mobileTab === "participants" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 pb-[max(1.5rem,env(safe-area-inset-bottom))] overscroll-contain">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-xs text-white shrink-0">
                      {p.avatar ? (
                        <img src={p.avatar} alt={p.name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        p.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white">{p.name}</span>
                        {p.isHost && <Crown className="w-3.5 h-3.5 text-yellow-400" />}
                      </div>
                      <span className="text-xs text-gray-400">
                        {allowsVoice
                          ? p.micActive
                            ? "Micrófono activo"
                            : "Silenciado"
                          : "Solo chat"}
                      </span>
                    </div>
                  </div>

                  {allowsVoice && (
                    <div className="flex items-center gap-2">
                      {p.handRaised && (
                        <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300" title="Mano levantada">
                          <Hand className="w-4 h-4" />
                        </span>
                      )}
                      {p.micActive ? (
                        <Mic className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <MicOff className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: WebRTC Call Center */}
          {mobileTab === "call" && allowsVoice && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] overscroll-contain">
              {/* Call status banner */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      micActive ? "bg-emerald-400 animate-pulse" : localStream ? "bg-emerald-500" : "bg-red-500"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-bold text-white">
                      {localStream ? (micActive ? "Conectado y hablando" : "Conectado (silenciado)") : "Desconectado de llamada"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {localStream ? "Voz activa en tiempo real" : "Pulsa Hablar para unirte a la llamada"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Video Grid inside call tab if camera is active */}
              {allowsVideo && (cameraActive || Array.from(remoteStreams.values()).length > 0) && (
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-black p-2">
                  <VideoGrid
                    localParticipant={
                      participants.find((p) => p.connectionId === connectionId) || participants[0]
                    }
                    remoteParticipants={participants.filter((p) => p.connectionId !== connectionId)}
                    onToggleCamera={handleToggleCamera}
                    onToggleMic={handleToggleMic}
                  />
                </div>
              )}

              {/* Large Tactile Touch Controls (>= 48px) */}
              <div className="grid grid-cols-2 gap-3">
                {/* Mic Button */}
                <button
                  onClick={handleToggleMic}
                  className={`min-h-[56px] p-3 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2.5 transition cursor-pointer ${
                    micActive
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                      : "bg-red-500/20 border-red-500/40 text-red-300"
                  }`}
                >
                  {micActive ? <Mic className="w-5 h-5 text-emerald-400" /> : <MicOff className="w-5 h-5 text-red-400" />}
                  <span>{micActive ? "Silenciar" : "Hablar"}</span>
                </button>

                {/* Camera Button */}
                {allowsVideo && (
                  <button
                    onClick={handleToggleCamera}
                    className={`min-h-[56px] p-3 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2.5 transition cursor-pointer ${
                      cameraActive
                        ? "bg-pink-500/20 border-pink-500/40 text-pink-300"
                        : "bg-white/5 border-white/10 text-gray-300"
                    }`}
                  >
                    {cameraActive ? <Video className="w-5 h-5 text-pink-400" /> : <VideoOff className="w-5 h-5 text-gray-400" />}
                    <span>{cameraActive ? "Cámara On" : "Cámara Off"}</span>
                  </button>
                )}

                {/* Turn / Hand Raise */}
                <button
                  onClick={handleToggleHandRaise}
                  className={`min-h-[56px] p-3 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2.5 transition cursor-pointer ${
                    handRaised
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                      : "bg-white/5 border-white/10 text-gray-300"
                  }`}
                >
                  <Hand className={`w-5 h-5 ${handRaised ? "text-amber-400 animate-bounce" : ""}`} />
                  <span>{handRaised ? "Mano alzada" : "Pedir turno"}</span>
                </button>

                {/* Deafen / Sound */}
                <button
                  onClick={() => setDeafened(!deafened)}
                  className={`min-h-[56px] p-3 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2.5 transition cursor-pointer ${
                    deafened
                      ? "bg-red-500/20 border-red-500/40 text-red-400"
                      : "bg-white/5 border-white/10 text-gray-300"
                  }`}
                >
                  {deafened ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
                  <span>{deafened ? "Silenciado" : "Sonido On"}</span>
                </button>
              </div>

              {/* Leave Voice Button */}
              {localStream && (
                <button
                  onClick={handleLeaveVoice}
                  className="w-full min-h-[50px] rounded-2xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <PhoneOff className="w-5 h-5" />
                  <span>Desconectar de la llamada</span>
                </button>
              )}

              <p className="text-[11px] text-gray-500 text-center">
                Voz y cámara opcionales (Beta WebRTC punto a punto). Conexión encriptada entre navegadores.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Main Room Body (lg+) */}
      <div className="hidden lg:flex flex-1 flex-row min-h-0 w-full overflow-hidden">
        {/* Stream & Audio/Video Column */}
        <main className="w-full shrink-0 lg:shrink lg:flex-1 flex flex-col min-h-0 bg-black overflow-hidden">
          {/* Active Video Grid (When participants have cameras active) */}
          {allowsVideo && (
            <VideoGrid
              localParticipant={
                participants.find((p) => p.connectionId === connectionId) || participants[0]
              }
              remoteParticipants={participants.filter((p) => p.connectionId !== connectionId)}
              onToggleCamera={handleToggleCamera}
              onToggleMic={handleToggleMic}
            />
          )}

          {/* Video Player Area with Guaranteed 16:9 Bidirectional Containment (Zero clipping) */}
          {activeStream ? (
            <div className="w-full lg:flex-1 lg:min-h-0 flex items-center justify-center p-0 lg:p-3 overflow-hidden bg-black">
              <div
                className="relative aspect-video w-full max-h-full max-w-full flex items-center justify-center rounded-none lg:rounded-2xl overflow-hidden border-0 lg:border border-white/10 shadow-2xl bg-black"
                style={{
                  maxWidth: "calc((100dvh - 120px) * 16 / 9)",
                }}
              >
                <TwitchPlayer channel={activeStream} />
              </div>
            </div>
          ) : (
            /* Professional Empty State: "Añadir stream para comenzar" */
            <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto my-auto overflow-y-auto animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-3xl bg-purple-600/20 border border-purple-500/30 shadow-2xl flex items-center justify-center text-purple-300 mb-4 backdrop-blur-xl shrink-0">
                <Tv className="h-8 w-8" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                Añadir stream para comenzar
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 max-w-md leading-relaxed mb-6">
                Pega el nombre de cualquier canal o enlace de Twitch para sincronizarlo al instante con tus amigos.
              </p>

              {/* Stream Input Form */}
              <div className="w-full bg-[#0D0F17] border border-white/10 rounded-2xl p-4 text-left shadow-xl">
                <form onSubmit={handleApplyStream} className="flex gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-[#9146FF]/20 text-[#be99ff] border border-[#9146FF]/30 rounded-xl text-xs font-bold shrink-0">
                    <Radio className="w-3.5 h-3.5" />
                    <span>Twitch</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Pega URL o nombre de canal (ej. ibai, auronplay)..."
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

          {/* Dedicated Audio / Voice Control Dock (Only shown when mode allows voice/video) */}
          {allowsVoice && (
            <div
              className={`w-full bg-[#090B10] border-t border-white/10 px-4 flex items-center justify-between gap-3 shrink-0 z-20 transition-all duration-200 ${
                isAudioDockMinimized
                  ? "py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
                  : "py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]"
              }`}
            >
              {isAudioDockMinimized ? (
                /* Minimized compact bar */
                <div className="w-full flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        micActive ? "bg-emerald-400 animate-pulse" : "bg-red-500"
                      }`}
                    />
                    <span className="font-semibold text-gray-300">
                      {micActive ? "Micrófono activo" : "Micrófono silenciado"}
                    </span>
                    {cameraActive && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                        Cámara activa
                      </span>
                    )}
                    {handRaised && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Mano alzada
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleMic}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        micActive
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                          : "bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20"
                      }`}
                    >
                      {micActive ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5 text-red-400" />}
                      <span>{micActive ? "Silenciar" : "Hablar"}</span>
                    </button>

                    <button
                      onClick={() => setIsAudioDockMinimized(false)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition cursor-pointer"
                      title="Expandir panel de voz"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Full Audio Dock */
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div
                        className={`w-9 h-9 rounded-xl overflow-hidden bg-purple-600/30 flex items-center justify-center border-2 transition-all ${
                          isSpeaking
                            ? "border-emerald-400 ring-2 ring-emerald-400/40 shadow-md shadow-emerald-500/20"
                            : micActive
                            ? "border-emerald-500"
                            : "border-white/10"
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
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#090B10] ${
                          micActive ? "bg-emerald-400" : "bg-red-500"
                        }`}
                      />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">
                          {micActive ? (
                            <span className="text-emerald-400">
                              {isSpeaking ? "Hablando..." : "Micrófono activo"}
                            </span>
                          ) : (
                            <span className="text-red-400">Silenciado</span>
                          )}
                        </span>
                        {handRaised && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Turno pedido
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 truncate">
                        {localStream ? "Conectado a llamada" : "Audio WebRTC • Pulsa Activar para unirte"}
                      </span>
                    </div>
                  </div>

                  {/* Voice & Turn Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Microphone Toggle */}
                    <button
                      onClick={handleToggleMic}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        micActive
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                          : "bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30"
                      }`}
                      title={micActive ? "Silenciar micrófono (M)" : "Activar micrófono (M)"}
                    >
                      {micActive ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-red-400" />}
                      <span className="hidden sm:inline">{micActive ? "Silenciar" : "Activar"}</span>
                    </button>

                    {/* Camera Toggle (Only if video is allowed) */}
                    {allowsVideo && (
                      <button
                        onClick={handleToggleCamera}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                          cameraActive
                            ? "bg-pink-500/20 border-pink-500/40 text-pink-300 hover:bg-pink-500/30"
                            : "bg-white/5 border-white/10 text-gray-300 hover:text-white"
                        }`}
                        title={cameraActive ? "Apagar cámara" : "Encender cámara"}
                      >
                        {cameraActive ? (
                          <Video className="w-4 h-4 text-pink-400" />
                        ) : (
                          <VideoOff className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="hidden sm:inline">{cameraActive ? "Cámara On" : "Cámara"}</span>
                      </button>
                    )}

                    {/* Deafen Toggle */}
                    <button
                      onClick={() => setDeafened(!deafened)}
                      className={`p-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        deafened
                          ? "bg-red-500/20 border-red-500/40 text-red-400"
                          : "bg-white/5 border-white/10 text-gray-300 hover:text-white"
                      }`}
                      title={deafened ? "Reactivar sonido" : "Ensordecer audio de la sala"}
                    >
                      {deafened ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    {/* Hand Raise */}
                    <button
                      onClick={handleToggleHandRaise}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        handRaised
                          ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                          : "bg-white/5 border-white/10 text-gray-300 hover:text-amber-300"
                      }`}
                      title={handRaised ? "Bajar la mano" : "Pedir turno para hablar"}
                    >
                      <Hand className={`w-4 h-4 ${handRaised ? "animate-bounce text-amber-400" : ""}`} />
                      <span className="hidden sm:inline">
                        {handRaised ? "Mano alzada" : "Pedir turno"}
                      </span>
                    </button>

                    {/* Leave voice if connected */}
                    {localStream && (
                      <button
                        onClick={handleLeaveVoice}
                        className="p-2 rounded-xl bg-red-600/20 hover:bg-red-600 border border-red-500/30 text-red-300 hover:text-white transition cursor-pointer"
                        title="Desconectarme de voz y vídeo"
                      >
                        <PhoneOff className="w-4 h-4" />
                      </button>
                    )}

                    {/* Minimize Dock */}
                    <button
                      onClick={() => setIsAudioDockMinimized(true)}
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition cursor-pointer"
                      title="Minimizar panel de voz"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </main>

        {/* Right Sidebar: Chat & Participants */}
        <aside className="flex-1 lg:flex-none lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-white/10 bg-[#090B10] flex flex-col min-h-0 overflow-hidden">
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
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-500">
                    <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
                    <p className="text-xs leading-relaxed max-w-xs">
                      El chat está listo. Escribe para saludar a los participantes.
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
                          {allowsVoice
                            ? p.micActive
                              ? "Micrófono activo"
                              : "Silenciado"
                            : "Solo chat"}
                        </span>
                      </div>
                    </div>

                    {allowsVoice && (
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
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </aside>
      </div>

      {/* Opt-in Media Permission Modal (Never requested without explicit user click) */}
      {requestedMediaType && (
        <MediaPermissionModal
          isOpen={Boolean(requestedMediaType)}
          onClose={() => setRequestedMediaType(null)}
          requestedType={requestedMediaType}
          onPermissionGranted={handlePermissionGranted}
          onChooseChatOnly={() => {
            setRequestedMediaType(null);
            if (typeof addToast === "function") {
              addToast("Participando en modo solo chat", "info");
            }
          }}
        />
      )}

      {/* Host Options Modal */}
      {showHostOptionsModal && roomData && (
        <HostOptionsModal
          isOpen={showHostOptionsModal}
          onClose={() => setShowHostOptionsModal(false)}
          room={{
            code: roomData.code,
            name: roomData.name,
            isPrivate: roomData.isPrivate,
            communicationMode: roomData.communicationMode,
            hostId: roomData.hostId,
          }}
          onRoomUpdated={(updated) => {
            setRoomData((prev) => (prev ? { ...prev, ...updated } : updated));
          }}
        />
      )}

      {/* Room Closed Eviction Modal */}
      {isRoomClosedByHost && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0D0F17] border border-red-500/30 rounded-3xl p-6 shadow-2xl space-y-4 text-center animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Watch Party Finalizada</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              El anfitrión ha cerrado o eliminado esta sala. Serás redirigido a tu panel de control.
            </p>
            <button
              onClick={() => {
                handleLeaveVoice();
                router.push("/dashboard");
              }}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition cursor-pointer"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      )}

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
              Desconectarás la llamada, tu presencia en la sala y el chat en tiempo real.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowLeaveModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white transition cursor-pointer"
              >
                Permanecer
              </button>
              <button
                onClick={handleLeaveRoom}
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
