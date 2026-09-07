"use client";

import React from "react";
import { Sparkles, Tv, Share2, Headphones, ArrowRight, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { trackEvent } from "@/lib/analytics";

interface HowItWorksProps {
  onCreateRoom: () => void;
}

export default function HowItWorks({ onCreateRoom }: HowItWorksProps) {
  const { t } = useLanguage();

  const handleCreateRoom = () => {
    trackEvent("create_room_click", { location: "how_it_works" });
    onCreateRoom();
  };

  const steps = [
    {
      ...t.howItWorks.step1,
      icon: Tv,
      borderColor: "group-hover:border-neon-cyan/50",
      glowColor: "group-hover:shadow-glow-cyan",
      badgeColor: "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30",
    },
    {
      ...t.howItWorks.step2,
      icon: Share2,
      borderColor: "group-hover:border-neon-purple/50",
      glowColor: "group-hover:shadow-glow-purple",
      badgeColor: "bg-neon-purple/10 text-neon-purple border-neon-purple/30",
    },
    {
      ...t.howItWorks.step3,
      icon: Headphones,
      borderColor: "group-hover:border-neon-pink/50",
      glowColor: "group-hover:shadow-glow-pink",
      badgeColor: "bg-neon-pink/10 text-neon-pink border-neon-pink/30",
    },
  ];

  return (
    <section id="como-funciona" className="relative py-20 lg:py-28 bg-[#0B0F14]/70 border-t border-surfaceBorder/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/30 text-neon-purple text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            {t.howItWorks.badge}
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            {t.howItWorks.titleStart}{" "}
            <span className="bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">
              {t.howItWorks.titleHighlight}
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-400">
            {t.howItWorks.subtitle}
          </p>
        </div>

        {/* 3 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className={`group relative rounded-2xl border border-surfaceBorder bg-[#0F141C]/80 backdrop-blur-sm p-7 sm:p-8 transition-all duration-300 hover:-translate-y-1.5 ${step.borderColor} ${step.glowColor}`}
              >
                {/* Step number watermark */}
                <div className="absolute top-6 right-7 text-4xl font-black text-white/5 group-hover:text-white/10 transition-colors font-mono select-none">
                  {step.number}
                </div>

                {/* Icon */}
                <div className={`h-14 w-14 rounded-xl border flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 ${step.badgeColor}`}>
                  <Icon className="h-7 w-7" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <span>{step.title}</span>
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">
                  {step.description}
                </p>

                {/* Bullet details */}
                <ul className="space-y-2 border-t border-surfaceBorder/60 pt-5">
                  {step.details.map((detail, dIdx) => (
                    <li key={dIdx} className="flex items-center gap-2 text-xs text-gray-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Button */}
        <div className="flex justify-center">
          <button
            onClick={handleCreateRoom}
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-brand-purple to-neon-purple hover:to-neon-cyan shadow-xl shadow-brand-purple/25 hover:shadow-glow-purple active:scale-95 transition-all duration-300"
          >
            <span>{t.howItWorks.ctaButton}</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
