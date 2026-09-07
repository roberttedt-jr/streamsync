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
    <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
      {/* Background ambient neon glows */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-brand-purple/25 via-neon-purple/20 to-neon-cyan/20 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-[-150px] w-[500px] h-[500px] bg-neon-pink/10 blur-[160px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-[-150px] w-[500px] h-[500px] bg-neon-cyan/10 blur-[160px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Top Gaming Badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-neon-cyan/30 bg-[#0F141C]/90 px-4 py-1.5 text-xs font-semibold text-gray-200 mb-8 shadow-lg shadow-cyan-950/30 backdrop-blur-md hover:border-neon-cyan/60 transition-colors">
            <span className="flex h-2 w-2 rounded-full bg-neon-cyan animate-ping" />
            <span className="text-neon-cyan font-bold uppercase tracking-wider text-[11px]">
              {t.hero.badgeTag}
            </span>
            <span className="text-gray-500">•</span>
            <span>{t.hero.badgeText}</span>
          </div>

          {/* H1 Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] mb-6">
            {t.hero.titleStart}{" "}
            <span className="bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent drop-shadow-sm">
              {t.hero.titleGradient}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl font-normal leading-relaxed mb-10">
            {t.hero.subtitle}
          </p>

          {/* 2 CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center mb-16">
            <button
              onClick={handleCreateRoom}
              className="relative inline-flex items-center justify-center gap-3 w-full sm:w-auto px-9 py-4 rounded-2xl text-base font-black text-white bg-gradient-to-r from-brand-purple via-[#7C3AED] to-neon-cyan border border-white/20 shadow-xl shadow-brand-purple/40 hover:shadow-glow-purple hover:scale-[1.02] active:scale-95 transition-all duration-300 group"
            >
              <Play className="h-5 w-5 fill-current text-white transition-transform group-hover:scale-110" />
              <span>{t.hero.ctaPrimary}</span>
              <Sparkles className="h-4 w-4 text-neon-cyan animate-pulse" />
            </button>

            <a
              href="#como-funciona"
              onClick={() => trackEvent("how_it_works_click", { location: "hero" })}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-4 rounded-2xl text-base font-semibold text-gray-300 bg-surface/90 hover:bg-surface border border-surfaceBorder hover:border-gray-600 hover:text-white transition-all duration-200"
            >
              <span>{t.hero.ctaSecondary}</span>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Mini trust points */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400 font-medium mb-12">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-neon-cyan" />
              <span>{t.hero.trustNoRegister}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-neon-pink" />
              <span>{t.hero.trustNoLag}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mic className="h-4 w-4 text-neon-purple" />
              <span>{t.hero.trustVoice}</span>
            </div>
          </div>
        </div>

        {/* Mockup Visual of a Watch Party */}
        <div className="relative max-w-5xl mx-auto">
          {/* Neon border glow around mockup */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-brand-purple/50 via-neon-cyan/40 to-neon-pink/40 blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 -z-10" />

          <div className="relative rounded-2xl sm:rounded-3xl border border-surfaceBorder/80 bg-[#0B0F14]/90 backdrop-blur-2xl shadow-2xl shadow-black/80 overflow-hidden">
            {/* Mockup Window Top Bar */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-surfaceBorder/70 bg-[#0F141C]/80">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="ml-3 text-xs font-mono font-medium text-gray-400 hidden sm:inline">
                  streamsync.gg/party/squad-finals-2025
                </span>
              </div>

              {/* Status Pills */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{t.hero.mockupSynced}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-surfaceBorder text-gray-300 text-xs">
                  <Users className="h-3.5 w-3.5 text-neon-cyan" />
                  <span>{t.hero.mockupGamers}</span>
                </div>
              </div>
            </div>

            {/* Mockup Main Display: Stream + Overlays */}
            <div className="relative aspect-[16/9] w-full bg-gradient-to-b from-[#111827] to-[#0B0F14] overflow-hidden flex flex-col justify-between p-4 sm:p-6">
              {/* Game Background Graphics */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/40 via-[#0B0F14]/80 to-[#0B0F14] pointer-events-none" />
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

              {/* Live Game Stream Header inside Mockup */}
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-lg bg-red-600/90 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-red-900/40">
                    <Radio className="h-3.5 w-3.5 animate-pulse" />
                    LIVE
                  </div>
                  <div>
                    <h3 className="text-white text-sm sm:text-base font-bold drop-shadow">
                      {t.hero.mockupTourney}
                    </h3>
                    <p className="text-xs text-gray-300 flex items-center gap-2">
                      <span className="text-neon-cyan font-semibold">{t.hero.mockupTeams}</span>
                      <span>•</span>
                      <span className="text-gray-400">Canal: VCT_ES (Twitch)</span>
                    </p>
                  </div>
                </div>

                {/* Stream Switcher Demo */}
                <div className="flex items-center gap-1 bg-[#0F141C]/90 p-1 rounded-xl border border-surfaceBorder text-xs">
                  <button
                    onClick={() => handleSwitchTab("twitch")}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      activeTab === "twitch"
                        ? "bg-brand-purple text-white shadow"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Twitch
                  </button>
                  <button
                    onClick={() => handleSwitchTab("youtube")}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      activeTab === "youtube"
                        ? "bg-red-600 text-white shadow"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    YouTube
                  </button>
                </div>
              </div>

              {/* Game Stats Overlay (Middle-left) */}
              <div className="relative z-10 max-w-xs sm:max-w-sm rounded-xl border border-neon-cyan/30 bg-[#0F141C]/85 backdrop-blur-md p-3 shadow-lg shadow-black/60 hidden sm:block">
                <div className="flex items-center justify-between border-b border-surfaceBorder/60 pb-2 mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-neon-cyan uppercase tracking-wider">
                    <Trophy className="h-3.5 w-3.5" />
                    {t.hero.mockupOverlayTitle}
                  </div>
                  <span className="text-[10px] bg-neon-cyan/10 text-neon-cyan font-mono px-2 py-0.5 rounded">
                    MAPA 3 • BIND
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-surface/70 p-1.5 rounded-lg border border-surfaceBorder">
                    <div className="text-[10px] text-gray-400 uppercase">{t.hero.mockupRounds}</div>
                    <div className="font-bold text-white text-sm">11 - 10</div>
                  </div>
                  <div className="bg-surface/70 p-1.5 rounded-lg border border-surfaceBorder">
                    <div className="text-[10px] text-gray-400 uppercase">{t.hero.mockupTopFragger}</div>
                    <div className="font-bold text-neon-pink text-sm">Chronicle</div>
                  </div>
                  <div className="bg-surface/70 p-1.5 rounded-lg border border-surfaceBorder">
                    <div className="text-[10px] text-gray-400 uppercase">{t.hero.mockupEconomy}</div>
                    <div className="font-bold text-emerald-400 text-sm">Full Buy</div>
                  </div>
                </div>
              </div>

              {/* Bottom Bar inside Mockup: Voice Chat Pills + Sync Controls */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10 bg-black/40 backdrop-blur-md -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 p-4">
                {/* Gamer Avatars with Speaking Wave */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center -space-x-2">
                    <div className="relative group">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-neon-cyan to-blue-600 border-2 border-neon-cyan flex items-center justify-center font-bold text-xs text-black shadow-glow-cyan">
                        AL
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-[#0B0F14] flex items-center justify-center">
                        <Mic className="h-2.5 w-2.5 text-black stroke-[3]" />
                      </div>
                    </div>

                    <div className="relative">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-neon-purple to-indigo-600 border-2 border-surfaceBorder flex items-center justify-center font-bold text-xs text-white">
                        SA
                      </div>
                    </div>

                    <div className="relative">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-neon-pink to-rose-600 border-2 border-surfaceBorder flex items-center justify-center font-bold text-xs text-white">
                        DA
                      </div>
                    </div>

                    <div className="relative">
                      <div className="h-9 w-9 rounded-full bg-surface border-2 border-surfaceBorder flex items-center justify-center font-bold text-xs text-gray-400">
                        +1
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:flex flex-col">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-neon-cyan animate-pulse" />
                      {t.hero.mockupVoiceActive}
                    </span>
                    <span className="text-[11px] text-gray-400">{t.hero.mockupVoiceRoom}</span>
                  </div>
                </div>

                {/* Playback Sync Progress */}
                <div className="flex items-center gap-4 text-xs text-gray-300">
                  <div className="hidden sm:flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-gray-400" />
                    <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-neon-cyan rounded-full" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-[#0F141C] px-3 py-1.5 rounded-lg border border-surfaceBorder text-xs font-mono">
                    <span className="text-emerald-400 font-bold">LIVE SYNC</span>
                    <span className="text-gray-500">|</span>
                    <span className="text-gray-300">01:42:18</span>
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
