"use client";

import React from "react";
import Link from "next/link";
import { Gamepad2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t, language } = useLanguage();

  return (
    <footer className="border-t border-white/[0.08] bg-[#07090E] text-gray-400 text-xs mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 p-[1px] flex items-center justify-center">
                <div className="h-full w-full rounded-[7px] bg-[#07090E] flex items-center justify-center">
                  <Gamepad2 className="h-3.5 w-3.5 text-white" />
                </div>
              </div>
              <span className="text-sm font-bold text-white font-heading">
                Stream<span className="text-violet-400">Sync</span>
              </span>
            </Link>
            <p className="text-gray-400 text-xs max-w-sm leading-relaxed">
              {t?.footer?.description ||
                (language === "en"
                  ? "The ultimate platform to enjoy synchronized Twitch & YouTube streams with friends, ultra-fast voice chat, and live game stats."
                  : "La plataforma definitiva para disfrutar de directos de Twitch y YouTube sincronizados al milisegundo con amigos, chat de voz ultrarrápido y overlay de estadísticas.")}
            </p>

            {/* Redes y Plataformas Oficiales */}
            <div className="flex items-center gap-2 pt-1">
              {/* Twitch */}
              <a
                href="https://twitch.tv"
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded-xl bg-white/[0.03] hover:bg-[#9146FF]/20 border border-white/[0.06] hover:border-[#9146FF]/40 flex items-center justify-center text-gray-400 hover:text-[#A970FF] transition-all"
                aria-label="Twitch"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded-xl bg-white/[0.03] hover:bg-red-600/20 border border-white/[0.06] hover:border-red-600/40 flex items-center justify-center text-gray-400 hover:text-[#FF0000] transition-all"
                aria-label="YouTube"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              {/* Discord */}
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded-xl bg-white/[0.03] hover:bg-[#5865F2]/20 border border-white/[0.06] hover:border-[#5865F2]/40 flex items-center justify-center text-gray-400 hover:text-[#5865F2] transition-all"
                aria-label="Discord"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
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
