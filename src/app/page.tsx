"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import OnboardingTutorial from "@/components/common/OnboardingTutorial";
import CreateRoomModal from "@/components/room/CreateRoomModal";
import { useAuth } from "@/context/AuthContext";
import {
  Gamepad2,
  Tv,
  Radio,
  Play,
  Zap,
  Volume2,
  Trophy,
  ShieldCheck,
  Users,
  Sparkles,
  ArrowRight,
  Hand,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<"twitch" | "youtube">("twitch");

  const handleStartParty = () => {
    if (!user) {
      router.push("/auth?tab=register");
    } else {
      setIsCreateModalOpen(true);
    }
  };

  const handleQuickLaunch = (channel: string, platform: "twitch" | "youtube") => {
    const code = `${platform}-${Math.random().toString(36).substring(2, 7)}`;
    router.push(`/room/${code}?platform=${platform}&stream=${encodeURIComponent(channel)}`);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between overflow-x-hidden">
      <Navbar onCreateRoom={() => setIsCreateModalOpen(true)} />

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
          {/* Background ambient lighting */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-300 mb-6 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>StreamSync v2.0 • Watch Parties en Tiempo Real</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] mb-6">
                Mira directos con amigos{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
                  sin desfase de audio
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-gray-400 max-w-2xl font-normal leading-relaxed mb-8">
                Sincroniza emisiones de Twitch y YouTube al milisegundo. Habla con tus amigos por voz WebRTC de baja latencia con cola de turnos y consulta estadísticas de tus videojuegos favoritos al instante.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto justify-center">
                <button
                  onClick={handleStartParty}
                  className="liquid-btn-primary rounded-2xl px-7 py-3.5 text-sm font-bold flex items-center justify-center gap-2.5 w-full sm:w-auto shadow-xl shadow-purple-600/30 cursor-pointer hover:scale-105 transition"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Crear mi Watch Party</span>
                </button>

                <Link
                  href="/dashboard"
                  className="liquid-btn-secondary rounded-2xl px-6 py-3.5 text-sm font-semibold flex items-center justify-center gap-2 w-full sm:w-auto transition cursor-pointer"
                >
                  <span>Explorar Salas Activas</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-gray-400 font-medium mt-10">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Sin registro obligatorio (modo invitado)
                </span>
                <span className="hidden sm:inline text-white/20">•</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  Sincronización precisa a 0ms
                </span>
                <span className="hidden sm:inline text-white/20">•</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  Voz WebRTC en tiempo real
                </span>
              </div>
            </div>

            {/* Interactive 3D Room Mockup */}
            <div className="relative max-w-4xl mx-auto">
              <div className="rounded-3xl bg-[#0D0F17] border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl">
                {/* Window top bar */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-3 text-xs font-mono text-gray-400 hidden sm:inline">
                      streamsync.app/room/vct-champions-2026
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="px-2.5 py-0.5 rounded-full text-emerald-400 text-xs flex items-center gap-1.5 font-mono bg-emerald-500/10 border border-emerald-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>0ms Latencia</span>
                    </div>
                    <div className="px-2.5 py-0.5 rounded-full text-gray-300 text-xs flex items-center gap-1 bg-white/5 border border-white/10">
                      <Users className="w-3 h-3 text-cyan-400" />
                      <span>18 miembros</span>
                    </div>
                  </div>
                </div>

                {/* Player Screen Mockup */}
                <div className="relative aspect-[16/9] w-full bg-[#07090E] overflow-hidden flex flex-col justify-between p-5 sm:p-6">
                  {/* Top Bar inside mockup */}
                  <div className="relative z-10 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold text-[10px] tracking-wider flex items-center gap-1 uppercase">
                        <Radio className="w-3 h-3 animate-pulse" />
                        LIVE
                      </span>
                      <div>
                        <h3 className="text-white text-xs sm:text-sm font-bold">
                          {activePreviewTab === "twitch"
                            ? "VCT Masters 2026 - Gran Final en Directo"
                            : "Lofi Beats & Chill Coding Party 24/7"}
                        </h3>
                        <p className="text-[11px] text-gray-400">
                          Canal: {activePreviewTab === "twitch" ? "@valorant" : "@LofiGirl"} • Sincronizado para todos
                        </p>
                      </div>
                    </div>

                    {/* Platform Selector in Mockup */}
                    <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
                      <button
                        onClick={() => setActivePreviewTab("twitch")}
                        className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                          activePreviewTab === "twitch"
                            ? "bg-[#9146FF] text-white shadow"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        <Radio className="w-3 h-3" />
                        <span>Twitch</span>
                      </button>
                      <button
                        onClick={() => setActivePreviewTab("youtube")}
                        className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                          activePreviewTab === "youtube"
                            ? "bg-[#FF0000] text-white shadow"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        <Tv className="w-3 h-3" />
                        <span>YouTube</span>
                      </button>
                    </div>
                  </div>

                  {/* Center Play Button on Mockup */}
                  <div className="relative z-10 flex flex-col items-center justify-center my-auto">
                    <button
                      onClick={() => handleQuickLaunch(
                        activePreviewTab === "twitch" ? "valorant" : "jfKfPfyJRdk",
                        activePreviewTab
                      )}
                      className="p-5 rounded-3xl bg-purple-600/90 hover:bg-purple-600 text-white shadow-2xl shadow-purple-600/50 transform hover:scale-110 transition flex items-center justify-center cursor-pointer group"
                    >
                      <Play className="w-8 h-8 fill-current ml-1 text-white group-hover:scale-105 transition" />
                    </button>
                    <span className="text-xs text-gray-300 font-semibold mt-3">
                      Haz clic para abrir esta sala de prueba
                    </span>
                  </div>

                  {/* Bottom HUD bar inside mockup */}
                  <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/10 bg-[#090B10]/95 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 px-5 sm:px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center -space-x-2">
                        <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-bold text-white border-2 border-[#090B10]">
                          RG
                        </div>
                        <div className="w-7 h-7 rounded-full bg-cyan-600 flex items-center justify-center text-[10px] font-bold text-white border-2 border-[#090B10]">
                          AL
                        </div>
                        <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white border-2 border-[#090B10]">
                          EL
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-xs text-gray-300 font-medium hidden sm:inline">
                          Voz WebRTC activa • Roberto hablando
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono text-gray-400 bg-white/5 border border-white/10">
                        HD 1080p60
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Real Features Section (No fake opinions or data) */}
        <section className="py-20 border-t border-white/10 bg-white/[0.01]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-mono font-bold tracking-widest text-purple-400 uppercase mb-2 block">
                CARACTERÍSTICAS TÉCNICAS
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                Diseñado para gamers y creadores de contenido
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Herramientas reales diseñadas para que ver directos en grupo sea una experiencia fluida y sin interrupciones.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-purple-500/40 transition">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Sincronización Total a 0ms</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Algoritmo de compensación de latencia de red. Si el host pausa, rebobina o cambia de canal, todos los miembros ven la actualización al mismo instante.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-gray-400 font-mono">
                  Compatible con directos y VODs de Twitch y YouTube.
                </div>
              </div>

              {/* Feature 2 */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-cyan-500/40 transition">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5">
                    <Volume2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Voz WebRTC con Cola de Turnos</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Audio espacial con atenuación automática (audio ducking). Los participantes pueden levantar la mano para pedir turno y evitar que todos hablen a la vez.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-gray-400 font-mono">
                  Cifrado de audio de punto a punto (SRTP/DTLS).
                </div>
              </div>

              {/* Feature 3 */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-emerald-500/40 transition">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">HUD de Puntuaciones & Juego</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Overlay integrado con ficha técnica del videojuego retransmitido: puntuaciones críticas de Metacritic e IGDB, fecha de lanzamiento y desarrolladora.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-gray-400 font-mono">
                  Minimizable con un solo clic o con la tecla S.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Onboarding Tutorial Modal */}
      <OnboardingTutorial />

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <Footer />
    </div>
  );
}
