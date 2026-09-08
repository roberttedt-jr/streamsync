"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import CreateRoomModal from "@/components/room/CreateRoomModal";
import { CATEGORIES } from "@/lib/categories";
import {
  Compass,
  Search,
  Radio,
  Tv,
  Users,
  Play,
  Plus,
  Layers,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface RoomItem {
  id?: string;
  code: string;
  name: string;
  platform: "twitch" | "youtube";
  channel: string;
  streamUrl?: string;
  category?: string;
  description?: string;
  participantCount?: number;
  maxParticipants?: number;
  isPrivate?: boolean;
  host?: {
    name?: string;
    username?: string;
    image?: string;
  };
}

export default function ExplorePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPlatform, setSelectedPlatform] = useState<"all" | "twitch" | "youtube">("all");
  const [search, setSearch] = useState("");
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, [selectedCategory, selectedPlatform]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedPlatform !== "all") params.append("platform", selectedPlatform);
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (search.trim()) params.append("search", search.trim());

      const res = await fetch(`/api/rooms?${params.toString()}`);
      const data = await res.json();
      if (data.rooms) {
        setRooms(data.rooms);
      } else {
        setRooms([]);
      }
    } catch {
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRooms();
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
      <Navbar onCreateRoom={() => setIsCreateModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Explore Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>Directorio en Tiempo Real</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Explorar Watch Parties Públicas
            </h1>
            <p className="text-sm text-gray-400 max-w-2xl mt-1">
              Descubre qué salas públicas están activas en este momento o crea la tuya para ver cualquier directo con amigos.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/room/demo"
              className="px-4 py-2.5 rounded-2xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition"
            >
              Probar Demo
            </Link>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="liquid-btn-primary flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-purple-600/25 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Crear una sala pública</span>
            </button>
          </div>
        </div>

        {/* Search & Platform Filter Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por nombre o stream..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
            />
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-end overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedPlatform("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer ${
                selectedPlatform === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              Todas las plataformas
            </button>
            <button
              onClick={() => setSelectedPlatform("twitch")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                selectedPlatform === "twitch"
                  ? "bg-[#9146FF] text-white"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Twitch</span>
            </button>
            <button
              onClick={() => setSelectedPlatform("youtube")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                selectedPlatform === "youtube"
                  ? "bg-[#FF0000] text-white"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>YouTube</span>
            </button>

            <button
              onClick={fetchRooms}
              className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white transition cursor-pointer"
              title="Actualizar salas"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* 22 Categories Filter Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition shrink-0 cursor-pointer ${
              selectedCategory === "all"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "bg-white/5 text-gray-400 hover:text-white border border-white/5"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Todas</span>
          </button>

          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = selectedCategory === cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(active ? "all" : cat.name)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  active
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 scale-105"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Real Rooms Grid / Professional Empty State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-48 rounded-3xl bg-white/[0.02] border border-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          /* Exact Empty State required by specification */
          <div className="p-12 sm:p-16 text-center rounded-3xl border border-white/10 bg-white/[0.02] max-w-2xl mx-auto my-8 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto shadow-xl">
              <Compass className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                No hay salas públicas activas ahora.
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
                Sé el primero en crear una y reúne a tu comunidad alrededor de un directo.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="liquid-btn-primary px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer shadow-xl shadow-purple-600/25 hover:scale-105 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Crear una sala pública</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rooms.map((room) => (
              <div
                key={room.code}
                className="glass-panel group p-5 rounded-3xl border border-white/10 hover:border-purple-500/40 transition-all flex flex-col justify-between hover:shadow-xl hover:shadow-purple-900/10"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
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
                        <span>{room.participantCount || 0} / {room.maxParticipants || 10}</span>
                      </span>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition line-clamp-1 mb-1">
                    {room.name}
                  </h3>

                  {room.description && (
                    <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                      {room.description}
                    </p>
                  )}

                  <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-3">
                    <span className="text-purple-400 font-semibold">Stream:</span>
                    <span className="text-gray-200 font-mono truncate">{room.channel}</span>
                  </p>

                  {room.category && (
                    <span className="inline-block text-[11px] font-medium text-gray-300 bg-white/[0.04] border border-white/10 px-2.5 py-0.5 rounded-lg mb-2">
                      {room.category}
                    </span>
                  )}
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-gray-400 truncate">
                    Host: <strong className="text-gray-200">{room.host?.name || "Comunidad"}</strong>
                  </span>

                  <button
                    onClick={() =>
                      router.push(
                        `/room/${room.code}?platform=${room.platform}&stream=${encodeURIComponent(room.channel)}`
                      )
                    }
                    className="liquid-btn-primary px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:scale-105 transition cursor-pointer"
                  >
                    <span>Unirse</span>
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          fetchRooms();
        }}
        defaultCategory={selectedCategory !== "all" ? selectedCategory : "Gaming"}
      />

      <Footer />
    </div>
  );
}
