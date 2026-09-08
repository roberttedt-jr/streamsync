"use client";

import React from "react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Shield, Lock, Eye, Database, Radio, Mic } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Shield className="w-3.5 h-3.5" />
            <span>Privacidad y Protección de Datos</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Política de Privacidad de StreamSync
          </h1>
          <p className="text-sm text-gray-400">
            Especializado en Watch Parties de Twitch. Última actualización: 2026.
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 text-sm text-gray-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400" />
              1. Información que recopilamos
            </h2>
            <p>
              StreamSync recopila únicamente la información imprescindible para operar el servicio:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-gray-400">
              <li>
                <strong>Cuentas Twitch OAuth:</strong> Si te conectas mediante Twitch, recibimos tu identificador de usuario, nombre de usuario público, avatar y dirección de correo electrónico según los permisos que autorices expresamente.
              </li>
              <li>
                <strong>Cuentas locales / Invitados:</strong> Nombre público, avatar y credenciales cifradas con hash criptográfico irreversible.
              </li>
              <li>
                <strong>Datos de actividad en salas:</strong> Salas creadas, historial de participación y canales de Twitch sincronizados que desees consultar en tu perfil.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Mic className="w-4 h-4 text-purple-400" />
              2. Voz, cámara y comunicaciones WebRTC
            </h2>
            <p>
              El uso de micrófono y cámara en las salas de StreamSync es <strong>completamente opcional</strong> y solo se activa tras tu autorización explícita en el navegador.
            </p>
            <p>
              Las transmisiones de audio y vídeo se realizan mediante conexiones directas entre navegadores (WebRTC peer-to-peer). StreamSync <strong>no graba, no almacena ni monitoriza</strong> las conversaciones de voz o señales de cámara de los usuarios en sus servidores.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-purple-400" />
              3. Desvinculación de responsabilidad y uso de Twitch
            </h2>
            <p>
              StreamSync no está afiliado, asociado, respaldado ni conectado de ninguna forma oficial con Twitch Interactive, Inc. ni con ninguna de sus filiales.
            </p>
            <p>
              Las reproducciones de streams se realizan a través del reproductor oficial incrustado de Twitch, respetando las políticas y condiciones del servicio original.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" />
              4. Almacenamiento, Seguridad y No cesión de datos
            </h2>
            <p>
              Todas las comunicaciones entre el cliente y nuestros servidores viajan cifradas con TLS/HTTPS. Las contraseñas se almacenan mediante algoritmos de derivación de claves irreversibles con salt aleatorio.
            </p>
            <p>
              StreamSync <strong>nunca vende, cede ni comercializa</strong> tu información personal con anunciantes o terceros con fines de lucro.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              5. Derechos y revocación de accesos
            </h2>
            <p>
              Puedes revocar el acceso de StreamSync a tu cuenta de Twitch en cualquier momento desde los ajustes de conexiones de tu cuenta de Twitch o desconectándola desde tu perfil en StreamSync.
            </p>
            <p>
              También puedes solicitar la rectificación o supresión de tus datos de usuario contactando con los administradores de la plataforma.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
