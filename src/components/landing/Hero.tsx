"use client";

import React, { useState } from "react";
import {
  Play,
  ArrowRight,
  Users,
  ChevronRight,
  Radio,
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
    <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-white/[0.04] to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-grid-minimal opacity-30 pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full glass-pill px-3.5 py-1 text-xs font-medium text-gray-300 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-gray-200">{t.hero.badgeTag}</span>
            <span className="text-white/20">•</span>
            <span className="text-gray-400">{t.hero.badgeText}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.1] mb-6">
            {t.hero.titleStart}{" "}
            <span className="text-gray-400">{t.hero.titleGradient}</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-400 max-w-xl font-normal leading-relaxed mb-8">
            {t.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto justify-center">
            <button
              onClick={handleCreateRoom}
              className="liquid-btn-primary rounded-xl px-6 py-3 text-sm font-semibold flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>{t.hero.ctaPrimary}</span>
            </button>

            <a
              href="#como-funciona"
              className="liquid-btn-secondary rounded-xl px-5 py-3 text-sm font-medium flex items-center justify-center gap-2 w-full sm:w-auto transition-colors"
            >
              <span>{t.hero.ctaSecondary}</span>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </a>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-gray-500 font-normal mt-8">
            <span>{t.hero.trustNoRegister}</span>
            <span>•</span>
            <span>{t.hero.trustNoLag}</span>
            <span>•</span>
            <span>{t.hero.trustVoice}</span>
          </div>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="rounded-2xl bg-[#0D0F17] border border-white/[0.08] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-white/[0.15]" />
                <div className="h-2.5 w-2.5 rounded-full bg-white/[0.15]" />
                <div className="h-2.5 w-2.5 rounded-full bg-white/[0.15]" />
                <span className="ml-2 text-[11px] font-mono text-gray-400 hidden sm:inline">
                  streamsync.gg/party/squad-gaming
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="glass-pill px-2.5 py-0.5 rounded-md text-emerald-400 text-xs flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>{t.hero.mockupSynced}</span>
                </div>
                <div className="glass-pill px-2 py-0.5 rounded-md text-gray-300 text-xs flex items-center gap-1">
                  <Users className="h-3 w-3 text-gray-400" />
                  <span>4</span>
                </div>
              </div>
            </div>

            <div className="relative aspect-[16/9] w-full bg-[#08090C] overflow-hidden flex flex-col justify-between p-4 sm:p-6">
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="px-2 py-0.5 rounded bg-red-600/90 text-white font-bold text-[10px] tracking-wider flex items-center gap-1">
                    <Radio className="h-2.5 w-2.5 animate-pulse" />
                    LIVE
                  </div>
                  <div>
                    <h3 className="text-white text-xs sm:text-sm font-semibold">
                      {t.hero.mockupTourney}
                    </h3>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                      <span>{t.hero.mockupTeams}</span>
                      <span>•</span>
                      <span>{activeTab === "twitch" ? "En Vivo • Twitch" : "Directo Especial • YouTube"}</span>
                    </p>
                  </div>
                </div>

                <div className="glass-pill p-0.5 rounded-lg flex items-center text-xs">
                  <button
                    onClick={() => handleSwitchTab("twitch")}
                    className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      activeTab === "twitch"
                        ? "bg-[#9146FF] text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Twitch
                  </button>
                  <button
                    onClick={() => handleSwitchTab("youtube")}
                    className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      activeTab === "youtube"
                        ? "bg-red-600 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    YouTube
                  </button>
                </div>
              </div>

              <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/[0.06] bg-[#090B10]/90 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 px-4 sm:px-6 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center -space-x-2">
                    <div className="relative">
                      <div className="h-7 w-7 rounded-full bg-white/[0.1] border border-white/20 flex items-center justify-center text-[10px] font-bold text-white">
                        AL
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-[#0D0F17]" />
                    </div>
                    <div className="h-7 w-7 rounded-full bg-white/[0.06] border border-[#0D0F17] flex items-center justify-center text-[10px] font-medium text-gray-300">
                      SA
                    </div>
                    <div className="h-7 w-7 rounded-full bg-white/[0.06] border border-[#0D0F17] flex items-center justify-center text-[10px] font-medium text-gray-300">
                      DA
                    </div>
                  </div>

                  <span className="text-xs text-gray-400 hidden sm:inline">
                    Voz activa • Alex hablando
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
                  <div className="flex items-center gap-1 text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>0ms</span>
                  </div>
                  <span className="text-white/20">|</span>
                  <span>01:42:18</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
