"use client";

import React from "react";
import { Gamepad2, Radio, MessageCircle, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contacto" className="border-t border-surfaceBorder/60 bg-[#0B0F14] text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-purple to-neon-cyan flex items-center justify-center text-white shadow-md shadow-purple-900/30">
                <Gamepad2 className="h-5 w-5" />
              </div>
              <span className="text-xl font-black tracking-wider text-white">
                STREAM<span className="text-neon-cyan">SYNC</span>
              </span>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm max-w-sm leading-relaxed">
              La plataforma definitiva para disfrutar de directos de Twitch y vídeos de YouTube sincronizados con amigos, chat de voz ultrarrápido y overlay de estadísticas.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://twitch.tv"
                target="_blank"
                rel="noreferrer"
                className="h-9 w-9 rounded-lg bg-surface border border-surfaceBorder flex items-center justify-center text-gray-400 hover:text-brand-purple hover:border-brand-purple transition"
                aria-label="Twitch"
              >
                <Radio className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="h-9 w-9 rounded-lg bg-surface border border-surfaceBorder flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-500 transition"
                aria-label="YouTube"
              >
                <div className="text-xs font-bold">▶</div>
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="h-9 w-9 rounded-lg bg-surface border border-surfaceBorder flex items-center justify-center text-gray-400 hover:text-[#5865F2] hover:border-[#5865F2] transition"
                aria-label="Discord"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Navegación
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a href="#como-funciona" className="hover:text-neon-cyan transition-colors">
                  Cómo funciona
                </a>
              </li>
              <li>
                <a href="#caracteristicas" className="hover:text-neon-cyan transition-colors">
                  Características
                </a>
              </li>
              <li>
                <a href="#testimonios" className="hover:text-neon-cyan transition-colors">
                  Comunidad
                </a>
              </li>
              <li>
                <a href="mailto:soporte@streamsync.gg" className="hover:text-neon-cyan transition-colors">
                  Contacto y Soporte
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Legal y Proyecto
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a href="#" className="hover:text-neon-cyan transition-colors">
                  Términos del Servicio
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-neon-cyan transition-colors">
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-neon-cyan transition-colors">
                  Cookies y Datos
                </a>
              </li>
              <li>
                <a href="https://github.com/roberttedt-jr/streamsync" target="_blank" rel="noreferrer" className="hover:text-neon-cyan transition-colors">
                  Código Abierto en GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-surfaceBorder/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div>
            © 2025 StreamSync. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            Hecho con <Heart className="h-3 w-3 text-neon-pink fill-current mx-0.5" /> para gamers y comunidades.
          </div>
        </div>
      </div>
    </footer>
  );
}
