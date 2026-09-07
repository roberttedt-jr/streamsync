"use client";

import React from "react";
import { Star, Users, Radio, MessageCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Testimonials() {
  const { t } = useLanguage();

  const avatarGradients = [
    "from-neon-cyan via-blue-500 to-indigo-600",
    "from-neon-purple via-purple-600 to-pink-600",
    "from-neon-pink via-rose-500 to-amber-500",
  ];

  return (
    <section id="testimonios" className="relative py-24 lg:py-32 overflow-hidden border-t border-white/[0.05]">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-neon-pink/10 blur-[170px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 glass-pill px-4 py-1.5 rounded-full text-neon-pink text-xs font-bold uppercase tracking-widest mb-5">
            <Users className="h-3.5 w-3.5" />
            <span>{t.testimonials.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-4">
            {t.testimonials.titleStart}{" "}
            <span className="bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
              {t.testimonials.titleHighlight}
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto">
            {t.testimonials.subtitle}
          </p>
        </div>

        {/* 3 Liquid Glass Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {t.testimonials.items.map((item, idx) => (
            <div
              key={idx}
              className="group relative rounded-3xl glass-card p-8 flex flex-col justify-between overflow-hidden"
            >
              {/* Top glossy specular reflection */}
              <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex text-amber-400 gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono glass-pill text-gray-400 px-2.5 py-0.5 rounded-full">
                    {item.tag}
                  </span>
                </div>

                <p className="text-sm text-gray-200 leading-relaxed mb-8 font-normal italic">
                  "{item.content}"
                </p>
              </div>

              {/* Author footer */}
              <div className="flex items-center gap-3.5 pt-5 border-t border-white/[0.06]">
                <div
                  className={`h-10 w-10 rounded-full bg-gradient-to-tr ${avatarGradients[idx % avatarGradients.length]} p-[1px] shadow-lg`}
                >
                  <div className="h-full w-full rounded-full bg-[#070A10] flex items-center justify-center font-black text-white text-xs">
                    {item.name.substring(0, 2).toUpperCase()}
                  </div>
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

        {/* Frosted Ecosystem Ribbon */}
        <div className="rounded-3xl glass-panel p-6 sm:p-8 text-center max-w-4xl mx-auto shadow-2xl">
          <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-6">
            {t.testimonials.partnerTitle}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 opacity-70 hover:opacity-100 transition-opacity duration-300">
            {/* Twitch */}
            <div className="flex items-center gap-2.5 text-gray-300 hover:text-brand-purple transition-colors">
              <Radio className="h-5 w-5 text-brand-purple" />
              <span className="text-sm sm:text-base font-black tracking-wider">Twitch</span>
            </div>

            {/* YouTube */}
            <div className="flex items-center gap-2.5 text-gray-300 hover:text-red-500 transition-colors">
              <div className="h-5 w-6 bg-red-600 rounded-md flex items-center justify-center text-white font-bold text-[10px]">
                ▶
              </div>
              <span className="text-sm sm:text-base font-black tracking-wider">YouTube</span>
            </div>

            {/* Discord */}
            <div className="flex items-center gap-2.5 text-gray-300 hover:text-[#5865F2] transition-colors">
              <MessageCircle className="h-5 w-5 text-[#5865F2]" />
              <span className="text-sm sm:text-base font-black tracking-wider">Discord Ready</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
