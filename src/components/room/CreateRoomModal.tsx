"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Gamepad2, Radio, Tv, Lock, Users, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateRoomModal({ isOpen, onClose }: CreateRoomModalProps) {
  const router = useRouter();
  const { user, incrementRoomsCreated } = useAuth();
  const toast = useToast();

  const [name, setName] = useState("");
  const [platform, setPlatform] = useState<"twitch" | "youtube">("twitch");
  const [streamInput, setStreamInput] = useState("");
  const [password, setPassword] = useState("");
  const [maxParticipants, setMaxParticipants] = useState<number>(10);
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const randomCode = Math.random().toString(36).substring(2, 8);
    const roomName = name.trim() || `Watch Party de ${user?.name || "Gamer"}`;

    try {
      await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: randomCode,
          name: roomName,
          platform,
          channel: streamInput.trim() || "",
          isPrivate,
          password: password.trim() || undefined,
          maxParticipants,
          hostId: user?.id,
        }),
      });
      incrementRoomsCreated();
      toast.success("¡Sala creada con éxito!");
      onClose();

      if (streamInput.trim()) {
        router.push(`/room/${randomCode}?stream=${encodeURIComponent(streamInput.trim())}&platform=${platform}`);
      } else {
        router.push(`/room/${randomCode}`);
      }
    } catch {
      toast.error("Error al crear la sala");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-[#0D111A] border border-white/[0.1] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Gamepad2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-heading">Crear Nueva Watch Party</h3>
              <p className="text-[11px] text-gray-400">Configura tu sala y sincroniza al milisegundo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Nombre de la Sala
            </label>
            <input
              type="text"
              placeholder={`Watch Party de ${user?.name || "Squad"}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Plataforma
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
                <span>Twitch Stream</span>
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
                <span>YouTube Vídeo / Live</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Canal o URL Inicial <span className="text-gray-500 font-normal">(Opcional)</span>
            </label>
            <input
              type="text"
              placeholder={
                platform === "twitch"
                  ? "ej. valorant, eslcs o déjalo vacío para sala de espera"
                  : "ej. enlace de YouTube o déjalo vacío para sala de espera"
              }
              value={streamInput}
              onChange={(e) => setStreamInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Si lo dejas en blanco, la sala iniciará en la <strong>Pantalla de Espera</strong> interactiva.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Capacidad Máxima
              </label>
              <select
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-[#07090E] border border-white/[0.08] text-xs text-white outline-none cursor-pointer focus:border-violet-500"
              >
                <option value={5}>5 personas (Íntimo)</option>
                <option value={10}>10 personas (Squad estándar)</option>
                <option value={25}>25 personas (Comunidad)</option>
                <option value={50}>50 personas (Torneo)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Contraseña <span className="text-gray-500 font-normal">(Opcional)</span>
              </label>
              <input
                type="password"
                placeholder="Sin clave"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setIsPrivate(Boolean(e.target.value));
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              <span>{loading ? "Creando..." : "Crear Watch Party"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
