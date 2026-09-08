"use client";

export const dynamic = "force-dynamic";

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
  Compass,
  Play,
  Share2,
  Lock,
  Globe,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface RoomItem {
  id?: string;
  code: string;
  name: string;
  platform: "twitch" | "youtube";
  channel: string;
  category?: string;
  description?: string;
  participantCount?: number;
  maxParticipants?: number;
  isPrivate?: boolean;
  createdAt?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [userRooms, setUserRooms] = useState<RoomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchUserRooms();
  }, [user]);

  const fetchUserRooms = async () => {
    setLoading(true);
    try {
      // If user is authenticated, load their hosted rooms
      if (user?.id) {
        const res = await fetch(`/api/rooms?hostId=${encodeURIComponent(user.id)}`);
        const data = await res.json();
        if (data.rooms && Array.isArray(data.rooms)) {
          setUserRooms(data.rooms);
        } else {
          setUserRooms([]);
        }
      } else {
        setUserRooms([]);
      }
    } catch {
      setUserRooms([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
      <Navbar onCreateRoom={() => setIsCreateModalOpen(true)} />

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
                    {user ? `¡Hola, ${user.name}!` : "Panel de StreamSync"}
                  </h1>
                  {user?.isGuest && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Invitado
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-400">
                  {user?.email || (user?.username ? `@${user.username}` : "Usuario de StreamSync")} • Sincronización WebSockets a 0ms
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

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <Link
                href="/room/demo"
                className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 transition"
              >
                Probar Sala Demo
              </Link>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="liquid-btn-primary flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-xl shadow-purple-600/30 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Nueva Sala</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Hosted Rooms Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Tus Salas de Watch Party</span>
                {userRooms.length > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {userRooms.length}
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-400">
                Salas que has creado y gestionas en tu cuenta.
              </p>
            </div>

            {userRooms.length > 0 && (
              <button
                onClick={fetchUserRooms}
                className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white transition cursor-pointer"
                title="Actualizar"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-44 rounded-3xl bg-white/[0.02] border border-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : userRooms.length === 0 ? (
            /* Required empty state when user has no rooms */
            <div className="p-12 sm:p-16 text-center rounded-3xl border border-white/10 bg-white/[0.02] max-w-xl mx-auto my-8 space-y-4">
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
                  onClick={() => setIsCreateModalOpen(true)}
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

                    <button
                      onClick={() =>
                        router.push(
                          `/room/${room.code}?platform=${room.platform}&stream=${encodeURIComponent(room.channel)}`
                        )
                      }
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

      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          fetchUserRooms();
        }}
      />

      <Footer />
    </div>
  );
}
