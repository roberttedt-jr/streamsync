"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import {
  User as UserIcon,
  Radio,
  Tv,
  Clock,
  BarChart3,
  Settings,
  Upload,
  ExternalLink,
  Plus,
  Play,
  CheckCircle2,
  Trophy,
  Shield,
  LogOut,
  Sparkles,
  Inbox,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    "twitch" | "youtube" | "history" | "stats" | "settings"
  >("history");

  // Editable settings
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [twitchInput, setTwitchInput] = useState(user?.twitchUsername || "");
  const [youtubeInput, setYoutubeInput] = useState(user?.youtubeHandle || "");
  const [saving, setSaving] = useState(false);

  // User-added channels (starts empty, zero fake channels)
  const [twitchChannels, setTwitchChannels] = useState<{ name: string }[]>([]);
  const [newTwitchChannel, setNewTwitchChannel] = useState("");

  const [ytSubscriptions, setYtSubscriptions] = useState<{ title: string; id: string }[]>([]);
  const [newYtChannel, setNewYtChannel] = useState("");

  // Real watch history (starts empty, zero fake history)
  const [history] = useState<
    { id: string; roomName: string; platform: "twitch" | "youtube"; channel: string; date: string }[]
  >([]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addToast("La foto no puede superar los 2MB", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAvatarPreview(base64);
        addToast("Foto cargada. Guarda los cambios para aplicar.", "info");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateProfile({
      name,
      username,
      bio,
      avatar: avatarPreview,
      twitchUsername: twitchInput.trim() || undefined,
      youtubeHandle: youtubeInput.trim() || undefined,
    });
    setSaving(false);
    if (res.success) {
      addToast("Perfil actualizado correctamente", "success");
    } else {
      addToast(res.error || "Error al actualizar perfil", "error");
    }
  };

  const handleAddTwitchChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTwitchChannel.trim()) return;
    const clean = newTwitchChannel.trim().toLowerCase().replace("@", "");
    setTwitchChannels((prev) => [...prev, { name: clean }]);
    setNewTwitchChannel("");
    addToast(`Canal @${clean} añadido a tu lista`, "success");
  };

  const handleAddYtChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYtChannel.trim()) return;
    const clean = newYtChannel.trim();
    setYtSubscriptions((prev) => [...prev, { title: clean, id: clean }]);
    setNewYtChannel("");
    addToast(`Canal ${clean} añadido a tu lista`, "success");
  };

  const handleLaunchRoom = (channel: string, platform: "twitch" | "youtube") => {
    const code = `${platform}-${Math.random().toString(36).substring(2, 7)}`;
    router.push(`/room/${code}?platform=${platform}&stream=${encodeURIComponent(channel)}`);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile Header Banner with Real User Info */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-purple-950/40 via-purple-900/20 to-cyan-950/30 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* Avatar */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-white/10 border-2 border-purple-500/40 shadow-2xl flex items-center justify-center shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-12 h-12 text-gray-400" />
              )}
              <span className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#090B10]" />
            </div>

            {/* User details */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {user?.name || "Usuario de StreamSync"}
                  </h1>
                  <p className="text-sm text-gray-400 font-mono">
                    {user?.email || (user?.username ? `@${user.username}` : "Usuario registrado")}
                  </p>
                </div>

                <div className="flex items-center gap-2 justify-center sm:justify-end">
                  <button
                    onClick={() => {
                      logout();
                      router.push("/");
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-gray-300 mt-2 max-w-xl">
                {user?.bio || "Perfil de usuario en StreamSync. Disfruta de watch parties sincronizadas a 0ms."}
              </p>

              {/* Linked Accounts */}
              <div className="flex flex-wrap items-center gap-2 mt-4 justify-center sm:justify-start">
                {user?.twitchUsername ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-[#9146FF]/20 text-[#be99ff] border border-[#9146FF]/30">
                    <Radio className="w-3.5 h-3.5" />
                    <span>Twitch: {user.twitchUsername}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-medium bg-white/5 text-gray-400 border border-white/5">
                    Twitch no conectado
                  </span>
                )}

                {user?.youtubeHandle ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-[#FF0000]/20 text-red-300 border border-[#FF0000]/30">
                    <Tv className="w-3.5 h-3.5" />
                    <span>YouTube: {user.youtubeHandle}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-medium bg-white/5 text-gray-400 border border-white/5">
                    YouTube no conectado
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 cursor-pointer ${
              activeTab === "history"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Historial de Salas</span>
          </button>

          <button
            onClick={() => setActiveTab("twitch")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 cursor-pointer ${
              activeTab === "twitch"
                ? "bg-[#9146FF] text-white shadow-lg shadow-[#9146FF]/30"
                : "bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Canales de Twitch</span>
          </button>

          <button
            onClick={() => setActiveTab("youtube")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 cursor-pointer ${
              activeTab === "youtube"
                ? "bg-[#FF0000] text-white shadow-lg shadow-[#FF0000]/30"
                : "bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>Canales de YouTube</span>
          </button>

          <button
            onClick={() => setActiveTab("stats")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 cursor-pointer ${
              activeTab === "stats"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Estadísticas</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 cursor-pointer ${
              activeTab === "settings"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Ajustes de Cuenta</span>
          </button>
        </div>

        {/* Tab 1: History (Zero fake data, required empty state) */}
        {activeTab === "history" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <span>Historial de Watch Parties</span>
            </h3>

            {history.length === 0 ? (
              <div className="p-12 text-center rounded-3xl border border-white/10 bg-white/[0.02] max-w-lg mx-auto my-6 space-y-3">
                <Clock className="w-10 h-10 text-gray-600 mx-auto" />
                <h4 className="text-sm font-bold text-white">
                  No has participado en ninguna watch party todavía.
                </h4>
                <p className="text-xs text-gray-400">
                  Crea una sala o únete a una pública para que aparezca aquí tu historial de visionado.
                </p>
                <div className="pt-2">
                  <Link
                    href="/dashboard"
                    className="liquid-btn-primary px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <span>Ir al Dashboard</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((hist) => (
                  <div
                    key={hist.id}
                    className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">{hist.roomName}</h4>
                      <p className="text-xs text-gray-400">Canal: {hist.channel}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Twitch Channels */}
        {activeTab === "twitch" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-[#9146FF]" />
                  <span>Tus Canales de Twitch</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Añade tus streamers favoritos para iniciar watch parties con un solo clic.
                </p>
              </div>

              <form onSubmit={handleAddTwitchChannel} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nombre de canal..."
                  value={newTwitchChannel}
                  onChange={(e) => setNewTwitchChannel(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#9146FF] w-48"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-[#9146FF] hover:bg-[#772ce8] text-white transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </div>

            {twitchChannels.length === 0 ? (
              <div className="p-12 text-center rounded-3xl border border-white/10 bg-white/[0.02]">
                <Radio className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-400">
                  No has añadido ningún canal de Twitch todavía. Escribe un nombre arriba para guardarlo.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {twitchChannels.map((item, idx) => (
                  <div
                    key={idx}
                    className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between gap-3 group hover:border-[#9146FF]/50 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#9146FF]/20 border border-[#9146FF]/30 flex items-center justify-center text-[#be99ff] font-bold text-sm shrink-0">
                        {item.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">@{item.name}</h4>
                        <p className="text-xs text-gray-400">Twitch</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleLaunchRoom(item.name, "twitch")}
                      className="p-2 rounded-xl bg-white/5 hover:bg-[#9146FF] text-gray-300 hover:text-white transition cursor-pointer"
                      title="Iniciar Watch Party"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: YouTube Subscriptions */}
        {activeTab === "youtube" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Tv className="w-5 h-5 text-[#FF0000]" />
                  <span>Tus Canales de YouTube</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Añade canales o IDs de vídeo para iniciar watch parties rápidamente.
                </p>
              </div>

              <form onSubmit={handleAddYtChannel} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Canal o ID de YouTube..."
                  value={newYtChannel}
                  onChange={(e) => setNewYtChannel(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF0000] w-48"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-[#FF0000] hover:bg-[#cc0000] text-white transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </div>

            {ytSubscriptions.length === 0 ? (
              <div className="p-12 text-center rounded-3xl border border-white/10 bg-white/[0.02]">
                <Tv className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-400">
                  No has añadido ningún canal de YouTube todavía. Escribe uno arriba para guardarlo.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ytSubscriptions.map((item, idx) => (
                  <div
                    key={idx}
                    className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between gap-3 group hover:border-[#FF0000]/50 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#FF0000]/20 border border-[#FF0000]/30 flex items-center justify-center text-red-300 font-bold text-sm shrink-0">
                        <Tv className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                        <p className="text-xs text-gray-400">YouTube</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleLaunchRoom(item.id, "youtube")}
                      className="p-2 rounded-xl bg-white/5 hover:bg-[#FF0000] text-gray-300 hover:text-white transition cursor-pointer"
                      title="Iniciar Watch Party"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Stats */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <span>Tus Estadísticas</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-panel p-5 rounded-3xl border border-white/10 text-center">
                <Clock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <span className="text-3xl font-black text-white">{user?.statsHoursWatched || 0}h</span>
                <p className="text-xs text-gray-400 uppercase font-semibold mt-1">Horas Sincronizadas</p>
              </div>

              <div className="glass-panel p-5 rounded-3xl border border-white/10 text-center">
                <Trophy className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <span className="text-3xl font-black text-white">{user?.statsRoomsCreated || 0}</span>
                <p className="text-xs text-gray-400 uppercase font-semibold mt-1">Salas Creadas</p>
              </div>

              <div className="glass-panel p-5 rounded-3xl border border-white/10 text-center">
                <Sparkles className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <span className="text-3xl font-black text-white">{user?.statsRoomsJoined || 0}</span>
                <p className="text-xs text-gray-400 uppercase font-semibold mt-1">Salas Visitadas</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Account Settings */}
        {activeTab === "settings" && (
          <div className="max-w-2xl">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-400" />
                  <span>Ajustes de Perfil</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Personaliza tu nombre, foto de perfil y canales vinculados.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                {/* Photo upload */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white/10 flex items-center justify-center border border-white/15 shrink-0">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold block mb-1 text-gray-200">Foto de perfil</label>
                    <p className="text-[11px] text-gray-400 mb-2">
                      Sube cualquier imagen desde tu dispositivo (PNG, JPG, WebP).
                    </p>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Seleccionar Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Nombre Público</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Nombre de Usuario</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Biografía</label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Cuéntanos algo sobre ti..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Usuario de Twitch</label>
                    <input
                      type="text"
                      placeholder="ej. mi_canal_twitch"
                      value={twitchInput}
                      onChange={(e) => setTwitchInput(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Canal de YouTube</label>
                    <input
                      type="text"
                      placeholder="ej. @mi_canal_yt"
                      value={youtubeInput}
                      onChange={(e) => setYoutubeInput(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="liquid-btn-primary px-6 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
