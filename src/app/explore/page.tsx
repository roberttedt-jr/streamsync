"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import CreateRoomModal from "@/components/room/CreateRoomModal";
import {
  Compass,
  Search,
  Radio,
  Tv,
  Users,
  Play,
  Flame,
  Plus,
  Trophy,
  Headphones,
  Code,
  Sparkles,
  Gamepad2,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
}

const CATEGORIES: Category[] = [
  { id: "all", name: "Todas las categorías", icon: Compass },
  { id: "esports", name: "Esports & FPS", icon: Trophy },
  { id: "music", name: "Música & Lofi", icon: Headphones },
  { id: "tech", name: "Desarrollo & Tech", icon: Code },
  { id: "variety", name: "Variedad & Gaming", icon: Gamepad2 },
];

const EXPLORE_STREAMS = [
  {
    id: "exp_1",
    title: "VCT Americas Kickoff - Playoffs Final",
    streamer: "valorant",
    platform: "twitch" as const,
    category: "esports",
    categoryLabel: "Esports & FPS",
    viewers: "62,400",
    cover: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80",
    tags: ["Valorant", "VCT", "Directo Oficial"],
  },
  {
    id: "exp_2",
    title: "CS2 Pro League S19 - NaVi vs FaZe",
    streamer: "eslcs",
    platform: "twitch" as const,
    category: "esports",
    categoryLabel: "Esports & FPS",
    viewers: "41,120",
    cover: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80",
    tags: ["CS2", "Major", "5v5"],
  },
  {
    id: "exp_3",
    title: "Lofi Hip Hop Radio - Beats to relax/study to",
    streamer: "jfKfPfyJRdk",
    platform: "youtube" as const,
    category: "music",
    categoryLabel: "Música & Lofi",
    viewers: "28,500",
    cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    tags: ["Lofi Girl", "Chill", "24/7"],
  },
  {
    id: "exp_4",
    title: "RLCS World Championship - Cuartos de Final",
    streamer: "rocketleague",
    platform: "twitch" as const,
    category: "esports",
    categoryLabel: "Esports & FPS",
    viewers: "19,800",
    cover: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80",
    tags: ["Rocket League", "Psyonix", "Pro"],
  },
  {
    id: "exp_5",
    title: "Synthwave / Chillwave Radio 24/7",
    streamer: "4xDzrJKXOOY",
    platform: "youtube" as const,
    category: "music",
    categoryLabel: "Música & Lofi",
    viewers: "8,900",
    cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80",
    tags: ["Synthwave", "Cyberpunk", "Radio"],
  },
  {
    id: "exp_6",
    title: "Directo de Desarrollo Web & Programación en Vivo",
    streamer: "midudev",
    platform: "twitch" as const,
    category: "tech",
    categoryLabel: "Desarrollo & Tech",
    viewers: "5,400",
    cover: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&auto=format&fit=crop&q=80",
    tags: ["JavaScript", "React", "Tech"],
  },
  {
    id: "exp_7",
    title: "Tarde de Juegos y Risas en Directo",
    streamer: "illojuan",
    platform: "twitch" as const,
    category: "variety",
    categoryLabel: "Variedad & Gaming",
    viewers: "34,200",
    cover: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80",
    tags: ["Charla", "Gaming", "Comunidad"],
  },
  {
    id: "exp_8",
    title: "GameSpot Live - Game Showcases & Previews",
    streamer: "0qL3w2eG6Jk",
    platform: "youtube" as const,
    category: "variety",
    categoryLabel: "Variedad & Gaming",
    viewers: "12,100",
    cover: "https://images.unsplash.com/photo-1552824722-ddab1374e622?w=600&auto=format&fit=crop&q=80",
    tags: ["GameSpot", "Trailers", "Noticias"],
  },
];

export default function ExplorePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPlatform, setSelectedPlatform] = useState<"all" | "twitch" | "youtube">("all");
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filtered = EXPLORE_STREAMS.filter((item) => {
    const matchesCat = selectedCategory === "all" || item.category === selectedCategory;
    const matchesPlat = selectedPlatform === "all" || item.platform === selectedPlatform;
    const matchesSearch =
      !search.trim() ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.streamer.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    return matchesCat && matchesPlat && matchesSearch;
  });

  const launchParty = (streamer: string, platform: "twitch" | "youtube") => {
    const code = `exp-${Math.random().toString(36).substring(2, 7)}`;
    router.push(`/room/${code}?platform=${platform}&stream=${encodeURIComponent(streamer)}`);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Explore Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>Directorio Comunitario 2026</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Explorar Emisiones & Watch Parties
            </h1>
            <p className="text-sm text-gray-400 max-w-2xl mt-1">
              Encuentra qué ver con tus amigos en vivo. Inicia una sala sincronizada al instante con cualquier canal de Twitch o vídeo de YouTube.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="liquid-btn-primary flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-purple-600/25 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Sala Personalizada</span>
          </button>
        </div>

        {/* Search & Platform Filter Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por juego, streamer o tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-end overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedPlatform("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer ${
                selectedPlatform === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              Todos los canales
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
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
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

        {/* Stream Cards Grid */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-white/10 bg-white/[0.02]">
            <Compass className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Sin resultados</h3>
            <p className="text-xs text-gray-400 mb-4">
              No hay directos que coincidan con los filtros seleccionados.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSelectedPlatform("all");
                setSearch("");
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 text-white hover:bg-white/15 transition cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="glass-panel group rounded-3xl border border-white/10 overflow-hidden hover:border-purple-500/50 transition-all hover:shadow-2xl flex flex-col justify-between"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-black/60">
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                  />

                  {/* Overlaid Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        item.platform === "twitch"
                          ? "bg-[#9146FF] text-white"
                          : "bg-[#FF0000] text-white"
                      }`}
                    >
                      {item.platform === "twitch" ? (
                        <Radio className="w-3 h-3" />
                      ) : (
                        <Tv className="w-3 h-3" />
                      )}
                      <span>{item.platform}</span>
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-black/70 backdrop-blur-md text-emerald-400 border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{item.viewers}</span>
                  </div>

                  {/* Quick Play overlay button */}
                  <button
                    onClick={() => launchParty(item.streamer, item.platform)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] cursor-pointer"
                  >
                    <div className="p-3.5 rounded-full bg-purple-600 text-white shadow-xl shadow-purple-600/50 transform group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </button>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-1 block">
                      {item.categoryLabel}
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition line-clamp-2 mb-2 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
                      <span>Streamer:</span>
                      <strong className="text-gray-200">@{item.streamer}</strong>
                    </p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] text-gray-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => launchParty(item.streamer, item.platform)}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-white/5 hover:bg-purple-600/20 text-gray-200 hover:text-purple-300 border border-white/10 hover:border-purple-500/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Abrir Watch Party</span>
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
