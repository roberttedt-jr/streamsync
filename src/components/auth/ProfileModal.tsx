"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Check,
  LogOut,
  ExternalLink,
  Radio,
  Tv,
  Upload,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "profile" | "connections";
  onOpenRoomWithChannel?: (platform: "twitch", channel: string) => void;
}

export default function ProfileModal({
  isOpen,
  onClose,
  defaultTab = "profile",
  onOpenRoomWithChannel,
}: ProfileModalProps) {
  const { user, updateProfile, linkTwitch, unlinkTwitch, logout } =
    useAuth();

  const [activeTab, setActiveTab] = useState<"profile" | "connections">(defaultTab);

  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatar || "");
  const [customAvatar, setCustomAvatar] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [twitchInput, setTwitchInput] = useState(user?.twitchUsername || "");

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setError("La foto no debe superar los 3MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCustomAvatar(reader.result);
        setAvatarPreview(reader.result);
        setUploadedFileName(file.name);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const finalAvatar = customAvatar.trim() || user.avatar;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-[#0D0F17] border border-white/[0.08] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl overflow-hidden border border-white/20 bg-[#121620] flex items-center justify-center p-0.5">
              <img
                src={user.avatar}
                alt={user.name}
                className="h-full w-full object-contain rounded-lg"
              />
            </div>
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
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex border-b border-white/[0.06] px-6">
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-3 text-xs font-semibold mr-6 border-b-2 transition-all cursor-pointer ${
              activeTab === "profile"
                ? "border-white text-white"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Datos de Perfil
          </button>
          <button
            onClick={() => setActiveTab("connections")}
            className={`py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "connections"
                ? "border-white text-white"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <span>Cuentas Vinculadas</span>
            {user.twitchUsername && (
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            )}
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        {savedSuccess && (
          <div className="mx-6 mt-4 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0" />
            <span>Cambios guardados correctamente</span>
          </div>
        )}

        {activeTab === "profile" ? (
          <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Foto de Perfil
              </label>

              <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div className="relative h-16 w-16 rounded-2xl overflow-hidden border border-white/20 bg-[#121620] shrink-0">
                  <img
                    src={avatarPreview}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="profile-avatar-file"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs text-white transition cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5 text-gray-400" />
                    <span>{uploadedFileName ? "Cambiar foto" : "Cargar foto desde tu dispositivo"}</span>
                  </button>
                  <p className="text-[11px] text-gray-500">
                    {uploadedFileName ? `Archivo: ${uploadedFileName}` : "Formatos compatibles: JPG, PNG o WEBP (máx. 3MB)"}
                  </p>
                </div>
              </div>
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

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <div className="text-xs">
                <p className="font-semibold text-white">Canales Vinculados</p>
                <p className="text-[11px] text-gray-400">
                  {user.twitchUsername
                    ? "Twitch configurado"
                    : "Conecta tu canal de Twitch"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("connections")}
                className="px-3 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs text-gray-200 hover:text-white transition cursor-pointer"
              >
                Configurar
              </button>
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
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                    </svg>
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
                  placeholder="ej. tu_canal o usuario_twitch"
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
                  className="text-[11px] text-[#A970FF] hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Ver mi canal de Twitch en Watch Party</span>
                </button>
              )}
            </div>


          </div>
        )}
      </div>
    </div>
  );
}
