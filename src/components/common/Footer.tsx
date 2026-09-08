"use client";

import React from "react";
import Link from "next/link";
import { Gamepad2, Radio, MessageCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t, language } = useLanguage();

  return (
    <footer className="border-t border-white/[0.08] bg-[#07090E] text-gray-400 text-xs mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-7 w-7 shrink-0">
                <img
                  src="/streamsync-logo.png"
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain rounded-md"
                />
              </div>
              <span className="text-sm font-bold text-white font-heading">
                Stream<span className="text-violet-400">Sync</span>
              </span>
            </Link>
            <p className="text-gray-400 text-xs max-w-sm leading-relaxed">
              {t?.footer?.description ||
                (language === "en"
                  ? "StreamSync — Rooms to share Twitch streams with your community, real-time presence, and integrated chat."
                  : "StreamSync — Salas para compartir directos de Twitch con tu comunidad, presencia en tiempo real y chat integrado.")}
            </p>

            {/* Redes y Plataformas */}
            <div className="flex items-center gap-2 pt-1">
              {/* Twitch */}
              <a
                href="https://twitch.tv"
                target="_blank"
                rel="noreferrer"
                className="h-8 px-2.5 rounded-xl bg-white/[0.03] hover:bg-[#9146FF]/20 border border-white/[0.06] hover:border-[#9146FF]/40 flex items-center gap-1.5 text-gray-400 hover:text-[#A970FF] transition-all"
                aria-label="Twitch"
              >
                <Radio className="h-3.5 w-3.5 text-[#9146FF]" />
                <span className="text-[11px] font-semibold">Twitch</span>
              </a>

              {/* Discord */}
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="h-8 px-2.5 rounded-xl bg-white/[0.03] hover:bg-[#5865F2]/20 border border-white/[0.06] hover:border-[#5865F2]/40 flex items-center gap-1.5 text-gray-400 hover:text-[#5865F2] transition-all"
                aria-label="Discord"
              >
                <MessageCircle className="h-3.5 w-3.5 text-[#5865F2]" />
                <span className="text-[11px] font-semibold">Discord</span>
              </a>
              {/* GitHub */}
              <a
                href="https://github.com/roberttedt-jr/streamsync"
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded-xl bg-white/[0.03] hover:bg-white/[0.1] border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white transition-all"
                aria-label="GitHub"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>

              {/* Twitter / X */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded-xl bg-white/[0.03] hover:bg-white/[0.1] border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white transition-all"
                aria-label="Twitter X"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white mb-3 font-heading">
              {t?.footer?.navTitle || (language === "en" ? "Navigation" : "Navegación")}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  {t?.nav?.home || (language === "en" ? "Home" : "Inicio")}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  {t?.nav?.dashboard || (language === "en" ? "Dashboard" : "Dashboard de Salas")}
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-white transition-colors">
                  {t?.nav?.explore || (language === "en" ? "Explore" : "Explorar Streams")}
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-white transition-colors">
                  {t?.nav?.profile || (language === "en" ? "Profile" : "Mi Perfil")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white mb-3 font-heading">
              {t?.footer?.legalTitle || (language === "en" ? "Legal & Support" : "Legal & Soporte")}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  {t?.footer?.terms || (language === "en" ? "Terms of Service" : "Términos del Servicio")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  {t?.footer?.privacy || (language === "en" ? "Privacy Policy" : "Política de Privacidad")}
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/roberttedt-jr/streamsync"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {t?.footer?.openSource || (language === "en" ? "Open Source on GitHub" : "Código Abierto en GitHub")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div>{t?.footer?.rights || "© 2026 StreamSync. Desarrollado por Roberto. Todos los derechos reservados."}</div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>{language === "en" ? "Operating servers • Low latency" : "Servidores operativos • Baja latencia"}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
