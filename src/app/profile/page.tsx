"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
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
  RefreshCw,
  Unlink,
  Link2,
  AlertCircle,
  X,
  KeyRound,
} from "lucide-react";

interface IntegrationStatus {
  twitch: {
    connected: boolean;
    hasFollowsPermission: boolean;
    displayName: string | null;
    avatarUrl: string | null;
    channelsCount: number;
    liveCount: number;
    lastSyncedAt: string | null;
  };
  youtube: {
    connected: boolean;
    hasYoutubePermission: boolean;
    displayName: string | null;
    avatarUrl: string | null;
    channelsCount: number;
    lastSyncedAt: string | null;
  };
  canUnlink: boolean;
  totalAccounts: number;
}

const DEFAULT_STATUS: IntegrationStatus = {
  twitch: {
    connected: false,
    hasFollowsPermission: false,
    displayName: null,
    avatarUrl: null,
    channelsCount: 0,
    liveCount: 0,
    lastSyncedAt: null,
  },
  youtube: {
    connected: false,
    hasYoutubePermission: false,
    displayName: null,
    avatarUrl: null,
    channelsCount: 0,
    lastSyncedAt: null,
  },
  canUnlink: false,
  totalAccounts: 0,
};

interface FollowedChannelItem {
  id: string;
  platform: "TWITCH" | "YOUTUBE";
  channelId: string;
  displayName: string;
  avatarUrl: string | null;
  category: string | null;
  isLive: boolean;
  url: string | null;
  lastSyncedAt: string;
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout, refreshUser, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    "accounts" | "twitch" | "youtube" | "history" | "stats" | "settings"
  >("accounts");

  // Integration state with guaranteed safe default values
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus>(DEFAULT_STATUS);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [syncingTwitch, setSyncingTwitch] = useState(false);
  const [syncingYoutube, setSyncingYoutube] = useState(false);
  const [youtubeSyncError, setYoutubeSyncError] = useState<string | null>(null);

