"use client";

import React, { useState } from "react";
import {
  X,
  User as UserIcon,
  Check,
  LogOut,
  ExternalLink,
  Shield,
  Sparkles,
  Radio,
  Tv,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80",
];

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRoomWithChannel?: (platform: "twitch" | "youtube", channel: string) => void;
}

export default function ProfileModal({
  isOpen,
  onClose,
  onOpenRoomWithChannel,
}: ProfileModalProps) {
  const { user, updateProfile, linkTwitch, unlinkTwitch, linkYouTube, unlinkYouTube, logout } =
    useAuth();

  const [activeTab, setActiveTab] = useState<"profile" | "connections">("profile");

  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || PRESET_AVATARS[0]);
  const [customAvatar, setCustomAvatar] = useState("");

  const [twitchInput, setTwitchInput] = useState(user?.twitchUsername || "");
  const [youtubeInput, setYoutubeInput] = useState(user?.youtubeHandle || "");

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isOpen || !user) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const finalAvatar = customAvatar.trim() || selectedAvatar;

    await updateProfile({
      name: name.trim(),
      bio: bio.trim(),
      avatar: finalAvatar,
    });

    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSaveTwitch = async () => {
    if (!twitchInput.trim()) {
      await unlinkTwitch();
    } else {
      await linkTwitch(twitchInput);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSaveYouTube = async () => {
    if (!youtubeInput.trim()) {
      await unlinkYouTube();
    } else {
      await linkYouTube(youtubeInput);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-[#0D0F17] border border-white/[0.08] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="h-9 w-9 rounded-full object-cover border border-white/20"
            />
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{user.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-gray-300">
                  @{user.username}
                </span>
              </div>
              <span className="text-xs text-gray-400">{user.email}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex border-b border-white/[0.06] px-6">
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-3 text-xs font-semibold mr-6 border-b-2 transition-all ${
              activeTab === "profile"
                ? "border-white text-white"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Datos de Perfil
          </button>
          <button
            onClick={() => setActiveTab("connections")}
            className={`py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "connections"
                ? "border-white text-white"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <span>Cuentas Vinculadas</span>
            {(user.twitchUsername || user.youtubeHandle) && (
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            )}
          </button>
        </div>

        {savedSuccess && (
          <div className="mx-6 mt-4 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0" />
            <span>Cambios guardados correctamente</span>
          </div>
        )}

        {activeTab === "profile" ? (
          <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">
                Cambiar Avatar de Perfil
              </label>
              <div className="flex items-center gap-2.5 mb-2.5 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(av);
                      setCustomAvatar("");
                    }}
                    className={`relative h-11 w-11 rounded-full overflow-hidden border-2 transition-all shrink-0 ${
                      selectedAvatar === av && !customAvatar
                        ? "border-white scale-105 shadow-md"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={av} alt="Avatar" className="h-full w-full object-cover" />
                    {selectedAvatar === av && !customAvatar && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Check className="h-3.5 w-3.5 text-white stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <input
                type="url"
                placeholder="O pega una URL de foto de perfil..."
                value={customAvatar}
                onChange={(e) => setCustomAvatar(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Nombre Visible</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Biografía Gamer</label>
              <textarea
                rows={2}
                placeholder="Streamer, jugador competitivo o fan del esport..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/30 resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Cerrar Sesión</span>
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-6">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-[#9146FF]/20 flex items-center justify-center text-[#9146FF]">
                    <Radio className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Canal de Twitch</h4>
                    <p className="text-[11px] text-gray-400">
                      {user.twitchUsername
                        ? `Vinculado: twitch.tv/${user.twitchUsername}`
                        : "No vinculado"}
                    </p>
                  </div>
                </div>

                {user.twitchUsername ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Conectado
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-gray-400 text-[10px]">
                    Desconectado
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="ej. ibai o nombre_de_tu_canal"
                  value={twitchInput}
                  onChange={(e) => setTwitchInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                />
                <button
                  type="button"
                  onClick={handleSaveTwitch}
                  className="px-4 py-2 rounded-xl bg-[#9146FF] text-white text-xs font-bold hover:bg-[#7d2df5] transition-colors cursor-pointer shrink-0"
                >
                  {user.twitchUsername ? "Actualizar" : "Vincular"}
                </button>
              </div>

              {user.twitchUsername && onOpenRoomWithChannel && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenRoomWithChannel("twitch", user.twitchUsername!);
                    onClose();
                  }}
                  className="text-[11px] text-brand-purple hover:underline flex items-center gap-1 pt-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Ver mi canal de Twitch en Watch Party</span>
                </button>
              )}
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-red-600/20 flex items-center justify-center text-red-500">
                    <Tv className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Canal de YouTube</h4>
                    <p className="text-[11px] text-gray-400">
                      {user.youtubeHandle
                        ? `Vinculado: youtube.com/${user.youtubeHandle}`
                        : "No vinculado"}
                    </p>
                  </div>
                </div>

                {user.youtubeHandle ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Conectado
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-gray-400 text-[10px]">
                    Desconectado
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="ej. @LofiGirl o ID de directo"
                  value={youtubeInput}
                  onChange={(e) => setYoutubeInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                />
                <button
                  type="button"
                  onClick={handleSaveYouTube}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer shrink-0"
                >
                  {user.youtubeHandle ? "Actualizar" : "Vincular"}
                </button>
              </div>

              {user.youtubeHandle && onOpenRoomWithChannel && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenRoomWithChannel("youtube", user.youtubeHandle!);
                    onClose();
                  }}
                  className="text-[11px] text-red-400 hover:underline flex items-center gap-1 pt-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Ver mi canal de YouTube en Watch Party</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
