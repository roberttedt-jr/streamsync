import { Play, Users, Mic, Gamepad2 } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-surfaceBorder bg-surface px-4 py-1.5 text-xs font-medium text-gray-400 mb-6">
        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        Fase 0: Base lista
      </div>

      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-2xl text-white">
        Watch Parties de gaming con <span className="text-brand-purple">Stream</span><span className="text-brand-red">Sync</span>
      </h1>

      <p className="mt-4 text-lg text-gray-400 max-w-xl">
        Mira directos de Twitch y YouTube en tiempo real con amigos, con chat de voz integrado y estadísticas de juegos al instante.
      </p>

      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <button className="flex items-center gap-2 rounded-lg bg-brand-purple px-6 py-3 font-semibold text-white transition hover:bg-purple-700 shadow-lg shadow-purple-900/30">
          <Play className="h-5 w-5 fill-current" />
          Crear Sala de Prueba
        </button>
      </div>

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full text-left">
        <div className="p-5 rounded-xl border border-surfaceBorder bg-surface">
          <Users className="h-6 w-6 text-brand-purple mb-3" />
          <h3 className="font-semibold text-white text-base">Sincronización Total</h3>
          <p className="text-sm text-gray-400 mt-1">Play, pausa y saltos coordinados con WebSockets.</p>
        </div>

        <div className="p-5 rounded-xl border border-surfaceBorder bg-surface">
          <Mic className="h-6 w-6 text-brand-accent mb-3" />
          <h3 className="font-semibold text-white text-base">Voz en Directo</h3>
          <p className="text-sm text-gray-400 mt-1">Salas de audio WebRTC de ultra baja latencia.</p>
        </div>

        <div className="p-5 rounded-xl border border-surfaceBorder bg-surface">
          <Gamepad2 className="h-6 w-6 text-brand-red mb-3" />
          <h3 className="font-semibold text-white text-base">Overlay de Estadísticas</h3>
          <p className="text-sm text-gray-400 mt-1">Ficha técnica y puntuaciones del juego.</p>
        </div>
      </div>
    </main>
  );
}