  // Channels state
  const [twitchChannels, setTwitchChannels] = useState<FollowedChannelItem[]>([]);
  const [youtubeChannels, setYoutubeChannels] = useState<FollowedChannelItem[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [newTwitchChannel, setNewTwitchChannel] = useState("");
  const [newYtChannel, setNewYtChannel] = useState("");

  // Unlink modal
  const [unlinkModalProvider, setUnlinkModalProvider] = useState<"twitch" | "google" | null>(null);
  const [unlinking, setUnlinking] = useState(false);

  // Profile edit settings
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [saving, setSaving] = useState(false);

  // Real watch history (zero fake data)
  const [history] = useState<
    { id: string; roomName: string; platform: "twitch" | "youtube"; channel: string; date: string }[]
  >([]);

  // Safe accessor shortcuts
  const twitch = integrationStatus?.twitch ?? DEFAULT_STATUS.twitch;
  const youtube = integrationStatus?.youtube ?? DEFAULT_STATUS.youtube;
  const canUnlink = integrationStatus?.canUnlink ?? false;

  // Keep state in sync with user
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setUsername(user.username || "");
      setBio(user.bio || "");
      setAvatarPreview(user.avatar || "");
    }
  }, [user]);

  // Handle URL query parameters safely
  useEffect(() => {
    if (!searchParams) return;
    const linkedParam = searchParams.get("linked");
    const syncParam = searchParams.get("sync");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      if (errorParam === "AccountAlreadyLinked") {
        addToast(
          "Esta cuenta externa ya está vinculada a otro usuario. No es posible fusionarla.",
          "error"
        );
      } else if (errorParam === "AccessDenied" || errorParam === "OAuthCallback") {
        addToast("Autorización cancelada o denegada.", "info");
      } else {
        addToast("Ocurrió un aviso durante la autenticación.", "info");
      }
      router.replace("/profile");
      return;
    }

    if (linkedParam) {
      const provName = linkedParam === "twitch" ? "Twitch" : "Google/YouTube";
      addToast(`¡Cuenta de ${provName} vinculada con éxito!`, "success");
      refreshUser();
      fetchIntegrationStatus();
      router.replace("/profile");
      return;
    }

    if (syncParam === "twitch") {
      addToast("Permisos concedidos. Sincronizando canales de Twitch...", "info");
      router.replace("/profile");
      executeTwitchSync();
      return;
    }

    if (syncParam === "youtube") {
      addToast("Permisos concedidos. Ya puedes sincronizar tus suscripciones de YouTube.", "success");
      fetchIntegrationStatus();
      router.replace("/profile");
      return;
    }
  }, [searchParams]);

  // Fetch integration status and channels
  useEffect(() => {
    fetchIntegrationStatus();
    fetchChannels();
  }, [user]);

  const fetchIntegrationStatus = async () => {
    try {
      setLoadingStatus(true);
      const res = await fetch("/api/integrations/status");
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === "object") {
          setIntegrationStatus({
            twitch: data.twitch || DEFAULT_STATUS.twitch,
            youtube: data.youtube || DEFAULT_STATUS.youtube,
            canUnlink: Boolean(data.canUnlink),
            totalAccounts: Number(data.totalAccounts || 0),
          });
        }
      }
    } catch (err) {
      console.error("Error fetching integration status:", err);
    } finally {
      setLoadingStatus(false);
    }
  };

  const fetchChannels = async () => {
    try {
      setLoadingChannels(true);
      const res = await fetch("/api/integrations/channels");
      if (res.ok) {
        const data = await res.json();
        const items: FollowedChannelItem[] = Array.isArray(data?.channels) ? data.channels : [];
        setTwitchChannels(items.filter((c) => c.platform === "TWITCH"));
        setYoutubeChannels(items.filter((c) => c.platform === "YOUTUBE"));
      }
    } catch (err) {
      console.error("Error fetching channels:", err);
    } finally {
      setLoadingChannels(false);
    }
  };

  // Safe Connect Provider
  const handleConnectProvider = (provider: "twitch" | "google") => {
    signIn(provider, { callbackUrl: `/profile?linked=${provider}` });
  };

  // Safe Authorize Twitch Follows
  const handleAuthorizeTwitch = () => {
    signIn(
      "twitch",
      { callbackUrl: "/profile?sync=twitch" },
      { scope: "openid user:read:email user:read:follows" }
    );
  };

  // Execute Twitch Sync (only when connected and has permission)
  const executeTwitchSync = async () => {
    setSyncingTwitch(true);
    try {
      const res = await fetch("/api/integrations/twitch/sync", { method: "POST" });
      const data = await res.json().catch(() => ({}));

      if (res.status === 403 && data.error === "MissingScope") {
        addToast("Se requiere permiso para leer seguidos. Pulsa en Autorizar canales seguidos.", "info");
        await fetchIntegrationStatus();
        return;
      }

      if (res.ok && data.success) {
        addToast(
          `Canales de Twitch sincronizados: ${data.count || 0} seguidos (${data.liveCount || 0} en directo)`,
          "success"
        );
        await Promise.all([fetchIntegrationStatus(), fetchChannels(), refreshUser()]);
      } else {
        addToast(data.message || "Error al sincronizar Twitch", "error");
      }
    } catch {
      addToast("Error de conexión al sincronizar Twitch", "error");
    } finally {
      setSyncingTwitch(false);
    }
  };

  // Safe Twitch Sync Click Handler
  const handleTwitchSyncClick = () => {
    if (!twitch.connected) {
      handleConnectProvider("twitch");
      return;
    }
    if (!twitch.hasFollowsPermission) {
      handleAuthorizeTwitch();
      return;
    }
    executeTwitchSync();
  };

  // Safe Authorize YouTube Subscriptions
  const handleAuthorizeYoutube = () => {
    signIn(
      "google",
      { callbackUrl: "/profile?sync=youtube" },
      {
        scope: "openid email profile https://www.googleapis.com/auth/youtube.readonly",
        prompt: "consent",
        access_type: "offline",
      }
    );
  };

  // Execute YouTube Sync (only when connected and has permission)
  const executeYoutubeSync = async () => {
    setSyncingYoutube(true);
    setYoutubeSyncError(null);
    try {
      const res = await fetch("/api/integrations/youtube/sync", { method: "POST" });
      const data = await res.json().catch(() => ({}));

      if (res.status === 403 && (data.error === "MissingScope" || data.code === "YOUTUBE_PERMISSION_REQUIRED")) {
        const msg = "Se requiere permiso para leer suscripciones. Pulsa en Autorizar suscripciones.";
        setYoutubeSyncError(msg);
        addToast(msg, "info");
        await fetchIntegrationStatus();
        return;
      }

      if (res.ok && (data.success || data.ok)) {
        if (data.count === 0) {
          addToast("No tienes suscripciones disponibles para importar en YouTube.", "info");
        } else {
          addToast(`Suscripciones de YouTube sincronizadas: ${data.count || 0} canales`, "success");
        }
        await Promise.all([fetchIntegrationStatus(), fetchChannels(), refreshUser()]);
      } else {
        const errorMsg = data.message || "Error al sincronizar YouTube";
        setYoutubeSyncError(errorMsg);
        addToast(errorMsg, "error");
      }
    } catch {
      const connErr = "Error de conexión al sincronizar YouTube";
      setYoutubeSyncError(connErr);
      addToast(connErr, "error");
    } finally {
      setSyncingYoutube(false);
    }
  };

  // Safe YouTube Click Handler (Enforces the 3-state flow)
  const handleYoutubeClick = () => {
    if (!youtube.connected) {
      handleConnectProvider("google");
      return;
    }
    if (!youtube.hasYoutubePermission) {
      handleAuthorizeYoutube();
      return;
    }
    executeYoutubeSync();
  };

  // Safe Unlink Account
  const handleConfirmUnlink = async () => {
    if (!unlinkModalProvider) return;

    if (!canUnlink) {
      addToast("No puedes desconectar tu único método de inicio de sesión.", "error");
      setUnlinkModalProvider(null);
      return;
    }

    setUnlinking(true);
    try {
      const res = await fetch("/api/integrations/unlink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: unlinkModalProvider }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        addToast(data.message || "Cuenta desconectada", "info");
        await Promise.all([fetchIntegrationStatus(), fetchChannels(), refreshUser()]);
      } else {
        addToast(data.message || data.error || "Error al desconectar cuenta", "error");
      }
    } catch {
      addToast("Error al procesar la desconexión", "error");
    } finally {
      setUnlinking(false);
      setUnlinkModalProvider(null);
    }
  };

  // Avatar upload
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

  // Save settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateProfile({
      name,
      username,
      bio,
      avatar: avatarPreview,
    });
    setSaving(false);
    if (res?.success) {
      addToast("Perfil actualizado correctamente", "success");
      refreshUser();
    } else {
      addToast(res?.error || "Error al actualizar perfil", "error");
    }
  };

  // Manual channel additions
  const handleAddManualTwitch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTwitchChannel.trim()) return;
    const clean = newTwitchChannel.trim().toLowerCase().replace("@", "");
    const tempItem: FollowedChannelItem = {
      id: `manual_${clean}_${Date.now()}`,
      platform: "TWITCH",
      channelId: clean,
      displayName: clean,
      avatarUrl: null,
      category: null,
      isLive: false,
      url: `https://twitch.tv/${clean}`,
      lastSyncedAt: new Date().toISOString(),
    };
    setTwitchChannels((prev) => [tempItem, ...prev]);
    setNewTwitchChannel("");
    addToast(`Canal @${clean} añadido a tu lista`, "success");
  };

  const handleAddManualYoutube = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYtChannel.trim()) return;
    const clean = newYtChannel.trim();
    const tempItem: FollowedChannelItem = {
      id: `manual_yt_${clean}_${Date.now()}`,
      platform: "YOUTUBE",
      channelId: clean,
      displayName: clean,
      avatarUrl: null,
      category: "YouTube",
      isLive: false,
      url: `https://youtube.com/${clean}`,
      lastSyncedAt: new Date().toISOString(),
    };
    setYoutubeChannels((prev) => [tempItem, ...prev]);
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
        {/* Profile Header Banner */}
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
                {user?.bio || "Perfil de usuario en StreamSync. Watch parties sincronizadas a 0ms."}
              </p>

              {/* Connected Accounts Pills */}
              <div className="flex flex-wrap items-center gap-2 mt-4 justify-center sm:justify-start">
                {twitch.connected ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-[#9146FF]/20 text-[#be99ff] border border-[#9146FF]/30">
                    <Radio className="w-3.5 h-3.5" />
                    <span>Twitch: {twitch.displayName || "Conectado"}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-medium bg-white/5 text-gray-400 border border-white/5">
                    Twitch no conectado
                  </span>
                )}

                {youtube.connected ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-[#FF0000]/20 text-red-300 border border-[#FF0000]/30">
                    <Tv className="w-3.5 h-3.5" />
                    <span>YouTube: {youtube.displayName || "Conectado"}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
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
            onClick={() => setActiveTab("accounts")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 cursor-pointer ${
              activeTab === "accounts"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>Cuentas Conectadas</span>
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
            {twitchChannels.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                {twitchChannels.length}
              </span>
            )}
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
            {youtubeChannels.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                {youtubeChannels.length}
              </span>
            )}
          </button>

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

        {/* TAB 1: Cuentas Conectadas */}
        {activeTab === "accounts" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Link2 className="w-5 h-5 text-purple-400" />
                <span>Cuentas Conectadas e Integraciones</span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Conecta Twitch y YouTube/Google para importar tus canales seguidos y crear Watch Parties sincronizadas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Twitch Account Card */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#9146FF]/20 border border-[#9146FF]/40 flex items-center justify-center text-[#be99ff]">
                        <Radio className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">Twitch</h3>
                        <p className="text-xs text-gray-400">Emisiones en directo y canales seguidos</p>
                      </div>
                    </div>

                    {twitch.connected ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Conectada</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-gray-400 border border-white/10">
                        <span>No conectada</span>
                      </span>
                    )}
                  </div>

                  {twitch.connected ? (
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Usuario vinculado:</span>
                        <span className="font-bold text-white font-mono">
                          @{twitch.displayName || "twitch_user"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Canales seguidos:</span>
                        <span className="font-bold text-purple-300">
                          {twitch.channelsCount} canales ({twitch.liveCount} en directo)
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Permisos:</span>
                        {twitch.hasFollowsPermission ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Canales seguidos activos</span>
                          </span>
                        ) : (
                          <span className="text-amber-400 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Falta permiso de canales seguidos</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Vincula tu cuenta de Twitch para sincronizar tus streamers seguidos y crear
                      watch parties automáticamente cuando estén en vivo.
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                  {!twitch.connected ? (
                    <button
                      onClick={() => handleConnectProvider("twitch")}
                      className="w-full py-2.5 rounded-xl bg-[#9146FF] hover:bg-[#772ce8] text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-[#9146FF]/25"
                    >
                      <Radio className="w-4 h-4" />
                      <span>Conectar Twitch</span>
                    </button>
                  ) : !twitch.hasFollowsPermission ? (
                    <>
                      <button
                        onClick={handleAuthorizeTwitch}
                        className="liquid-btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-600/25"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Autorizar canales seguidos</span>
                      </button>

                      <button
                        onClick={() => {
                          if (!canUnlink) {
                            addToast("No puedes desconectar tu único método de inicio de sesión.", "error");
                            return;
                          }
                          setUnlinkModalProvider("twitch");
                        }}
                        disabled={!canUnlink}
                        title={!canUnlink ? "Es tu único método de login" : "Desconectar Twitch"}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                      >
                        <Unlink className="w-3.5 h-3.5" />
                        <span>Desconectar</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleTwitchSyncClick}
                        disabled={syncingTwitch}
                        className="liquid-btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${syncingTwitch ? "animate-spin" : ""}`} />
                        <span>{syncingTwitch ? "Sincronizando..." : "Sincronizar seguidos"}</span>
                      </button>

                      <button
                        onClick={() => {
                          if (!canUnlink) {
                            addToast("No puedes desconectar tu único método de inicio de sesión.", "error");
                            return;
                          }
                          setUnlinkModalProvider("twitch");
                        }}
                        disabled={!canUnlink}
                        title={!canUnlink ? "Es tu único método de login" : "Desconectar Twitch"}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                      >
                        <Unlink className="w-3.5 h-3.5" />
                        <span>Desconectar</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* YouTube / Google Account Card (Strict 3-State Flow) */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#FF0000]/20 border border-[#FF0000]/40 flex items-center justify-center text-red-400">
                        <Tv className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">YouTube / Google</h3>
                        <p className="text-xs text-gray-400">Suscripciones y canales de YouTube</p>
                      </div>
                    </div>

                    {youtube.connected ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Conectada</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-gray-400 border border-white/10">
                        <span>No conectada</span>
                      </span>
                    )}
                  </div>

                  {youtube.connected ? (
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Cuenta vinculada:</span>
                        <span className="font-bold text-white font-mono">
                          {youtube.displayName || "Google Account"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Suscripciones sincronizadas:</span>
                        <span className="font-bold text-red-300">
                          {youtube.channelsCount} canales
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Permisos:</span>
                        {youtube.hasYoutubePermission ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Acceso a suscripciones concedido</span>
                          </span>
                        ) : (
                          <span className="text-amber-400 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Requiere autorización de lectura de YouTube</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Conecta tu cuenta de Google/YouTube para acceder a tus canales suscritos y
                      reproducir vídeos sincronizados en tus watch parties.
                    </p>
                  )}

                  {youtubeSyncError && (
                    <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                        <span className="truncate">{youtubeSyncError}</span>
                      </div>
                      <button
                        onClick={executeYoutubeSync}
                        disabled={syncingYoutube}
                        className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-semibold transition shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        Reintentar
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                  {/* State 1: YouTube NOT connected -> ONLY "Conectar YouTube" */}
                  {!youtube.connected ? (
                    <button
                      onClick={() => handleConnectProvider("google")}
                      className="w-full py-2.5 rounded-xl bg-[#FF0000] hover:bg-[#cc0000] text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-red-600/25"
                    >
                      <Tv className="w-4 h-4" />
                      <span>Conectar YouTube</span>
                    </button>
                  ) : !youtube.hasYoutubePermission ? (
                    /* State 2: YouTube connected WITHOUT expanded permission -> ONLY "Autorizar suscripciones" */
                    <>
                      <button
                        onClick={handleAuthorizeYoutube}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF0000] hover:bg-[#cc0000] text-white transition flex items-center gap-2 cursor-pointer shadow-lg shadow-red-600/20"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Autorizar suscripciones</span>
                      </button>

                      <button
                        onClick={() => {
                          if (!canUnlink) {
                            addToast("No puedes desconectar tu único método de inicio de sesión.", "error");
                            return;
                          }
                          setUnlinkModalProvider("google");
                        }}
                        disabled={!canUnlink}
                        title={!canUnlink ? "Es tu único método de login" : "Desconectar YouTube"}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                      >
                        <Unlink className="w-3.5 h-3.5" />
                        <span>Desconectar</span>
                      </button>
                    </>
                  ) : (
                    /* State 3: YouTube connected WITH permission -> "Sincronizar suscripciones" */
                    <>
                      <button
                        onClick={handleYoutubeClick}
                        disabled={syncingYoutube}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF0000] hover:bg-[#cc0000] text-white transition flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg shadow-red-600/20"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${syncingYoutube ? "animate-spin" : ""}`} />
                        <span>
                          {syncingYoutube ? "Sincronizando..." : "Sincronizar suscripciones"}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          if (!canUnlink) {
                            addToast("No puedes desconectar tu único método de inicio de sesión.", "error");
                            return;
                          }
                          setUnlinkModalProvider("google");
                        }}
                        disabled={!canUnlink}
                        title={!canUnlink ? "Es tu único método de login" : "Desconectar YouTube"}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                      >
                        <Unlink className="w-3.5 h-3.5" />
                        <span>Desconectar</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Twitch Channels (From Neon DB) */}
        {activeTab === "twitch" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-[#9146FF]" />
                  <span>Tus Canales de Twitch</span>
                  {twitchChannels.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#9146FF]/20 text-[#be99ff] border border-[#9146FF]/30">
                      {twitchChannels.length}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-gray-400">
                  Canales seguidos reales vinculados desde tu cuenta de Twitch o añadidos a tu lista.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {twitch.connected && twitch.hasFollowsPermission && (
                  <button
                    onClick={executeTwitchSync}
                    disabled={syncingTwitch}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#9146FF]/20 hover:bg-[#9146FF]/30 text-[#be99ff] border border-[#9146FF]/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingTwitch ? "animate-spin" : ""}`} />
                    <span>Sincronizar</span>
                  </button>
                )}

                <form onSubmit={handleAddManualTwitch} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Añadir streamer..."
                    value={newTwitchChannel}
                    onChange={(e) => setNewTwitchChannel(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#9146FF] w-40 sm:w-48"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-[#9146FF] hover:bg-[#772ce8] text-white transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

            {loadingChannels ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
                ))}
              </div>
            ) : twitchChannels.length === 0 ? (
              <div className="p-12 text-center rounded-3xl border border-white/10 bg-white/[0.02] max-w-lg mx-auto space-y-4">
                <Radio className="w-10 h-10 text-gray-600 mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-white">
                    No tienes canales de Twitch sincronizados aún.
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    {!twitch.connected
                      ? "Conecta tu cuenta de Twitch para importar automáticamente tus creadores seguidos."
                      : !twitch.hasFollowsPermission
                      ? "Autoriza el acceso a canales seguidos para importarlos automáticamente."
                      : "Pulsa en Sincronizar seguidos para descargar tu lista en vivo."}
                  </p>
                </div>
                {!twitch.connected ? (
                  <button
                    onClick={() => handleConnectProvider("twitch")}
                    className="px-4 py-2 rounded-xl bg-[#9146FF] hover:bg-[#772ce8] text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Conectar Twitch</span>
                  </button>
                ) : !twitch.hasFollowsPermission ? (
                  <button
                    onClick={handleAuthorizeTwitch}
                    className="liquid-btn-primary px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Autorizar canales seguidos</span>
                  </button>
                ) : (
                  <button
                    onClick={executeTwitchSync}
                    disabled={syncingTwitch}
                    className="liquid-btn-primary px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingTwitch ? "animate-spin" : ""}`} />
                    <span>Sincronizar ahora</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {twitchChannels.map((item) => (
                  <div
                    key={item.id}
                    className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between gap-3 group hover:border-[#9146FF]/50 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[#9146FF]/20 border border-[#9146FF]/30 flex items-center justify-center text-[#be99ff] font-bold text-sm shrink-0">
                        {item.avatarUrl ? (
                          <img
                            src={item.avatarUrl}
                            alt={item.displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{item.displayName.slice(0, 2).toUpperCase()}</span>
                        )}
                        {item.isLive && (
                          <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border border-[#090B10]" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-white truncate">
                            {item.displayName}
                          </h4>
                          {item.isLive && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/30">
                              EN VIVO
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 truncate">
                          {item.category || "Twitch Streamer"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
                          title="Ver en Twitch"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => handleLaunchRoom(item.displayName, "twitch")}
                        className="p-2 rounded-xl bg-[#9146FF]/20 hover:bg-[#9146FF] text-[#be99ff] hover:text-white transition cursor-pointer"
                        title="Iniciar Watch Party con este canal"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: YouTube Channels (From Neon DB) */}
        {activeTab === "youtube" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Tv className="w-5 h-5 text-[#FF0000]" />
                  <span>Tus Canales de YouTube</span>
                  {youtubeChannels.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#FF0000]/20 text-red-300 border border-[#FF0000]/30">
                      {youtubeChannels.length}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-gray-400">
                  Suscripciones reales importadas desde tu cuenta de YouTube o añadidas a tu lista.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {youtube.connected && youtube.hasYoutubePermission && (
                  <button
                    onClick={executeYoutubeSync}
                    disabled={syncingYoutube}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#FF0000]/20 hover:bg-[#FF0000]/30 text-red-300 border border-[#FF0000]/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingYoutube ? "animate-spin" : ""}`} />
                    <span>Sincronizar</span>
                  </button>
                )}

                <form onSubmit={handleAddManualYoutube} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Añadir canal / URL..."
                    value={newYtChannel}
                    onChange={(e) => setNewYtChannel(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF0000] w-40 sm:w-48"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-[#FF0000] hover:bg-[#cc0000] text-white transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

            {youtubeSyncError && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span className="truncate">{youtubeSyncError}</span>
                </div>
                <button
                  onClick={executeYoutubeSync}
                  disabled={syncingYoutube}
                  className="px-3 py-1 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-semibold transition shrink-0 cursor-pointer disabled:opacity-50"
                >
                  Reintentar
                </button>
              </div>
            )}

            {loadingChannels ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
                ))}
              </div>
            ) : youtubeChannels.length === 0 ? (
              <div className="p-12 text-center rounded-3xl border border-white/10 bg-white/[0.02] max-w-lg mx-auto space-y-4">
                <Tv className="w-10 h-10 text-gray-600 mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-white">
                    No tienes canales de YouTube sincronizados aún.
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    {!youtube.connected
                      ? "Conecta tu cuenta de Google/YouTube para acceder a tus contenidos suscritos."
                      : !youtube.hasYoutubePermission
                      ? "Autoriza el permiso de suscripciones para importarlas de forma segura."
                      : "Pulsa en Sincronizar suscripciones para descargar tu lista."}
                  </p>
                </div>
                {!youtube.connected ? (
                  <button
                    onClick={() => handleConnectProvider("google")}
                    className="px-4 py-2 rounded-xl bg-[#FF0000] hover:bg-[#cc0000] text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition shadow-lg shadow-red-600/25"
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>Conectar YouTube</span>
                  </button>
                ) : !youtube.hasYoutubePermission ? (
                  <button
                    onClick={handleAuthorizeYoutube}
                    className="px-4 py-2 rounded-xl bg-[#FF0000] hover:bg-[#cc0000] text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition shadow-lg shadow-red-600/20"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Autorizar suscripciones</span>
                  </button>
                ) : (
                  <button
                    onClick={executeYoutubeSync}
                    disabled={syncingYoutube}
                    className="px-4 py-2 rounded-xl bg-[#FF0000] hover:bg-[#cc0000] text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition shadow-lg shadow-red-600/20"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingYoutube ? "animate-spin" : ""}`} />
                    <span>Sincronizar ahora</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {youtubeChannels.map((item) => (
                  <div
                    key={item.id}
                    className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between gap-3 group hover:border-[#FF0000]/50 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#FF0000]/20 border border-[#FF0000]/30 flex items-center justify-center text-red-300 font-bold text-sm shrink-0">
                        {item.avatarUrl ? (
                          <img
                            src={item.avatarUrl}
                            alt={item.displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Tv className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{item.displayName}</h4>
                        <p className="text-xs text-gray-400">YouTube</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
                          title="Ver en YouTube"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => handleLaunchRoom(item.displayName, "youtube")}
                        className="p-2 rounded-xl bg-[#FF0000]/20 hover:bg-[#FF0000] text-red-300 hover:text-white transition cursor-pointer"
                        title="Iniciar Watch Party con este canal"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: History */}
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

        {/* TAB 5: Stats */}
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

        {/* TAB 6: Settings */}
        {activeTab === "settings" && (
          <div className="max-w-2xl">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-400" />
                  <span>Ajustes de Perfil</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Personaliza tu nombre, foto de perfil y biografía pública.
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
                      Sube una imagen desde tu dispositivo (PNG, JPG, WebP máx 2MB).
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

      {/* Unlink Account Confirmation Modal */}
      {unlinkModalProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-white/10 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">
                  Desconectar {unlinkModalProvider === "twitch" ? "Twitch" : "YouTube"}
                </h3>
              </div>
              <button
                onClick={() => setUnlinkModalProvider(null)}
                className="p-1 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              ¿Estás seguro de que quieres desconectar tu cuenta de{" "}
              <strong className="text-white">
                {unlinkModalProvider === "twitch" ? "Twitch" : "Google/YouTube"}
              </strong>
              ? Se eliminarán de StreamSync tus canales sincronizados correspondientes a esta plataforma.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setUnlinkModalProvider(null)}
                disabled={unlinking}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmUnlink}
                disabled={unlinking}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span>{unlinking ? "Desconectando..." : "Confirmar Desconexión"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
