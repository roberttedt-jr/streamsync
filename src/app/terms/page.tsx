"use client";

import React from "react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { ShieldCheck, FileText, CheckCircle2 } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Condiciones Legales 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Términos de Servicio de StreamSync
          </h1>
          <p className="text-sm text-gray-400">
            Última actualización: 8 de Septiembre de 2026
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
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              2. Servicios de Watch Party y Sincronización
            </h2>
            <p>
              StreamSync proporciona herramientas tecnológicas para sincronizar la reproducción de emisiones y vídeos públicos de plataformas de terceros (Twitch Interactive, Inc. y YouTube / Google LLC) en tiempo real, junto con capacidades de comunicación por voz y texto mediante WebRTC.
            </p>
            <p>
              StreamSync no aloja transmisiones con derechos de autor ni retransmite secuencias de vídeo protegidas en sus servidores; el contenido es transmitido directamente desde los reproductores oficiales integrados de Twitch y YouTube.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              3. Cuentas y Conducta de Usuario
            </h2>
            <p>
              Los usuarios son responsables de mantener la confidencialidad de sus credenciales y de toda actividad realizada en sus salas. Queda terminantemente prohibido utilizar el chat o los canales de voz para conductas de odio, acoso, infracciones de derechos de autor o actividades ilícitas.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              4. Integraciones con Terceros (Twitch & Google/YouTube)
            </h2>
            <p>
              Al utilizar la autenticación OAuth con Twitch o Google, autorizas a StreamSync a acceder únicamente a los datos autorizados por ti en la pantalla de consentimiento. Al utilizar las funciones de YouTube en StreamSync, los usuarios aceptan quedar sujetos a las <a href="https://www.youtube.com/t/terms" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">Condiciones de Servicio de YouTube (YouTube Terms of Service)</a>. Puedes revocar estos permisos en cualquier momento desde la configuración de tu cuenta en Twitch o Google.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              5. Propiedad Intelectual
            </h2>
            <p>
              StreamSync, su diseño, arquitectura y código fuente son propiedad de Roberto Tedt (roberttedt-jr). Todos los derechos reservados. Las marcas comerciales, logotipos de Twitch, YouTube, Discord y videojuegos mostrados pertenecen a sus respectivos propietarios.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
