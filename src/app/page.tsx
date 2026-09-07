"use client";

import { useRouter } from "next/navigation";
import { Play, Users, Mic, Gamepad2, Sparkles, Tv } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  const handleCreateRoom = () => {
    const randomCode = Math.random().toString(36).substring(2, 8);
    router.push(`/party/${randomCode}`);
  };

  return (
    <div className="relative min-h-screen bg-background text-gray-100 flex flex-col justify-between selection:bg-brand-purple selection:text-white overflow-hidden">
      <div className="absolute top-[-10rem] left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-brand-purple/20 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] right-[-10rem] w-[400px] h-[400px] bg-brand-red/10 blur-[150px] rounded-full pointer-events-none" />

      <header className="relative z-10 w-full border-b border-surfaceBorder/60 bg-surface/40 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-accent flex items-center justify-center shadow-lg shadow-purple-900/30">
            <Gamepad2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-wider text-white">
            STREAM<span className="text-brand-purple">SYNC</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateRoom}
            className="text-xs font-semibold bg-surface border border-surfaceBorder hover:border-brand-purple/50 px-4 py-2 rounded-lg transition"
          >
            Entrar Rápido
          </button>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-16 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-surfaceBorder bg-surface/80 backdrop-blur-md px-4 py-1.5 text-xs font-medium text-gray-300 mb-6 shadow-inner">
          <Sparkles className="h-3.5 w-3.5 text-brand-purple animate-pulse" />
          Watch Parties de Twitch & YouTube en tiempo real
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-tight">
          Mira directos con amigos.{" "}
          <span className="bg-gradient-to-r from-brand-purple via-indigo-400 to-brand-red bg-clip-text text-transparent">
            100% sincronizados.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-gray-400 max-w-2xl leading-relaxed">
          Comparte directos de Twitch o vídeos de YouTube en una misma sala, habla por voz en ultra baja latencia y chatea sin desajustes de tiempo.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <button
            onClick={handleCreateRoom}
            className="group relative inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 text-base font-bold text-white transition-all bg-gradient-to-r from-brand-purple to-indigo-600 rounded-xl hover:from-purple-600 hover:to-indigo-500 shadow-xl shadow-purple-900/40 hover:shadow-purple-900/60 active:scale-95"
          >
            <Play className="h-5 w-5 fill-current transition-transform group-hover:scale-110" />
            Crear Sala Instantánea
          </button>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-5 w-full text-left">
          <div className="p-6 rounded-2xl border border-surfaceBorder bg-surface/50 backdrop-blur-sm hover:border-brand-purple/40 transition">
            <div className="h-10 w-10 rounded-xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center mb-4 text-brand-purple">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-base">Sincronización Total</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Todos ven exactamente el mismo segundo del stream sin spoilers por llamadas lentas.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-surfaceBorder bg-surface/50 backdrop-blur-sm hover:border-brand-accent/40 transition">
            <div className="h-10 w-10 rounded-xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center mb-4 text-brand-accent">
              <Mic className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-base">Voz Integrada</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Salas de audio WebRTC ligeras para hablar directamente sin apps externas.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-surfaceBorder bg-surface/50 backdrop-blur-sm hover:border-brand-red/40 transition">
            <div className="h-10 w-10 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center mb-4 text-brand-red">
              <Tv className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-base">Multi-Plataforma</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Pasa de un directo de Twitch a un vídeo de YouTube con un clic dentro de la sala.
            </p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-surfaceBorder/40 py-6 text-center text-xs text-gray-600">
        StreamSync • Diseñado para gamers y watch parties
      </footer>
    </div>
  );
}
