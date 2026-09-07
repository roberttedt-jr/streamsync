"use client";

import React from "react";
import { Zap, Mic, BarChart3, ShieldCheck, Gamepad2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Features() {
  const { t } = useLanguage();

  const features = [
    {
      ...t.features.feat1,
      icon: Zap,
      borderColor: "hover:border-neon-cyan/50",
      glowColor: "hover:shadow-glow-cyan",
      iconBg: "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30",
    },
    {
      ...t.features.feat2,
      icon: Mic,
      borderColor: "hover:border-neon-purple/50",
      glowColor: "hover:shadow-glow-purple",
      iconBg: "bg-neon-purple/10 text-neon-purple border-neon-purple/30",
    },
    {
      ...t.features.feat3,
      icon: BarChart3,
      borderColor: "hover:border-neon-pink/50",
      glowColor: "hover:shadow-glow-pink",
      iconBg: "bg-neon-pink/10 text-neon-pink border-neon-pink/30",
    },
    {
      ...t.features.feat4,
      icon: ShieldCheck,
      borderColor: "hover:border-emerald-500/50",
      glowColor: "hover:shadow-lg hover:shadow-emerald-950/40",
      iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
  ];

  return (
    <section id="caracteristicas" className="relative py-20 lg:py-28 bg-[#0B0F14]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-purple/15 blur-[160px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-xs font-bold uppercase tracking-widest mb-4">
            <Gamepad2 className="h-3.5 w-3.5" />
            {t.features.badge}
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            {t.features.titleStart}{" "}
            <span className="bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
              {t.features.titleHighlight}
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-400">
            {t.features.subtitle}
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className={`group relative rounded-2xl border border-surfaceBorder bg-[#0F141C]/85 backdrop-blur-md p-8 transition-all duration-300 hover:-translate-y-1 ${feat.borderColor} ${feat.glowColor}`}
              >
                <div className="flex items-start gap-5">
                  <div
                    className={`h-12 w-12 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${feat.iconBg}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xl font-bold text-white tracking-tight">
                        {feat.title}
                      </h3>
                      <span className="text-[11px] font-mono text-gray-400 bg-surface px-2 py-0.5 rounded border border-surfaceBorder">
                        {feat.subtitle}
                      </span>
                    </div>

                    <p className="text-sm text-gray-300 leading-relaxed mb-4">
                      {feat.description}
                    </p>

                    <div className="rounded-xl bg-[#0B0F14]/70 border border-surfaceBorder/80 p-3.5 text-xs text-gray-400 leading-relaxed">
                      <span className="font-semibold text-gray-200">{t.features.practiceLabel} </span>
                      {feat.example}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
