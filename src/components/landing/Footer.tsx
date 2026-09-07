"use client";

import React from "react";
import { Gamepad2, Radio, MessageCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer id="contacto" className="border-t border-white/[0.06] bg-[#08090C] text-gray-400 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white">
                <Gamepad2 className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-bold text-white">
                Stream<span className="text-gray-400">Sync</span>
              </span>
            </div>
            <p className="text-gray-400 text-xs max-w-sm leading-relaxed">
              {t.footer.description}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://twitch.tv"
                target="_blank"
                rel="noreferrer"
                className="h-7 w-7 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                aria-label="Twitch"
              >
                <Radio className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="h-7 w-7 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <div className="text-[9px] font-bold">▶</div>
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="h-7 w-7 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                aria-label="Discord"
              >
                <MessageCircle className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white mb-3">
              {t.footer.navTitle}
            </h4>
            <ul className="space-y-2 text-xs">
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
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white mb-3">
              {t.footer.legalTitle}
            </h4>
            <ul className="space-y-2 text-xs">
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
                <a
                  href="https://github.com/roberttedt-jr/streamsync"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {t.footer.openSource}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div>{t.footer.rights}</div>
          <div>{t.footer.forGamers}</div>
        </div>
      </div>
    </footer>
  );
}
