"use client";

import React from "react";
import { Gamepad2, Radio, MessageCircle, Heart } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer id="contacto" className="border-t border-white/[0.06] bg-[#05070B] text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-brand-purple to-neon-cyan p-[1px]">
                <div className="h-full w-full rounded-full bg-[#070A10] flex items-center justify-center text-neon-cyan">
                  <Gamepad2 className="h-4 w-4" />
                </div>
              </div>
              <span className="text-xl font-black tracking-wider text-white">
                STREAM<span className="text-neon-cyan">SYNC</span>
              </span>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm max-w-sm leading-relaxed font-normal">
              {t.footer.description}
            </p>
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="https://twitch.tv"
                target="_blank"
                rel="noreferrer"
                className="h-9 w-9 rounded-full glass-pill flex items-center justify-center text-gray-400 hover:text-brand-purple hover:border-brand-purple/50 transition-colors"
                aria-label="Twitch"
              >
                <Radio className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="h-9 w-9 rounded-full glass-pill flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-500/50 transition-colors"
                aria-label="YouTube"
              >
                <div className="text-xs font-bold">▶</div>
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="h-9 w-9 rounded-full glass-pill flex items-center justify-center text-gray-400 hover:text-[#5865F2] hover:border-[#5865F2]/50 transition-colors"
                aria-label="Discord"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              {t.footer.navTitle}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a href="#como-funciona" className="hover:text-white transition-colors">
                  {t.header.howItWorks}
                </a>
              </li>
              <li>
                <a href="#caracteristicas" className="hover:text-white transition-colors">
                  {t.header.features}
                </a>
              </li>
              <li>
                <a href="#testimonios" className="hover:text-white transition-colors">
                  {t.header.community}
                </a>
              </li>
              <li>
                <a href="mailto:soporte@streamsync.gg" className="hover:text-white transition-colors">
                  {t.header.contact}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              {t.footer.legalTitle}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t.footer.terms}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t.footer.privacy}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t.footer.cookies}
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/roberttedt-jr/streamsync"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-neon-cyan transition-colors"
                >
                  {t.footer.openSource}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div>{t.footer.rights}</div>
          <div className="flex items-center gap-1 text-gray-400">
            {t.footer.madeWith} <Heart className="h-3 w-3 text-neon-pink fill-current mx-0.5" />{" "}
            {t.footer.forGamers}
          </div>
        </div>
      </div>
    </footer>
  );
}
