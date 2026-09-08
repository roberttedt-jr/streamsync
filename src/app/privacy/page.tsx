"use client";

import React from "react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Shield, Lock, Eye, Database } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Shield className="w-3.5 h-3.5" />
            <span>Privacidad y Protección de Datos 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Política de Privacidad de StreamSync
          </h1>
          <p className="text-sm text-gray-400">
            Última actualización: 8 de Septiembre de 2026
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 text-sm text-gray-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              1. Información que recopilamos
            </h2>
            <p>
              StreamSync recopila únicamente la información imprescindible para operar el servicio:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-gray-400">
              <li>
                <strong>Cuentas OAuth:</strong> Si te conectas mediante Twitch o Google/YouTube, recibimos tu ID de usuario, nombre público, avatar y dirección de correo electrónico según los alcances otorgados.
              </li>
              <li>
                <strong>Cuentas locales / Invitados:</strong> Nombre público, avatar cargado localmente, y credenciales cifradas con hash seguro (bcrypt).
              </li>
              <li>
                <strong>Audio y WebRTC:</strong> Las transmisiones de voz se establecen de forma peer-to-peer cifrada (DTLS/SRTP) o a través de relés temporales sin grabación persistente.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              2. Uso de los datos
            </h2>
            <p>
              Tus datos se utilizan exclusivamente para permitir la creación y participación en watch parties sincronizadas, gestionar los canales seguidos que desees consultar en tu perfil y mantener tus estadísticas de uso en la plataforma.
            </p>
            <p>
              StreamSync <strong>nunca</strong> vende, comparte ni comercializa tu información personal con empresas de publicidad externas.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              3. Almacenamiento y Seguridad
            </h2>
            <p>
              Las contraseñas se almacenan mediante funciones hash irreversibles. La conexión con la plataforma se realiza íntegramente mediante cifrado TLS/HTTPS.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              4. Tus Derechos de Privacidad
            </h2>
            <p>
              Puedes editar tu perfil o eliminar tu cuenta en cualquier momento desde la sección de ajustes o solicitándolo a través de los canales de contacto de StreamSync.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
