"use client";

import React, { useState } from "react";
import { Trophy, Star, Calendar, Gamepad, X, ChevronUp, ChevronDown, Flame } from "lucide-react";

interface GameInfo {
  name: string;
  genre: string;
  developer: string;
  releaseDate: string;
  criticScore: number;
  userScore: number;
  coverUrl: string;
  activePlayers?: string;
  tournamentEvent?: string;
}

interface GameStatsOverlayProps {
  game?: Partial<GameInfo>;
  onClose?: () => void;
}

const DEFAULT_GAME: GameInfo = {
  name: "VALORANT Champions Tour",
  genre: "Táctico / Hero Shooter FPS",
  developer: "Riot Games",
  releaseDate: "2020",
  criticScore: 84,
  userScore: 8.8,
  coverUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&auto=format&fit=crop&q=80",
  activePlayers: "1.4M en directo",
  tournamentEvent: "VCT Masters International",
};

export default function GameStatsOverlay({ game, onClose }: GameStatsOverlayProps) {
  const [minimized, setMinimized] = useState(false);

  const data: GameInfo = { ...DEFAULT_GAME, ...game };

  return (
    <div className="absolute top-4 left-4 z-30 max-w-xs sm:max-w-sm w-full transition-all duration-200 pointer-events-auto">
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        {/* Top Header */}
        <div className="px-3.5 py-2.5 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              HUD Info de Juego
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setMinimized(!minimized)}
              className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
              title={minimized ? "Expandir" : "Minimizar"}
            >
              {minimized ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
                title="Cerrar overlay"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Body Content */}
        {!minimized && (
          <div className="p-3.5 space-y-3">
            <div className="flex items-start gap-3">
              <img
                src={data.coverUrl}
                alt={data.name}
                className="h-16 w-16 rounded-xl object-cover border border-white/15 shrink-0 shadow-md"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate font-heading">{data.name}</h4>
                <p className="text-[11px] text-gray-400 truncate mt-0.5">{data.genre}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-1">
                  <span>{data.developer}</span>
                  <span>•</span>
                  <span>{data.releaseDate}</span>
                </div>
              </div>
            </div>

            {/* Scores grid */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-2 text-center">
                <div className="text-[10px] text-gray-400 uppercase font-mono">Metacritic</div>
                <div className="text-sm font-extrabold text-emerald-400 mt-0.5">
                  {data.criticScore}/100
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-2 text-center">
                <div className="text-[10px] text-gray-400 uppercase font-mono flex items-center justify-center gap-0.5">
                  <Star className="h-2.5 w-2.5 text-amber-400" />
                  <span>Comunidad</span>
                </div>
                <div className="text-sm font-extrabold text-amber-400 mt-0.5">
                  {data.userScore}/10
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-2 text-center">
                <div className="text-[10px] text-gray-400 uppercase font-mono flex items-center justify-center gap-0.5">
                  <Flame className="h-2.5 w-2.5 text-red-400" />
                  <span>Audiencia</span>
                </div>
                <div className="text-[11px] font-bold text-white mt-1 truncate">
                  {data.activePlayers}
                </div>
              </div>
            </div>

            {data.tournamentEvent && (
              <div className="px-2.5 py-1.5 rounded-xl bg-violet-600/10 border border-violet-500/20 text-[11px] text-violet-300 flex items-center justify-between">
                <span>Evento en Vivo:</span>
                <span className="font-semibold text-white truncate ml-2">{data.tournamentEvent}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
