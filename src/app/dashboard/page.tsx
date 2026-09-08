"use client";

import React, { useState, useEffect } from "react";
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
  Search,
  Flame,
  Clock,
  ExternalLink,
  Shield,
  Volume2,
  Gamepad2,
  Sparkles,
  Play,
  Share2,
} from "lucide-react";

interface RoomItem {
  id?: string;
  code: string;
  name: string;
  platform: "twitch" | "youtube";
  channel: string;
  category?: string;
  participantCount?: number;
  maxParticipants?: number;
  isPrivate?: boolean;
  host?: {
    name?: string;
    username?: string;
  };
}

const QUICK_TRENDING = [
  { name: "valorant", platform: "twitch", label: "VCT Tournaments", viewers: "45.2K" },
  { name: "eslcs", platform: "twitch", label: "CS2 Pro League", viewers: "38.1K" },
  { name: "rocketleague", platform: "twitch", label: "RLCS Championship", viewers: "22.5K" },
  { name: "jfKfPfyJRdk", platform: "youtube", label: "Lofi Girl Chill Beats", viewers: "18.4K" },
  { name: "illojuan", platform: "twitch", label: "IlloJuan Directo", viewers: "31.0K" },
  { name: "4xDzrJKXOOY", platform: "youtube", label: "Synthwave Radio 24/7", viewers: "8.9K" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState<"all" | "twitch" | "youtube">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, [platformFilter]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const url =
        platformFilter === "all"
          ? "/api/rooms"
          : `/api/rooms?platform=${platformFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.rooms) {
        setRooms(data.rooms);
      }
    } catch {
      addToast("Error al cargar las salas", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.name?.toLowerCase().includes(q) ||
      r.channel?.toLowerCase().includes(q) ||
      r.category?.toLowerCase().includes(q)
    );
  });

  const launchQuickParty = (channel: string, platform: "twitch" | "youtube") => {
    const code = `${platform}-${Math.random().toString(36).substring(2, 7)}`;
    router.push(`/room/${code}?platform=${platform}&stream=${encodeURIComponent(channel)}`);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* User Welcome & Stats Banner */}
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
                    {user ? `¡Hola de nuevo, ${user.name}!` : "Panel de StreamSync"}
                  </h1>
                  {user?.isGuest && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Invitado
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-400">
                  {user?.username ? `@${user.username}` : "Modo espectador"} • Salas sincronizadas a 0ms
                </p>

                {/* Connected account pills */}
                <div className="flex items-center gap-2 mt-2">
                  {user?.twitchUsername ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#9146FF]/20 text-[#be99ff] border border-[#9146FF]/30">
                      <Radio className="w-3 h-3" />
                      <span>Twitch: {user.twitchUsername}</span>
                    </span>
                  ) : null}
                  {user?.youtubeHandle ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#FF0000]/20 text-red-300 border border-[#FF0000]/30">
                      <Tv className="w-3 h-3" />
                      <span>YouTube: {user.youtubeHandle}</span>
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Quick stats & action buttons */}
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-4 bg-black/40 border border-white/10 rounded-2xl px-4 py-2 text-center">
                <div>
                  <span className="block text-base font-black text-purple-400">
                    {user?.statsHoursWatched || 2.4}h
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Vistas</span>
                </div>
                <div className="w-[1px] h-6 bg-white/10" />
                <div>
                  <span className="block text-base font-black text-cyan-400">
                    {user?.statsRoomsCreated || 0}
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Creadas</span>
                </div>
                <div className="w-[1px] h-6 bg-white/10" />
                <div>
                  <span className="block text-base font-black text-emerald-400">
                    {user?.statsRoomsJoined || 1}
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Unidas</span>
                </div>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="liquid-btn-primary flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold shadow-xl shadow-purple-600/30 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Nueva Sala</span>
              </button>
            </div>
          </div>
        </div>

        {/* Trending Stream Launchpad */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider">
                Directos recomendados para iniciar sala
              </h2>
            </div>
            <span className="text-xs text-gray-500">Un clic para abrir watch party</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {QUICK_TRENDING.map((item, idx) => (
              <button
                key={idx}
                onClick={() => launchQuickParty(item.name, item.platform as any)}
                className="group p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-purple-500/40 transition-all text-left flex flex-col justify-between cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.platform === "twitch"
                        ? "bg-[#9146FF]/20 text-[#be99ff] border border-[#9146FF]/30"
                        : "bg-[#FF0000]/20 text-red-300 border border-[#FF0000]/30"
                    }`}
                  >
                    {item.platform}
                  </span>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {item.viewers}
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-purple-300 transition truncate">
                    {item.label}
                  </h3>
                  <p className="text-[10px] text-gray-400 truncate">@{item.name}</p>
                </div>
                <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-purple-400 font-semibold opacity-0 group-hover:opacity-100 transition">
                  <span>Abrir sala</span>
                  <Play className="w-3 h-3 fill-current" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Watch Parties Directory Section */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Watch Parties Activas</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {filteredRooms.length}
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Únete a una sala comunitaria con voz en tiempo real o busca por juego.
              </p>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Platform Pills */}
              <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setPlatformFilter("all")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    platformFilter === "all"
                      ? "bg-purple-600 text-white shadow"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setPlatformFilter("twitch")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer ${
                    platformFilter === "twitch"
                      ? "bg-[#9146FF] text-white shadow"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Radio className="w-3 h-3" />
                  <span>Twitch</span>
                </button>
                <button
                  onClick={() => setPlatformFilter("youtube")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer ${
                    platformFilter === "youtube"
                      ? "bg-[#FF0000] text-white shadow"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Tv className="w-3 h-3" />
                  <span>YouTube</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar sala o canal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 w-44 sm:w-56 transition"
                />
              </div>
            </div>
          </div>

          {/* Rooms Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-44 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
              ))}
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-white/10 bg-white/[0.02]">
              <Gamepad2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">No se encontraron salas activas</h3>
              <p className="text-xs text-gray-400 mb-4 max-w-sm mx-auto">
                No hay salas que coincidan con tu búsqueda. Sé el primero en crear una sala con tus amigos.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="liquid-btn-primary px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Crear mi Watch Party</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRooms.map((room) => (
                <div
                  key={room.code}
                  className="glass-panel group p-5 rounded-3xl border border-white/10 hover:border-purple-500/40 transition-all flex flex-col justify-between hover:shadow-xl hover:shadow-purple-900/10"
                >
                  <div>
                    {/* Header: Platform badge & Live status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                          room.platform === "twitch"
                            ? "bg-[#9146FF]/20 text-[#be99ff] border border-[#9146FF]/30"
                            : "bg-[#FF0000]/20 text-red-300 border border-[#FF0000]/30"
                        }`}
                      >
                        {room.platform === "twitch" ? <Radio className="w-3 h-3" /> : <Tv className="w-3 h-3" />}
                        <span>{room.platform}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 text-xs text-gray-300 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full font-mono">
                          <Users className="w-3 h-3 text-cyan-400" />
                          <span>{room.participantCount || 1} / {room.maxParticipants || 25}</span>
                        </span>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                      </div>
                    </div>

                    {/* Room Title & Channel */}
                    <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition line-clamp-1 mb-1">
                      {room.name}
                    </h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-3">
                      <span className="text-purple-400 font-semibold">Canal:</span>
                      <span className="text-gray-300 font-medium truncate">
                        {room.channel || "Pantalla de espera"}
                      </span>
                    </p>

                    {/* Category tag */}
                    {room.category && (
                      <span className="inline-block text-[11px] font-medium text-gray-400 bg-white/[0.03] border border-white/5 px-2.5 py-0.5 rounded-md mb-4">
                        {room.category}
                      </span>
                    )}
                  </div>

                  {/* Footer of card */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-gray-400 truncate">
                      Host: <strong className="text-gray-200">{room.host?.name || "Comunidad"}</strong>
                    </span>

                    <button
                      onClick={() => router.push(`/room/${room.code}?platform=${room.platform}&stream=${encodeURIComponent(room.channel)}`)}
                      className="liquid-btn-primary px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:scale-105 transition cursor-pointer"
                    >
                      <span>Entrar</span>
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <Footer />
    </div>
  );
}
