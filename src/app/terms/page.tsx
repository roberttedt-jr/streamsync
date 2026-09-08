"use client";

import React from "react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { ShieldCheck, CheckCircle2, Radio, Mic } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Condiciones Legales</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Términos de Servicio de StreamSync
          </h1>
          <p className="text-sm text-gray-400">
            Especializado en Watch Parties de Twitch. Última actualización: 2026.
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 text-sm text-gray-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              1. Aceptación de los Términos
            </h2>
            <p>
              Al acceder o utilizar la plataforma StreamSync (en adelante, "la Aplicación"), aceptas cumplir y estar sujeto a estos Términos de Servicio. Si no estás de acuerdo con alguna parte de los términos, te rogamos no utilizar la plataforma.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-purple-400" />
              2. Servicios de Watch Party de Twitch
            </h2>
            <p>
              StreamSync proporciona herramientas tecnológicas para crear salas compartidas de visualización de directos públicos de Twitch, con presencia de usuarios en tiempo real y chat integrado entre participantes.
            </p>
            <p>
              StreamSync no aloja transmisiones con derechos de autor ni retransmite secuencias de vídeo protegidas en sus servidores; las emisiones se reproducen directamente a través del reproductor oficial incrustado de Twitch.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Mic className="w-4 h-4 text-purple-400" />
              3. Voz y Cámara Opcionales vía WebRTC
            </h2>
            <p>
              Las capacidades de voz y cámara son funciones complementarias y completamente opcionales en cada sala. Solo se activan si el participante otorga autorización explícita a su navegador.
            </p>
            <p>
              Las comunicaciones audiovisuales se transmiten directamente entre los navegadores de los participantes (peer-to-peer WebRTC). StreamSync no almacena, no graba ni procesa el contenido de audio o vídeo en sus servidores.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              4. Cuentas, Autenticación y Desvinculación de Twitch
            </h2>
            <p>
              Al iniciar sesión con Twitch, autorizas a StreamSync a acceder únicamente a los datos públicos autorizados por ti en la pantalla de consentimiento de Twitch. Puedes revocar estos permisos en cualquier momento desde los ajustes de tu cuenta de Twitch o desde tu perfil en StreamSync.
            </p>
            <p>
              StreamSync es un proyecto independiente y no está afiliado, patrocinado ni respaldado por Twitch Interactive, Inc.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              5. Propiedad Intelectual
            </h2>
            <p>
              StreamSync, su diseño, arquitectura y código fuente son propiedad de sus respectivos autores. Todos los derechos reservados. Las marcas comerciales y nombres comerciales mostrados pertenecen a sus legítimos titulares.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
