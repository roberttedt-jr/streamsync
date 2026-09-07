"use client";

import React from "react";
import { Star, Radio, MessageCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Testimonials() {
  const { t } = useLanguage();

  return (
    <section id="testimonios" className="py-20 lg:py-28 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono tracking-widest text-gray-500 uppercase mb-3 block">
            {t.testimonials.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            {t.testimonials.titleStart} {t.testimonials.titleHighlight}
          </h2>
          <p className="text-sm text-gray-400 font-normal leading-relaxed">
            {t.testimonials.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {t.testimonials.items.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#0D0F17] border border-white/[0.08] p-7 flex flex-col justify-between hover:border-white/20 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-amber-400/90 gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 px-2 py-0.5 rounded-md bg-white/[0.03]">
                    {item.tag}
                  </span>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed mb-6 font-normal">
                  "{item.content}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                <div className="h-8 w-8 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center font-bold text-white text-xs">
                  {item.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{item.name}</span>
                    <span className="text-[11px] font-normal text-gray-400">{item.nick}</span>
                  </div>
                  <div className="text-[11px] text-gray-400">
                    {item.role} • {item.age}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-[#0D0F17] border border-white/[0.08] p-6 text-center max-w-3xl mx-auto">
          <p className="text-xs font-mono tracking-widest text-gray-500 uppercase mb-4">
            {t.testimonials.partnerTitle}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-80">
            <div className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
              <Radio className="h-4 w-4 text-[#9146FF]" />
              <span className="text-xs font-bold tracking-wider">Twitch</span>
            </div>

            <div className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
              <div className="h-3.5 w-4.5 bg-red-600 rounded flex items-center justify-center text-white text-[8px] font-bold">
                ▶
              </div>
              <span className="text-xs font-bold tracking-wider">YouTube</span>
            </div>

            <div className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
              <MessageCircle className="h-4 w-4 text-[#5865F2]" />
              <span className="text-xs font-bold tracking-wider">Discord</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
