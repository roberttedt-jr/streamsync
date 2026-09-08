"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import CreateRoomModal from "@/components/room/CreateRoomModal";
import {
  Users,
  Radio,
  Tv,
  Plus,
  Compass,
  Play,
  Share2,
  Lock,
  Globe,
  Sparkles,
  RefreshCw,
  Link2,
  ExternalLink,
  Flame,
  CheckCircle2,
  KeyRound,
  Trash2,
} from "lucide-react";

interface RoomItem {
  id?: string;
  code: string;
  name: string;
  platform: "twitch";
  channel: string;
  category?: string;
  description?: string;
  participantCount?: number;
  maxParticipants?: number;
  isPrivate?: boolean;
  createdAt?: string;
}

interface FollowedChannelItem {
  id: string;
  platform: "TWITCH";
  channelId: string;
  displayName: string;
  avatarUrl: string | null;
  category: string | null;
  isLive: boolean;
  url: string | null;
  lastSyncedAt: string;
}

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
  canUnlink: false,
  totalAccounts: 0,
};

function DashboardContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();

  // Rooms state
  const [userRooms, setUserRooms] = useState<RoomItem[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [deletingRoomCode, setDeletingRoomCode] = useState<string | null>(null);

  // Integrations & channels state with guaranteed default values
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus>(DEFAULT_STATUS);
  const [channels, setChannels] = useState<FollowedChannelItem[]>([]);
  const [loadingIntegrations, setLoadingIntegrations] = useState(true);
  const [syncingLive, setSyncingLive] = useState(false);

  // Create room modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalPlatform, setModalPlatform] = useState<"twitch">("twitch");
  const [modalChannel, setModalChannel] = useState("");

  // Safe accessors
  const twitch = integrationStatus?.twitch ?? DEFAULT_STATUS.twitch;

  useEffect(() => {
    fetchUserRooms();
    fetchIntegrationsAndChannels();
  }, [user]);

  const fetchUserRooms = async () => {
    setLoadingRooms(true);
    try {
      if (user?.id) {
        const res = await fetch(`/api/rooms?hostId=${encodeURIComponent(user.id)}`);
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data?.rooms && Array.isArray(data.rooms)) {
            setUserRooms(data.rooms);
          } else {
            setUserRooms([]);
          }
        } else {
          setUserRooms([]);
        }
      } else {
        setUserRooms([]);
      }
    } catch {
      setUserRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleDeleteRoom = async (code: string, roomName: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la Watch Party "${roomName}"?`)) {
      return;
    }
    setDeletingRoomCode(code);
    try {
      const res = await fetch(`/api/rooms/${encodeURIComponent(code)}?hostId=${encodeURIComponent(user?.id || "")}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        addToast("Watch Party eliminada correctamente", "success");
        setUserRooms((prev) => prev.filter((r) => r.code !== code));
      } else {
        addToast(data.error || "No se pudo eliminar la sala", "error");
      }
    } catch {
      addToast("Error al conectar para eliminar la sala", "error");
    } finally {
      setDeletingRoomCode(null);
    }
  };

  const fetchIntegrationsAndChannels = async () => {
    setLoadingIntegrations(true);
    try {
      const [statusRes, channelsRes] = await Promise.all([
        fetch("/api/integrations/status"),
        fetch("/api/integrations/channels"),
      ]);

      if (statusRes.ok) {
        const statusData = await statusRes.json().catch(() => null);
        if (statusData && typeof statusData === "object") {
          setIntegrationStatus({
            twitch: statusData.twitch || DEFAULT_STATUS.twitch,
            canUnlink: Boolean(statusData.canUnlink),
            totalAccounts: Number(statusData.totalAccounts || 0),
          });
        }
      }

      if (channelsRes.ok) {
        const channelsData = await channelsRes.json().catch(() => null);
        if (channelsData?.channels && Array.isArray(channelsData.channels)) {
          setChannels(channelsData.channels);
        }
      }
    } catch (err) {
      console.error("Error fetching integrations:", err);
    } finally {
      setLoadingIntegrations(false);
    }
  };

  const handleRefreshLiveStatus = async () => {
    if (!twitch.connected) return;
    if (!twitch.hasFollowsPermission) {
      router.push("/profile?tab=accounts");
      return;
    }
    setSyncingLive(true);
    try {
      const res = await fetch("/api/integrations/twitch/sync", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        addToast(
          `Directos actualizados: ${data.liveCount || 0} streamers en vivo`,
          "success"
        );
        await fetchIntegrationsAndChannels();
      } else {
        addToast(data.message || "Error al actualizar estado de directos", "error");
      }
    } catch {
      addToast("Error al conectar con Twitch", "error");
    } finally {
      setSyncingLive(false);
    }
  };

  const handleOpenCreateWithStream = (platform: "twitch", channel: string) => {
    setModalPlatform("twitch");
    setModalChannel(channel);
    setIsCreateModalOpen(true);
  };

  const liveTwitchChannels = channels.filter(
    (c) => c.platform === "TWITCH" && c.isLive
  );
  const allTwitchChannels = channels.filter((c) => c.platform === "TWITCH");

  const hasAnyAccountConnected = Boolean(twitch.connected);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
      <Navbar
        onCreateRoom={() => {
          setModalPlatform("twitch");
          setModalChannel("");
          setIsCreateModalOpen(true);
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* User Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-purple-950/40 via-purple-900/20 to-cyan-950/30 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white/10 border-2 border-purple-500/40 shadow-inner flex items-center justify-center shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-lg text-purple-300">
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : "SY"}
                  </span>
                )}
                <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#090B10]" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {user ? `¡Hola, ${user.name}!` : "Panel de StreamSync"}
                  </h1>
                  {user?.isGuest && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Invitado
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-400">
                  {user?.email || (user?.username ? `@${user.username}` : "Usuario registrado")} • Watch parties de Twitch en tiempo real
                </p>

                {/* Connected account tags */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {twitch.connected ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#9146FF]/20 text-[#be99ff] border border-[#9146FF]/30">
                      <Radio className="w-3 h-3" />
                      <span>Twitch: {twitch.displayName || "Conectado"}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <Link
                href="/profile"
                className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 transition flex items-center gap-1.5"
              >
                <Link2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Gestionar Cuentas</span>
              </Link>
              <button
                onClick={() => {
                  setModalPlatform("twitch");
                  setModalChannel("");
                  setIsCreateModalOpen(true);
                }}
                className="liquid-btn-primary flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-xl shadow-purple-600/30 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Nueva Sala</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 1: Tu Actividad (Salas creadas por el usuario) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Tu Actividad</span>
                {userRooms.length > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {userRooms.length}
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-400">
                Watch parties activas o creadas por ti en StreamSync.
              </p>
            </div>

            {userRooms.length > 0 && (
              <button
                onClick={fetchUserRooms}
                className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white transition cursor-pointer"
                title="Actualizar salas"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingRooms ? "animate-spin" : ""}`} />
              </button>
            )}
          </div>

          {loadingRooms ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-44 rounded-3xl bg-white/[0.02] border border-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : userRooms.length === 0 ? (
            /* Clean empty state with zero fake data */
            <div className="p-12 sm:p-14 text-center rounded-3xl border border-white/10 bg-white/[0.02] max-w-xl mx-auto my-4 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto shadow-xl">
                <Tv className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Aún no tienes ninguna sala.
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
                  Crea tu primera watch party y comparte un directo con tus amigos o comunidad.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setModalPlatform("twitch");
                    setModalChannel("");
                    setIsCreateModalOpen(true);
                  }}
                  className="liquid-btn-primary px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-600/25 hover:scale-105 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear mi primera sala</span>
                </button>

                <Link
                  href="/explore"
                  className="liquid-btn-secondary px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition"
                >
                  <Compass className="w-4 h-4 text-purple-400" />
                  <span>Explorar salas públicas</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userRooms.map((room) => (
                <div
                  key={room.code}
                  className="glass-panel group p-5 rounded-3xl border border-white/10 hover:border-purple-500/40 transition-all flex flex-col justify-between hover:shadow-xl hover:shadow-purple-900/10"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#9146FF]/20 text-[#be99ff] border border-[#9146FF]/30">
                        <Radio className="w-3 h-3" />
                        <span>Twitch</span>
                      </span>

                      <div className="flex items-center gap-2">
                        {room.isPrivate ? (
                          <span className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            <Lock className="w-3 h-3" />
                            <span>Privada</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            <Globe className="w-3 h-3" />
                            <span>Pública</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition line-clamp-1 mb-1">
                      {room.name}
                    </h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-2">
                      <span className="text-purple-400 font-semibold">Stream:</span>
                      <span className="text-gray-300 font-mono truncate">{room.channel}</span>
                    </p>

                    {room.category && (
                      <span className="inline-block text-[11px] font-medium text-gray-400 bg-white/[0.03] border border-white/5 px-2 py-0.5 rounded-md mb-3">
                        {room.category}
                      </span>
                    )}
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-gray-400 font-mono">
                      Código: #{room.code}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteRoom(room.code, room.name)}
                        disabled={deletingRoomCode === room.code}
                        className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition cursor-pointer disabled:opacity-50"
                        title="Eliminar Watch Party"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() =>
                          router.push(
                            `/room/${room.code}?platform=twitch&stream=${encodeURIComponent(
                              room.channel
                            )}`
                          )
                        }
                        className="liquid-btn-primary px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:scale-105 transition cursor-pointer"
                      >
                        <span>Entrar</span>
                        <Play className="w-3 h-3 fill-current" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION 2: Directos de Twitch en Vivo */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Flame className="w-5 h-5 text-purple-400" />
                <span>Directos de Twitch en Vivo</span>
                {liveTwitchChannels.length > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                    {liveTwitchChannels.length} en vivo
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-400">
                Directos de tus canales seguidos para iniciar watch parties al instante.
              </p>
            </div>

            {twitch.connected && twitch.hasFollowsPermission && (
              <button
                onClick={handleRefreshLiveStatus}
                disabled={syncingLive}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer flex items-center gap-2 text-xs font-semibold self-start sm:self-auto"
                title="Actualizar estado en vivo"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingLive ? "animate-spin" : ""}`} />
                <span>Actualizar</span>
              </button>
            )}
          </div>

          {!twitch.connected ? (
            <div className="p-10 text-center rounded-3xl border border-white/10 bg-white/[0.02] max-w-xl mx-auto my-4 space-y-4">
              <div className="w-14 h-14 rounded-3xl bg-[#9146FF]/10 border border-[#9146FF]/20 text-[#be99ff] flex items-center justify-center mx-auto shadow-xl">
                <Radio className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Conecta tu cuenta de Twitch para ver directos activos.
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
                  Vincula tu cuenta de Twitch para ver tus canales seguidos y
                  lanzar Watch Parties compartidas con un solo clic.
                </p>
              </div>

              <div className="pt-2 flex justify-center">
                <Link
                  href="/profile"
                  className="liquid-btn-primary px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Conectar Twitch</span>
                </Link>
              </div>
            </div>
          ) : !twitch.hasFollowsPermission ? (
            <div className="p-8 text-center rounded-3xl border border-white/10 bg-white/[0.02] max-w-lg mx-auto space-y-3">
              <KeyRound className="w-8 h-8 text-amber-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">Falta permiso de canales seguidos</h4>
              <p className="text-xs text-gray-400">
                Autoriza el acceso a canales seguidos para detectar automáticamente quién está en directo.
              </p>
              <div className="pt-1">
                <Link
                  href="/profile"
                  className="liquid-btn-primary px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Autorizar canales seguidos</span>
                </Link>
              </div>
            </div>
          ) : liveTwitchChannels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveTwitchChannels.map((stream) => (
                <div
                  key={stream.id}
                  className="glass-panel p-5 rounded-3xl border border-white/10 hover:border-[#9146FF]/50 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/30">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span>EN VIVO</span>
                      </span>

                      <span className="text-[11px] text-purple-300 font-semibold">Twitch</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#9146FF]/20 border border-[#9146FF]/30 flex items-center justify-center text-[#be99ff] font-bold text-sm shrink-0">
                        {stream.avatarUrl ? (
                          <img
                            src={stream.avatarUrl}
                            alt={stream.displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{stream.displayName.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition truncate">
                          {stream.displayName}
                        </h3>
                        <p className="text-xs text-gray-400 truncate">
                          {stream.category || "En directo"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    {stream.url && (
                      <a
                        href={stream.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
                        title="Ver en Twitch"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <button
                      onClick={() => handleOpenCreateWithStream("twitch", stream.displayName)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#9146FF] hover:bg-[#772ce8] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg shadow-[#9146FF]/25"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Crear Watch Party con este directo</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center rounded-3xl border border-white/10 bg-white/[0.02] max-w-lg mx-auto space-y-3">
              <Radio className="w-10 h-10 text-gray-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">
                Ninguno de tus canales seguidos está en directo en este momento.
              </h4>
              <p className="text-xs text-gray-400">
                {allTwitchChannels.length > 0
                  ? `Tienes ${allTwitchChannels.length} canales en tu lista. Comprueba de nuevo más tarde o crea una sala con cualquier streamer.`
                  : "Aún no has sincronizado tus canales seguidos de Twitch."}
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={handleRefreshLiveStatus}
                  disabled={syncingLive}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingLive ? "animate-spin" : ""}`} />
                  <span>Comprobar de nuevo</span>
                </button>
                <button
                  onClick={() => {
                    setModalPlatform("twitch");
                    setModalChannel("");
                    setIsCreateModalOpen(true);
                  }}
                  className="liquid-btn-primary px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear sala personalizada</span>
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        defaultPlatform={modalPlatform}
        defaultChannel={modalChannel}
        onClose={() => {
          setIsCreateModalOpen(false);
          fetchUserRooms();
        }}
      />

      <Footer />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
