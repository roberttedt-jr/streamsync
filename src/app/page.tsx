"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import OnboardingTutorial from "@/components/common/OnboardingTutorial";
import CreateRoomModal from "@/components/room/CreateRoomModal";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { CATEGORIES } from "@/lib/categories";
import {
  Play,
  Zap,
  Volume2,
  Users,
  ArrowRight,
  CheckCircle2,
  Tv,
  Radio,
  Sparkles,
  Layers,
  MessageSquare,
  Share2,
  ExternalLink,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const isEn = language === "en";

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCategoryModal, setSelectedCategoryModal] = useState("Gaming");

  const handleCreateRoom = (cat?: string) => {
    if (cat) setSelectedCategoryModal(cat);
    if (!user) {
      router.push("/auth?tab=register");
    } else {
      setIsCreateModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between overflow-x-hidden">
      <Navbar onCreateRoom={() => handleCreateRoom()} />

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative pt-14 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
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
                <span>
                  {isEn
                    ? "StreamSync • Twitch Watch Parties"
                    : "StreamSync • Watch Parties de Twitch"}
                </span>
              </div>

              {/* Main Title */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] mb-6">
                StreamSync —{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
                  {isEn ? "Twitch Watch Parties" : "Watch Parties de Twitch"}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-gray-400 max-w-2xl font-normal leading-relaxed mb-8">
                {isEn
                  ? "Create a room, share a Twitch stream, and enjoy watching together with your community."
                  : "Crea una sala, comparte un directo de Twitch y disfruta del stream con tu comunidad."}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto justify-center">
                <button
                  onClick={() => handleCreateRoom()}
                  className="liquid-btn-primary rounded-2xl px-7 py-3.5 text-sm font-bold flex items-center justify-center gap-2.5 w-full sm:w-auto shadow-xl shadow-purple-600/30 cursor-pointer hover:scale-105 transition"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{isEn ? "Create a room" : "Crear una sala"}</span>
                </button>

                <a
                  href="#como-funciona"
                  className="liquid-btn-secondary rounded-2xl px-6 py-3.5 text-sm font-semibold flex items-center justify-center gap-2 w-full sm:w-auto transition cursor-pointer"
                >
                  <span>{isEn ? "Explore how it works" : "Explorar cómo funciona"}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-gray-400 font-medium mt-10">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {isEn ? "No registration required (guest mode)" : "Sin registro obligatorio (modo invitado)"}
                </span>
                <span className="hidden sm:inline text-white/20">•</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  {isEn ? "Real-time presence & chat" : "Presencia y chat en tiempo real"}
                </span>
                <span className="hidden sm:inline text-white/20">•</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  {isEn ? "Optional voice & camera" : "Voz y cámara opcionales"}
                </span>
              </div>
            </div>

            {/* UI Preview: Professional Empty State with Demo Room Link */}
            <div className="relative max-w-4xl mx-auto">
              <div className="rounded-3xl bg-[#0D0F17] border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl">
                {/* Window top bar */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-3 text-xs font-mono text-purple-300 hidden sm:inline">
                      {isEn ? "Demo Room • Interactive Preview" : "Sala de demostración • Vista previa"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="px-2.5 py-0.5 rounded-full text-emerald-400 text-xs flex items-center gap-1.5 font-mono bg-emerald-500/10 border border-emerald-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{isEn ? "Live Twitch" : "En Vivo • Twitch"}</span>
                    </div>
                    <Link
                      href="/room/demo"
                      className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 transition"
                    >
                      <span>{isEn ? "Open demo" : "Abrir demostración"}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* Professional Empty State Interface */}
                <div className="relative aspect-[16/9] w-full bg-[#07090E] overflow-hidden flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 shadow-xl shadow-purple-600/10">
                    <Radio className="w-8 h-8" />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
                    {isEn ? "Add a stream to get started" : "Añadir stream para comenzar"}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 max-w-md mb-6 leading-relaxed">
                    {isEn
                      ? "Enter any Twitch channel to share it with your community or explore the interactive demo."
                      : "Introduce cualquier canal de Twitch para compartirlo con tu comunidad o explora la sala interactiva."}
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <Link
                      href="/room/demo"
                      className="liquid-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/25"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isEn ? "Try Demo Room" : "Probar Sala de Demostración"}</span>
                    </Link>
                    <button
                      onClick={() => handleCreateRoom()}
                      className="liquid-btn-secondary px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white"
                    >
                      <span>{isEn ? "Create my own room" : "Crear mi propia sala"}</span>
                    </button>
                  </div>

                  {/* Clean bottom status indicator */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-white/5">
                    <span>{isEn ? "Chat ready • WebRTC voice enabled" : "Chat listo • Voz WebRTC disponible"}</span>
                    <span className="text-gray-400">{isEn ? "Compatible with Twitch" : "Compatible con Twitch"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: ¿Cómo funciona? (3 Pasos claros) */}
        <section id="como-funciona" className="py-20 border-t border-white/10 bg-white/[0.01]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-mono font-bold tracking-widest text-purple-400 uppercase mb-2 block">
                {isEn ? "STEP BY STEP" : "PASO A PASO"}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
                {isEn ? "How does StreamSync work?" : "¿Cómo funciona StreamSync?"}
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                {isEn
                  ? "No complex setups or downloads. Everything runs straight in your browser in three easy steps:"
                  : "Sin configuraciones complejas ni programas externos. Todo funciona directamente desde el navegador en tres sencillos pasos:"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Paso 1 */}
              <div className="glass-panel p-8 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-purple-500/40 transition">
                <div>
                  <span className="text-3xl font-black text-purple-400 font-mono mb-4 block">01</span>
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5">
                    <Radio className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {isEn ? "1. Choose your stream" : "1. Elige tu stream"}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {isEn
                      ? "Enter any Twitch channel or stream. You can also start an empty room and add content whenever you're ready."
                      : "Introduce el canal de Twitch que quieras ver. También puedes iniciar la sala vacía y añadir el canal cuando estés listo."}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-purple-400 font-medium">
                  {isEn ? "Compatible with live Twitch streams." : "Compatible con directos y retransmisiones de Twitch."}
                </div>
              </div>

              {/* Paso 2 */}
              <div className="glass-panel p-8 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-cyan-500/40 transition">
                <div>
                  <span className="text-3xl font-black text-cyan-400 font-mono mb-4 block">02</span>
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {isEn ? "2. Invite your people" : "2. Invita a tu gente"}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {isEn
                      ? "Share your room link in one click on Discord, WhatsApp, Telegram, or social networks. Friends can join instantly as guests without installing anything."
                      : "Comparte el enlace de la sala con un solo clic en Discord, WhatsApp, Telegram o redes sociales. Tus amigos pueden entrar al instante como invitados sin necesidad de instalar nada."}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-cyan-400 font-medium">
                  {isEn ? "Public rooms in directory or private rooms with secure link." : "Salas públicas en el directorio o privadas con enlace seguro."}
                </div>
              </div>

              {/* Paso 3 */}
              <div className="glass-panel p-8 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-emerald-500/40 transition">
                <div>
                  <span className="text-3xl font-black text-emerald-400 font-mono mb-4 block">03</span>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {isEn ? "3. Enjoy together" : "3. Disfrutad juntos"}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {isEn
                      ? "Shared rooms with real-time presence, live chat, and optional voice or camera with explicit authorization."
                      : "Salas compartidas con presencia en tiempo real, chat en directo y voz o cámara opcionales previa autorización."}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-emerald-400 font-medium">
                  {isEn ? "Real-time presence & live chat sync." : "Presencia multiusuario y chat en tiempo real."}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Categorías */}
        <section className="py-20 border-t border-white/10 bg-black/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-mono font-bold tracking-widest text-purple-400 uppercase mb-2 block">
                {isEn ? "CONTENT VARIETY" : "VARIEDAD DE CONTENIDO"}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
                {isEn ? "Watch parties for any type of live stream" : "Watch parties para cualquier tipo de directo"}
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                {isEn
                  ? "StreamSync is not just for games. Bring your community together to watch concerts, football matches, podcasts, cooking streams, coding sessions, and more."
                  : "StreamSync no es solo para videojuegos. Reúne a tu comunidad para ver conciertos, partidos de fútbol, tertulias, directos de cocina, sesiones de código y más."}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCreateRoom(cat.name)}
                    className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-purple-500/40 transition-all text-left flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-purple-600/20 transition-all">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition line-clamp-1 mb-1">
                        {cat.name}
                      </h4>
                      <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition cursor-pointer"
              >
                <span>{isEn ? "Explore rooms by category" : "Explorar salas por categoría"}</span>
                <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
              </Link>
            </div>
          </div>
        </section>

        {/* Section: Características Técnicas Generales */}
        <section className="py-20 border-t border-white/10 bg-white/[0.01]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-mono font-bold tracking-widest text-purple-400 uppercase mb-2 block">
                {isEn ? "REAL-TIME TECHNOLOGY" : "TECNOLOGÍA EN TIEMPO REAL"}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                {isEn ? "Engineered for uninterrupted streaming" : "Diseñado para disfrutar sin interrupciones"}
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                {isEn
                  ? "Real tools designed to make watching live broadcasts together seamless and latency-free."
                  : "Herramientas reales diseñadas para que ver emisiones en directo compartidas sea una experiencia fluida y sin desajustes."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-purple-500/40 transition">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {isEn ? "Shared Rooms & Presence" : "Salas Compartidas y Presencia"}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {isEn
                      ? "Real-time participant presence and host controls. Change Twitch channels, manage room settings, and chat with your community seamlessly."
                      : "Presencia en tiempo real y controles de anfitrión. Cambia canales de Twitch, configura la sala y disfruta con tu comunidad sin cortes."}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-gray-400 font-mono">
                  {isEn ? "Compatible with live Twitch streams." : "Compatible con directos de Twitch."}
                </div>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-cyan-500/40 transition">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5">
                    <Volume2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {isEn ? "Optional Voice & Camera" : "Voz y Cámara Opcionales"}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {isEn
                      ? "Microphone and camera access only activate with your explicit permission. Built-in turn queue to request speaking turns easily."
                      : "El acceso a micrófono y cámara solo se activa tras tu autorización explícita. Incluye cola para pedir la palabra de forma ordenada."}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-gray-400 font-mono">
                  {isEn ? "Peer-to-peer encryption (SRTP/DTLS)." : "Cifrado de punto a punto (SRTP/DTLS)."}
                </div>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-emerald-500/40 transition">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {isEn ? "Cross-Platform & No Apps" : "Multiplataforma y Sin Apps"}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {isEn
                      ? "Zero downloads or installs required. Works on PCs, laptops, and tablets directly inside your favorite modern browser."
                      : "Cero descargas o instalaciones requeridas. Funciona en ordenadores, portátiles y tablets directamente a través de tu navegador moderno favorito."}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-gray-400 font-mono">
                  {isEn ? "Fully responsive for any screen." : "Responsive para cualquier dispositivo."}
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
        defaultCategory={selectedCategoryModal}
      />

      <Footer />
    </div>
  );
}
