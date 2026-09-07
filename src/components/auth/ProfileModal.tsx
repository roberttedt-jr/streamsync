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

const PRESET_AVATARS = [
  { label: "Robot", url: "https://api.dicebear.com/7.x/bottts/svg?seed=MechaZero&backgroundColor=0d0f17" },
  { label: "Héroe", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=ApexHero&backgroundColor=0d0f17" },
  { label: "Lobo", url: "https://api.dicebear.com/7.x/thumbs/svg?seed=ShadowWolf&backgroundColor=0d0f17" },
  { label: "Zorro", url: "https://api.dicebear.com/7.x/thumbs/svg?seed=CyberFox&backgroundColor=0d0f17" },
  { label: "Panda", url: "https://api.dicebear.com/7.x/thumbs/svg?seed=GamerPanda&backgroundColor=0d0f17" },
  { label: "Pixel", url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=PixelWarrior&backgroundColor=0d0f17" },
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
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || PRESET_AVATARS[0].url);
  const [customAvatar, setCustomAvatar] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [twitchInput, setTwitchInput] = useState(user?.twitchUsername || "");
  const [youtubeInput, setYoutubeInput] = useState(user?.youtubeHandle || "");

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("La imagen no debe superar los 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCustomAvatar(reader.result);
        setSelectedAvatar(reader.result);
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
            {(user.twitchUsername || user.youtubeHandle) && (
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
          <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">
                Cambiar Avatar Gamer (o subir archivo)
              </label>
              
              <div className="flex items-center gap-2.5 mb-3 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    title={av.label}
                    onClick={() => {
                      setSelectedAvatar(av.url);
                      setCustomAvatar("");
                      setUploadedFileName(null);
                    }}
                    className={`relative h-12 w-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-[#121620] cursor-pointer flex items-center justify-center p-1 ${
                      selectedAvatar === av.url && !customAvatar
                        ? "border-white scale-105 shadow-md bg-white/[0.08]"
                        : "border-white/[0.08] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={av.url} alt={av.label} className="h-full w-full object-contain" />
                    {selectedAvatar === av.url && !customAvatar && (
                      <div className="absolute top-0.5 right-0.5 h-3.5 w-3.5 bg-white text-black rounded-full flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
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
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-gray-300 hover:text-white transition cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5 text-gray-400" />
                  <span className="truncate">
                    {uploadedFileName ? `Imagen: ${uploadedFileName}` : "Cargar imagen desde tu dispositivo"}
                  </span>
                </button>

                {customAvatar && (
                  <div className="h-9 w-9 rounded-lg overflow-hidden border border-white/20 shrink-0 bg-[#121620]">
                    <img src={customAvatar} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
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
                  className="text-[11px] text-purple-400 hover:underline flex items-center gap-1 pt-1"
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
