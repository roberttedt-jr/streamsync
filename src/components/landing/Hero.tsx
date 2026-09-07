"use client";

import React, { useState } from "react";
import {
  Play,
  ArrowRight,
  Sparkles,
  Users,
  Mic,
  Volume2,
  Radio,
  Trophy,
  Flame,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { trackEvent } from "@/lib/analytics";

interface HeroProps {
  onCreateRoom: () => void;
}

export default function Hero({ onCreateRoom }: HeroProps) {
  const [activeTab, setActiveTab] = useState<"twitch" | "youtube">("twitch");
  const { t } = useLanguage();

  const handleCreateRoom = () => {
    trackEvent("create_room_click", { location: "hero" });
    onCreateRoom();
  };

  const handleSwitchTab = (tab: "twitch" | "youtube") => {
    setActiveTab(tab);
    trackEvent("stream_switch", { platform: tab, location: "hero_mockup" });
  };

  return (
    <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-36 overflow-hidden">
      <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[750px] h-[450px] bg-gradient-to-tr from-brand-purple/20 via-neon-cyan/15 to-neon-pink/15 blur-[160px] rounded-full pointer-events-none animate-aurora-1 -z-10" />
      <div className="absolute top-[35%] right-[-120px] w-[550px] h-[550px] bg-neon-purple/10 blur-[170px] rounded-full pointer-events-none animate-aurora-2 -z-10" />
      <div className="absolute bottom-[10%] left-[-120px] w-[500px] h-[500px] bg-neon-cyan/10 blur-[170px] rounded-full pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-grid-minimal opacity-40 pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2.5 rounded-full glass-pill px-4 py-1.5 text-xs font-semibold text-gray-200 mb-8 hover:border-white/20 transition-colors shadow-lg">
            <span className="flex h-2 w-2 rounded-full bg-neon-cyan animate-ping" />
            <span className="text-neon-cyan font-bold uppercase tracking-wider text-[11px]">
              {t.hero.badgeTag}
            </span>
            <span className="text-white/20">•</span>
            <span className="text-gray-300">{t.hero.badgeText}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] mb-6">
            <span className="bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              {t.hero.titleStart}{" "}
            </span>
            <span className="bg-gradient-to-r from-neon-cyan via-[#A78BFA] to-neon-pink bg-clip-text text-transparent">
              {t.hero.titleGradient}
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl font-normal leading-relaxed mb-10">
            {t.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center mb-14">
            <button
              onClick={handleCreateRoom}
              className="liquid-btn-primary rounded-2xl px-8 py-4 text-base font-bold text-white flex items-center justify-center gap-3 w-full sm:w-auto group cursor-pointer"
            >
              <Play className="h-5 w-5 fill-current text-white transition-transform group-hover:scale-110" />
              <span>{t.hero.ctaPrimary}</span>
              <Sparkles className="h-4 w-4 text-white/90 animate-pulse" />
            </button>

            <a
              href="#como-funciona"
              onClick={() => trackEvent("how_it_works_click", { location: "hero" })}
              className="liquid-btn-secondary rounded-2xl px-7 py-4 text-base font-semibold text-gray-300 hover:text-white flex items-center justify-center gap-2 w-full sm:w-auto transition-all"
            >
              <span>{t.hero.ctaSecondary}</span>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-gray-400 font-medium mb-14">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-neon-cyan" />
              <span>{t.hero.trustNoRegister}</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-neon-pink" />
              <span>{t.hero.trustNoLag}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-neon-purple" />
              <span>{t.hero.trustVoice}</span>
            </div>
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="absolute -inset-1.5 rounded-[2.5rem] bg-gradient-to-r from-neon-cyan/20 via-brand-purple/30 to-neon-pink/20 blur-2xl opacity-60 pointer-events-none -z-10" />

          <div className="relative rounded-3xl glass-panel p-1 sm:p-2 shadow-2xl shadow-black overflow-hidden">
            <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

            <div className="rounded-[1.4rem] bg-[#070A10]/95 border border-white/[0.06] overflow-hidden">
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                  <span className="ml-3 text-[11px] font-mono text-gray-400 hidden sm:inline">
                    streamsync.gg/party/squad-finals-2025
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="glass-pill px-3 py-1 rounded-full text-emerald-400 text-xs font-semibold flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{t.hero.mockupSynced}</span>
                  </div>
                  <div className="glass-pill px-2.5 py-1 rounded-full text-gray-300 text-xs flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-neon-cyan" />
                    <span>{t.hero.mockupGamers}</span>
                  </div>
                </div>
              </div>

              <div className="relative aspect-[16/9] w-full bg-gradient-to-b from-[#0B0F1A] to-[#05070B] overflow-hidden flex flex-col justify-between p-4 sm:p-6">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none" />

                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="px-2.5 py-1 rounded-lg bg-red-600/90 text-white font-black text-[11px] tracking-wider flex items-center gap-1.5 shadow-lg shadow-red-900/50">
                      <Radio className="h-3 w-3 animate-pulse" />
                      LIVE
                    </div>
                    <div>
                      <h3 className="text-white text-sm sm:text-base font-bold drop-shadow">
                        {t.hero.mockupTourney}
                      </h3>
                      <p className="text-xs text-gray-400 flex items-center gap-2">
                        <span className="text-neon-cyan font-semibold">{t.hero.mockupTeams}</span>
                        <span>•</span>
                        <span>Canal: VCT_ES (Twitch)</span>
                      </p>
                    </div>
                  </div>

                  <div className="glass-pill p-0.5 rounded-xl flex items-center text-xs">
                    <button
                      onClick={() => handleSwitchTab("twitch")}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        activeTab === "twitch"
                          ? "bg-brand-purple text-white shadow-md shadow-brand-purple/30"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Twitch
                    </button>
                    <button
                      onClick={() => handleSwitchTab("youtube")}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        activeTab === "youtube"
                          ? "bg-red-600 text-white shadow-md shadow-red-900/30"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      YouTube
                    </button>
                  </div>
                </div>

                <div className="relative z-10 max-w-xs sm:max-w-sm rounded-2xl glass-card p-3.5 shadow-2xl hidden sm:block">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 mb-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-neon-cyan uppercase tracking-wider">
                      <Trophy className="h-3.5 w-3.5" />
                      <span>{t.hero.mockupOverlayTitle}</span>
                    </div>
                    <span className="text-[10px] glass-pill text-neon-cyan font-mono px-2 py-0.5 rounded-full">
                      MAPA 3 • BIND
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="glass-pill p-1.5 rounded-xl">
                      <div className="text-[9px] text-gray-400 uppercase tracking-wider">{t.hero.mockupRounds}</div>
                      <div className="font-bold text-white text-sm">11 - 10</div>
                    </div>
                    <div className="glass-pill p-1.5 rounded-xl">
                      <div className="text-[9px] text-gray-400 uppercase tracking-wider">{t.hero.mockupTopFragger}</div>
                      <div className="font-bold text-neon-pink text-sm truncate">Chronicle</div>
                    </div>
                    <div className="glass-pill p-1.5 rounded-xl">
                      <div className="text-[9px] text-gray-400 uppercase tracking-wider">{t.hero.mockupEconomy}</div>
                      <div className="font-bold text-emerald-400 text-sm">{t.hero.mockupEconomy === "Economy" ? "Full Buy" : "Compra Total"}</div>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/[0.06] bg-[#05070B]/80 backdrop-blur-md -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center -space-x-2">
                      <div className="relative">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-neon-cyan to-blue-600 border-2 border-neon-cyan flex items-center justify-center font-bold text-xs text-black shadow-glow-cyan">
                          AL
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-[#070A10] flex items-center justify-center">
                          <Mic className="h-2 w-2 text-black stroke-[3]" />
                        </div>
                      </div>

                      <div className="relative">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-neon-purple to-indigo-600 border-2 border-[#070A10] flex items-center justify-center font-bold text-xs text-white">
                          SA
                        </div>
                      </div>

                      <div className="relative">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-neon-pink to-rose-600 border-2 border-[#070A10] flex items-center justify-center font-bold text-xs text-white">
                          DA
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:flex flex-col text-left">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-neon-cyan animate-pulse" />
                        {t.hero.mockupVoiceActive}
                      </span>
                      <span className="text-[10px] text-gray-400">{t.hero.mockupVoiceRoom}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-300">
                    <div className="hidden sm:flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-gray-400" />
                      <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="w-3/4 h-full bg-neon-cyan rounded-full" />
                      </div>
                    </div>

                    <div className="glass-pill px-3 py-1 rounded-full text-xs font-mono">
                      <span className="text-emerald-400 font-bold">SYNC 0ms</span>
                      <span className="text-white/20 mx-1.5">|</span>
                      <span className="text-gray-300">01:42:18</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
