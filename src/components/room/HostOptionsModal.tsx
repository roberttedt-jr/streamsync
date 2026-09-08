"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  X,
  Trash2,
  AlertTriangle,
  Globe,
  Lock,
  MessageSquare,
  Mic,
  Video,
  Sparkles,
  Check,
  Loader2,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface HostOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: {
    code: string;
    name: string;
    isPrivate?: boolean;
    communicationMode?: string;
    hostId?: string | null;
  };
  onRoomUpdated?: (updated: any) => void;
}

export default function HostOptionsModal({
  isOpen,
  onClose,
  room,
  onRoomUpdated,
}: HostOptionsModalProps) {
  const router = useRouter();
  const { addToast } = useToast();

  const [name, setName] = useState(room.name || "");
  const [isPrivate, setIsPrivate] = useState(Boolean(room.isPrivate));
  const [communicationMode, setCommunicationMode] = useState<string>(
    room.communicationMode || "FLEXIBLE"
  );

  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch(`/api/rooms/${encodeURIComponent(room.code)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          isPrivate,
          communicationMode,
          hostId: room.hostId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "No se pudo actualizar la configuración");
      }

      if (typeof addToast === "function") {
        addToast("Ajustes de la sala actualizados", "success");
      }
      if (onRoomUpdated && data.room) {
        onRoomUpdated(data.room);
      }
      onClose();
    } catch (err: any) {
      if (typeof addToast === "function") {
        addToast(err.message || "Error al actualizar ajustes", "error");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (deleteConfirmationText.trim().toUpperCase() !== "ELIMINAR") return;

    setIsDeleting(true);

    try {
      const res = await fetch(
        `/api/rooms/${encodeURIComponent(room.code)}?hostId=${encodeURIComponent(room.hostId || "")}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "No se pudo eliminar la sala");
      }

      if (typeof addToast === "function") {
        addToast("Watch Party eliminada de forma segura", "success");
      }

      onClose();
      router.push("/dashboard");
    } catch (err: any) {
      if (typeof addToast === "function") {
        addToast(err.message || "Error al eliminar la sala", "error");
      }
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-[#0D1017] border border-white/10 shadow-2xl p-6 text-white space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Opciones del Anfitrión</h3>
              <p className="text-xs text-gray-400">Administra o elimina esta Watch Party</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Settings */}
        <form onSubmit={handleSaveSettings} className="space-y-4">
          {/* Room Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Nombre de la Sala
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Visibilidad</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  !isPrivate
                    ? "bg-purple-600/20 border-purple-500 text-white"
                    : "bg-white/[0.02] border-white/10 text-gray-400 hover:text-white"
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                <span>Pública</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  isPrivate
                    ? "bg-purple-600/20 border-purple-500 text-white"
                    : "bg-white/[0.02] border-white/10 text-gray-400 hover:text-white"
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Privada (solo enlace)</span>
              </button>
            </div>
          </div>

          {/* Communication Mode */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Modo de Comunicación
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCommunicationMode("FLEXIBLE")}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  communicationMode === "FLEXIBLE"
                    ? "bg-purple-600/20 border-purple-500 text-white"
                    : "bg-white/[0.02] border-white/10 text-gray-400 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Flexible</span>
                </div>
                <span className="text-[10px] text-gray-400">Audio/vídeo a elección</span>
              </button>

              <button
                type="button"
                onClick={() => setCommunicationMode("CHAT_ONLY")}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  communicationMode === "CHAT_ONLY"
                    ? "bg-purple-600/20 border-purple-500 text-white"
                    : "bg-white/[0.02] border-white/10 text-gray-400 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5">
                  <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                  <span>Solo chat</span>
                </div>
                <span className="text-[10px] text-gray-400">Sin micro ni cámara</span>
              </button>

              <button
                type="button"
                onClick={() => setCommunicationMode("VOICE")}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  communicationMode === "VOICE"
                    ? "bg-purple-600/20 border-purple-500 text-white"
                    : "bg-white/[0.02] border-white/10 text-gray-400 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5">
                  <Mic className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Chat + micrófono</span>
                </div>
                <span className="text-[10px] text-gray-400">Voz y cola de turnos</span>
              </button>

              <button
                type="button"
                onClick={() => setCommunicationMode("VIDEO")}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  communicationMode === "VIDEO"
                    ? "bg-purple-600/20 border-purple-500 text-white"
                    : "bg-white/[0.02] border-white/10 text-gray-400 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5">
                  <Video className="w-3.5 h-3.5 text-pink-400" />
                  <span>Videollamada</span>
                </div>
                <span className="text-[10px] text-gray-400">Cámaras y micrófonos</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-600/30 disabled:opacity-50"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSaving ? "Guardando..." : "Guardar Cambios"}</span>
            </button>
          </div>
        </form>

        {/* Danger Zone: Delete Room */}
        <div className="pt-4 border-t border-red-500/20 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Zona de Peligro</span>
          </div>

          {!showDeleteConfirm ? (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-red-950/20 border border-red-500/20">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-red-200">Eliminar Watch Party</span>
                <p className="text-[11px] text-red-300/70">
                  Cierra la sala de forma definitiva y desaloja a todos los miembros.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3.5 py-2 rounded-xl bg-red-600/20 hover:bg-red-600 border border-red-500/40 text-red-300 hover:text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar sala</span>
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 space-y-3 animate-in fade-in duration-150">
              <div className="text-xs text-red-200 space-y-1">
                <span className="font-bold block">¿Confirmas la eliminación permanente?</span>
                <p className="text-[11px] text-red-300/80">
                  Esta acción no se puede deshacer. Escribe <strong className="text-white bg-red-900/60 px-1.5 py-0.5 rounded font-mono">ELIMINAR</strong> para confirmar:
                </p>
              </div>

              <input
                type="text"
                placeholder="Escribe ELIMINAR"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-red-500/40 text-xs text-white placeholder-red-400/40 focus:outline-none focus:border-red-400 font-mono"
              />

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmationText("");
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={
                    deleteConfirmationText.trim().toUpperCase() !== "ELIMINAR" || isDeleting
                  }
                  onClick={handleDeleteRoom}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-600/30 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isDeleting ? "Eliminando..." : "Confirmar Eliminación"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
