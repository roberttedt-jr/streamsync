"use client";

import React from "react";
import { Star, Users, Radio, MessageCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Testimonials() {
  const { t } = useLanguage();

  const colors = [
    "from-neon-cyan to-blue-600",
    "from-neon-purple to-purple-700",
    "from-neon-pink to-rose-600",
  ];

  return (
    <section id="testimonios" className="relative py-20 lg:py-28 bg-[#0B0F14]/80 border-t border-surfaceBorder/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Support Context Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-pink/10 border border-neon-pink/30 text-neon-pink text-xs font-bold uppercase tracking-widest mb-4">
            <Users className="h-3.5 w-3.5" />
            {t.testimonials.badge}
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            {t.testimonials.titleStart}{" "}
            <span className="bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
              {t.testimonials.titleHighlight}
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-300">
            {t.testimonials.subtitle}
          </p>
        </div>

        {/* Testimonials 3 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {t.testimonials.items.map((item, idx) => (
            <div
              key={idx}
              className="relative rounded-2xl border border-surfaceBorder bg-[#0F141C]/80 backdrop-blur-md p-7 flex flex-col justify-between hover:border-gray-600 transition-all duration-300 hover:-translate-y-1 group"
            >
              {/* Quote Stars */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex text-amber-400 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface border border-surfaceBorder text-gray-400">
                  {item.tag}
                </span>
              </div>

              {/* Quote content */}
              <p className="text-sm text-gray-200 leading-relaxed mb-6 italic">
                "{item.content}"
              </p>

              {/* Author info */}
              <div className="flex items-center gap-3 pt-4 border-t border-surfaceBorder/60">
                <div
                  className={`h-10 w-10 rounded-full bg-gradient-to-tr ${colors[idx % colors.length]} flex items-center justify-center font-bold text-white text-xs shadow-md`}
                >
                  {item.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{item.name}</span>
                    <span className="text-xs font-normal text-gray-400">{item.nick}</span>
                  </div>
                  <div className="text-[11px] text-neon-cyan font-medium">
                    {item.role} • {item.age}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Platform Ecosystem Context Logos */}
        <div className="rounded-2xl border border-surfaceBorder/60 bg-[#0F141C]/40 p-6 sm:p-8 text-center max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-6">
            {t.testimonials.partnerTitle}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Twitch Badge */}
            <div className="flex items-center gap-2 text-gray-300 hover:text-brand-purple transition-colors">
              <Radio className="h-6 w-6 text-brand-purple" />
              <span className="text-base font-black tracking-wider">Twitch</span>
            </div>

            {/* YouTube Badge */}
            <div className="flex items-center gap-2 text-gray-300 hover:text-red-500 transition-colors">
              <div className="h-6 w-7 bg-red-600 rounded-md flex items-center justify-center text-white font-bold text-xs">
                ▶
              </div>
              <span className="text-base font-black tracking-wider">YouTube</span>
            </div>

            {/* Discord Badge */}
            <div className="flex items-center gap-2 text-gray-300 hover:text-[#5865F2] transition-colors">
              <MessageCircle className="h-6 w-6 text-[#5865F2]" />
              <span className="text-base font-black tracking-wider">Discord Ready</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
