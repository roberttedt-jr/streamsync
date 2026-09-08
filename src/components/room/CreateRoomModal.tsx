"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Radio,
  Tv,
  Lock,
  Globe,
  Users,
  ArrowRight,
  AlertCircle,
  Film,
  Sparkles,
  FileText,
  MessageSquare,
  Mic,
  Video,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { CATEGORIES } from "@/lib/categories";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: string;
  defaultPlatform?: "twitch" | "youtube";
  defaultChannel?: string;
}

export default function CreateRoomModal({
  isOpen,
  onClose,
  defaultCategory = "Gaming",
  defaultPlatform = "twitch",
  defaultChannel = "",
}: CreateRoomModalProps) {
  const router = useRouter();
  const { user, incrementRoomsCreated } = useAuth();
  const { addToast } = useToast();

  // Mandatory fields
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState<"twitch" | "youtube">(defaultPlatform);
  const [streamUrl, setStreamUrl] = useState(defaultChannel);
  const [category, setCategory] = useState(defaultCategory);
  const [isPrivate, setIsPrivate] = useState(false);
  const [communicationMode, setCommunicationMode] = useState<
    "CHAT_ONLY" | "VOICE" | "VIDEO" | "FLEXIBLE"
  >("FLEXIBLE");

  // Sync defaults when modal opens with prefilled stream
  React.useEffect(() => {
    if (isOpen) {
      if (defaultPlatform) setPlatform(defaultPlatform);
      if (defaultChannel) setStreamUrl(defaultChannel);
    }
  }, [isOpen, defaultPlatform, defaultChannel]);


  // Optional fields
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [maxParticipants, setMaxParticipants] = useState<number>(10);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const validateStream = (url: string, plat: "twitch" | "youtube"): { valid: boolean; cleanId: string; error?: string } => {
    const trimmed = url.trim();
    if (!trimmed) {
      return { valid: false, cleanId: "", error: "El enlace o canal del directo es obligatorio." };
    }

    if (plat === "twitch") {
      // Twitch validation: twitch.tv/username or just username
      const twitchRegex = /^(?:https?:\/\/(?:www\.)?twitch\.tv\/)?@?([a-zA-Z0-9_]{2,25})\/?$/i;
      const match = trimmed.match(twitchRegex);
      if (!match) {
        return {
          valid: false,
          cleanId: "",
          error: "Introduce un enlace válido de Twitch (ej: https://twitch.tv/canal o el nombre del streamer).",
        };
      }
      return { valid: true, cleanId: match[1] };
    } else {
      // YouTube validation: watch?v=ID, youtu.be/ID, live/ID, or 11-char ID
      const ytRegex = /(?:https?:\/\/(?:www\.)?youtube\.com\/(?:watch\?v=|live\/|embed\/)|https?:\/\/youtu\.be\/)?([a-zA-Z0-9_-]{11})/i;
      const match = trimmed.match(ytRegex);
      if (!match) {
        return {
          valid: false,
          cleanId: "",
          error: "Introduce un enlace de YouTube válido (ej: https://www.youtube.com/watch?v=... o https://youtu.be/...).",
        };
      }
      return { valid: true, cleanId: match[1] };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Mandatory validations
    if (!name.trim()) {
      setError("El nombre de la sala es obligatorio.");
      return;
    }

    const validation = validateStream(streamUrl, platform);
    if (!validation.valid) {
      setError(validation.error || "Enlace de directo inválido.");
      return;
    }

    setLoading(true);
    const randomCode = Math.random().toString(36).substring(2, 8);

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: randomCode,
          name: name.trim(),
          platform,
          channel: validation.cleanId,
          streamUrl: streamUrl.trim(),
          category,
          description: description.trim() || undefined,
          isPrivate,
          password: password.trim() || undefined,
          maxParticipants,
          communicationMode,
          hostId: user?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "No se pudo crear la sala");
      }

      const targetCode = data.room?.code || data.watchParty?.code || randomCode;

      try {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("streamsync_created_room_" + targetCode, "true");
        }
      } catch {}

      try {
        if (typeof incrementRoomsCreated === "function") {
          incrementRoomsCreated();
        }
      } catch {}

      try {
        if (typeof addToast === "function") {
          addToast("¡Sala creada con éxito!", "success");
        }
      } catch {}

      onClose();

      router.push(
        `/room/${targetCode}?platform=${platform}&stream=${encodeURIComponent(validation.cleanId)}`
      );
    } catch (err: any) {
      console.error("Error creating room:", err);
      setError(err.message || "Error al crear la sala en el servidor");
      if (typeof addToast === "function") {
        try {
          addToast(err.message || "Error al crear la sala", "error");
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl rounded-3xl bg-[#0D111A] border border-white/[0.1] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white font-heading">
                Crear Nueva Watch Party
              </h3>
              <p className="text-[11px] text-gray-400">
                Configura tu sala y comparte cualquier directo en tiempo real
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Nombre de la sala (Obligatorio) */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              Nombre de la Sala <span className="text-purple-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="ej. Noche de Directo con Amigos, Gran Final de Pádel..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          {/* 2. Plataforma (Obligatorio) */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              Plataforma del Directo <span className="text-purple-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPlatform("twitch")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  platform === "twitch"
                    ? "bg-[#9146FF]/20 border-[#9146FF] text-white shadow-lg shadow-[#9146FF]/10"
                    : "bg-white/[0.02] border-white/[0.08] text-gray-400 hover:text-white"
                }`}
              >
                <Radio className="h-4 w-4 text-[#9146FF]" />
                <span>Twitch</span>
              </button>

              <button
                type="button"
                onClick={() => setPlatform("youtube")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  platform === "youtube"
                    ? "bg-red-600/20 border-red-600 text-white shadow-lg shadow-red-600/10"
                    : "bg-white/[0.02] border-white/[0.08] text-gray-400 hover:text-white"
                }`}
              >
                <Tv className="h-4 w-4 text-[#FF0000]" />
                <span>YouTube</span>
              </button>
            </div>
          </div>

          {/* 3. Enlace del stream (Obligatorio con validación) */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              Enlace o Canal del Stream <span className="text-purple-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={
                platform === "twitch"
                  ? "ej. https://twitch.tv/nombre_canal o nombre_canal"
                  : "ej. https://www.youtube.com/watch?v=... o enlace de emisión en vivo"
              }
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition font-mono"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Validamos que sea un enlace o identificador de {platform === "twitch" ? "Twitch" : "YouTube"} real.
            </p>
          </div>

          {/* 4. Categoría (Obligatorio - Selector 22 categorías) */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              Categoría Temática <span className="text-purple-400">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#090B10] border border-white/[0.08] text-xs text-white outline-none cursor-pointer focus:border-purple-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name} — {cat.description}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Visibilidad (Obligatorio: Pública / Privada) */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              Visibilidad de la Sala <span className="text-purple-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  !isPrivate
                    ? "bg-purple-600/20 border-purple-500 text-white"
                    : "bg-white/[0.02] border-white/[0.08] text-gray-400 hover:text-white"
                }`}
              >
                <Globe className="h-3.5 w-3.5 text-purple-400" />
                <span>Pública (en Explorar)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  isPrivate
                    ? "bg-purple-600/20 border-purple-500 text-white"
                    : "bg-white/[0.02] border-white/[0.08] text-gray-400 hover:text-white"
                }`}
              >
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                <span>Privada (solo con enlace)</span>
              </button>
            </div>
          </div>

          {/* 6. Modo de Comunicación */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              Cómo queréis comunicaros en la sala <span className="text-purple-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option 1: Flexible */}
              <button
                type="button"
                onClick={() => setCommunicationMode("FLEXIBLE")}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  communicationMode === "FLEXIBLE"
                    ? "bg-purple-600/20 border-purple-500 shadow-lg shadow-purple-600/10 text-white"
                    : "bg-white/[0.02] border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="text-xs font-bold">Voz y cámara opcional</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/30 text-purple-300 border border-purple-500/40 font-bold">
                    Recomendado
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 leading-tight">
                  Cada participante decide libremente si usar solo chat, entrar a hablar por micro o encender su cámara.
                </p>
              </button>

              {/* Option 2: Solo chat */}
              <button
                type="button"
                onClick={() => setCommunicationMode("CHAT_ONLY")}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  communicationMode === "CHAT_ONLY"
                    ? "bg-purple-600/20 border-purple-500 shadow-lg shadow-purple-600/10 text-white"
                    : "bg-white/[0.02] border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="text-xs font-bold">Solo chat</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-tight">
                  Solo texto en tiempo real. Máximo espacio para el reproductor, sin micro ni cámara.
                </p>
              </button>

              {/* Option 3: Chat + micrófono */}
              <button
                type="button"
                onClick={() => setCommunicationMode("VOICE")}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  communicationMode === "VOICE"
                    ? "bg-purple-600/20 border-purple-500 shadow-lg shadow-purple-600/10 text-white"
                    : "bg-white/[0.02] border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Mic className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold">Chat + micrófono</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-tight">
                  Chat de texto y canal de audio con cola de turnos para comentar sin pisaros la voz.
                </p>
              </button>

              {/* Option 4: Chat + videollamada */}
              <button
                type="button"
                onClick={() => setCommunicationMode("VIDEO")}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  communicationMode === "VIDEO"
                    ? "bg-purple-600/20 border-purple-500 shadow-lg shadow-purple-600/10 text-white"
                    : "bg-white/[0.02] border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Video className="w-4 h-4 text-pink-400 shrink-0" />
                  <span className="text-xs font-bold">Chat + videollamada</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-tight">
                  Videollamada en directo con cuadrícula de cámaras de los participantes junto al stream.
                </p>
              </button>
            </div>
          </div>

          {/* 6. Descripción (Opcional) */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Descripción de la Sala <span className="text-gray-500 font-normal">(Opcional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Cuéntale a tu comunidad de qué trata esta watch party..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition resize-none"
            />
          </div>

          {/* 7. Contraseña & Límite (Opcionales) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Capacidad Máxima <span className="text-gray-500 font-normal">(Opcional)</span>
              </label>
              <select
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-[#090B10] border border-white/[0.08] text-xs text-white outline-none cursor-pointer focus:border-purple-500"
              >
                <option value={5}>5 personas (Íntimo)</option>
                <option value={10}>10 personas (Estándar)</option>
                <option value={25}>25 personas (Comunidad)</option>
                <option value={50}>50 personas (Evento grande)</option>
                <option value={100}>100 personas (Sin límite)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Contraseña de Entrada <span className="text-gray-500 font-normal">(Opcional)</span>
              </label>
              <input
                type="password"
                placeholder="Sin contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30 disabled:opacity-50"
            >
              <span>{loading ? "Creando sala..." : "Crear Watch Party"}</span>
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
              ) : (
                <ArrowRight className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
