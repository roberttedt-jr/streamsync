"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import {
  Gamepad2,
  Tv,
  Radio,
  User,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Upload,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Volume2,
} from "lucide-react";

function AuthFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";
  const { user, login, register, loginAsGuest } = useAuth();
  const { addToast } = useToast();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [providersStatus, setProvidersStatus] = useState<{ twitch: boolean; google: boolean }>({
    twitch: false,
    google: false,
  });

  // Check which providers have their environment variables set
  useEffect(() => {
    fetch("/api/auth/providers-status")
      .then((res) => res.json())
      .then((data) => {
        setProvidersStatus({
          twitch: Boolean(data.twitch),
          google: Boolean(data.google),
        });
      })
      .catch(() => {});
  }, []);

  // Form states
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [twitchUsername, setTwitchUsername] = useState("");
  const [youtubeHandle, setYoutubeHandle] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push(callbackUrl);
    }
  }, [user, callbackUrl, router]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addToast("La imagen debe pesar menos de 2MB", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        addToast("Foto de perfil seleccionada", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOAuth = async (provider: "twitch" | "google") => {
    if (provider === "twitch" && !providersStatus.twitch) {
      addToast(
        "Twitch OAuth pendiente: añade TWITCH_CLIENT_ID y TWITCH_CLIENT_SECRET en el panel de Vercel o en .env.local",
        "info"
      );
      return;
    }
    if (provider === "google" && !providersStatus.google) {
      addToast(
        "Google/YouTube OAuth pendiente: añade GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en el panel de Vercel o en .env.local",
        "info"
      );
      return;
    }

    setLoading(true);
    try {
      addToast(`Iniciando conexión con ${provider === "twitch" ? "Twitch" : "YouTube / Google"}...`, "info");
      await signIn(provider, { callbackUrl });
    } catch (err: any) {
      addToast("No se pudo iniciar la conexión con el proveedor", "error");
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      const res = await loginAsGuest();
      if (res.success) {
        addToast("Sesión iniciada como Invitado. ¡Bienvenido a StreamSync!", "success");
        router.push(callbackUrl);
      }
    } catch (err: any) {
      addToast("Error al iniciar como invitado", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "login") {
      if (!identifier || !password) {
        addToast("Completa todos los campos", "error");
        setLoading(false);
        return;
      }
      const res = await login(identifier, password);
      if (res.success) {
        addToast("¡Sesión iniciada correctamente!", "success");
        router.push(callbackUrl);
      } else {
        addToast(res.error || "Credenciales incorrectas", "error");
      }
    } else {
      if (!name || !username || !email || !password) {
        addToast("Rellena todos los campos obligatorios", "error");
        setLoading(false);
        return;
      }

      const res = await register({
        name,
        username,
        email,
        password,
        avatar: avatarPreview,
        twitchUsername: twitchUsername.trim() || undefined,
        youtubeHandle: youtubeHandle.trim() || undefined,
      });

      if (res.success) {
        addToast("¡Cuenta creada con éxito! Bienvenido a StreamSync", "success");
        router.push(callbackUrl);
      } else {
        addToast(res.error || "Error al crear la cuenta", "error");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 items-center">
          {/* Left Column: Value Prop & Features */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Acceso StreamSync 2026</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Vive las mejores{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
                Watch Parties
              </span>{" "}
              en tiempo real
            </h1>

            <p className="text-sm text-gray-400 leading-relaxed">
              Conecta tus cuentas oficiales o entra como invitado en segundos para sincronizar directos de Twitch y YouTube con chat de voz HD y estadísticas de juego.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Sincronización a 0ms</h4>
                  <p className="text-xs text-gray-400">Reproducción exacta entre todos los integrantes de la sala.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Voz WebRTC con Cola de Turno</h4>
                  <p className="text-xs text-gray-400">Habla fluidamente o pide turno con el botón de levantar mano.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Sin Anuncios Desincronizados</h4>
                  <p className="text-xs text-gray-400">Tus datos están protegidos y puedes salir en cualquier momento.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Unified Auth Card */}
          <div className="lg:col-span-7">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
              {/* OAuth Social Section */}
              <div className="space-y-3 mb-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">
                  Conexión directa con un clic
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Twitch Button */}
                  <button
                    type="button"
                    onClick={() => handleOAuth("twitch")}
                    disabled={loading}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold text-sm transition-all shadow-lg cursor-pointer ${
                      providersStatus.twitch
                        ? "bg-[#9146FF] hover:bg-[#772ce8] shadow-[#9146FF]/25 active:scale-[0.99]"
                        : "bg-[#9146FF]/50 border border-purple-400/20 hover:bg-[#9146FF]/70"
                    }`}
                    title={
                      providersStatus.twitch
                        ? "Entrar con tu cuenta de Twitch"
                        : "Pendiente: Configura TWITCH_CLIENT_ID y TWITCH_CLIENT_SECRET en Vercel o .env.local"
                    }
                  >
                    <Radio className="w-4 h-4 shrink-0" />
                    <span className="flex items-center gap-1.5">
                      <span>Entrar con Twitch</span>
                      {!providersStatus.twitch && (
                        <span className="text-[9px] font-mono bg-white/20 px-1 py-0.2 rounded text-white/90">
                          Setup
                        </span>
                      )}
                    </span>
                  </button>

                  {/* YouTube Button */}
                  <button
                    type="button"
                    onClick={() => handleOAuth("google")}
                    disabled={loading}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold text-sm transition-all shadow-lg cursor-pointer ${
                      providersStatus.google
                        ? "bg-[#FF0000] hover:bg-[#cc0000] shadow-[#FF0000]/25 active:scale-[0.99]"
                        : "bg-[#FF0000]/50 border border-red-400/20 hover:bg-[#FF0000]/70"
                    }`}
                    title={
                      providersStatus.google
                        ? "Entrar con tu cuenta de Google / YouTube"
                        : "Pendiente: Configura GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en Vercel o .env.local"
                    }
                  >
                    <Tv className="w-4 h-4 shrink-0" />
                    <span className="flex items-center gap-1.5">
                      <span>Entrar con YouTube</span>
                      {!providersStatus.google && (
                        <span className="text-[9px] font-mono bg-white/20 px-1 py-0.2 rounded text-white/90">
                          Setup
                        </span>
                      )}
                    </span>
                  </button>
                </div>

                {(!providersStatus.twitch || !providersStatus.google) && (
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-[11px] text-gray-300 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>Configuración pendiente:</strong> Para habilitar OAuth directo con Twitch o YouTube, añade las variables en el panel de Vercel o en tu archivo local <code className="bg-black/50 text-purple-300 px-1 py-0.5 rounded font-mono text-[10px]">.env.local</code>. Mientras tanto, puedes usar <strong>Continuar como Invitado</strong> con acceso completo.
                    </p>
                  </div>
                )}

                {/* Quick Guest Button */}
                <button
                  type="button"
                  onClick={handleGuestLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                >
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Continuar como Invitado (Sin registro)</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <span className="relative px-3 bg-[#0c1017] text-xs uppercase tracking-wider text-gray-400 font-medium">
                  o con tu cuenta de StreamSync
                </span>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="flex rounded-xl bg-white/5 p-1 mb-6 border border-white/5">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                    mode === "login"
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                    mode === "register"
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Crear Cuenta
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "register" && (
                  <>
                    {/* Avatar Upload */}
                    <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-white/10 flex items-center justify-center border border-white/15 shrink-0">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="text-xs font-bold block mb-1 text-gray-200">Foto de perfil</label>
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 transition">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Subir desde mi equipo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">Nombre completo *</label>
                        <div className="relative">
                          <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                          <input
                            type="text"
                            required
                            placeholder="Ej. Roberto Gamer"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">Nombre de usuario *</label>
                        <div className="relative">
                          <span className="text-gray-500 absolute left-3 top-2.5 text-xs">@</span>
                          <input
                            type="text"
                            required
                            placeholder="roberto2026"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Correo electrónico *</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                        <input
                          type="email"
                          required
                          placeholder="tu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">Twitch (opcional)</label>
                        <div className="relative">
                          <Radio className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            placeholder="tu_canal"
                            value={twitchUsername}
                            onChange={(e) => setTwitchUsername(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">YouTube (opcional)</label>
                        <div className="relative">
                          <Tv className="w-4 h-4 text-red-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            placeholder="@tu_canal"
                            value={youtubeHandle}
                            onChange={(e) => setYoutubeHandle(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {mode === "login" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Email o Nombre de Usuario
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="tu@email.com o usuario"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Contraseña</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.99] transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  <span>{mode === "login" ? "Entrar a StreamSync" : "Completar Registro"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-6 text-center text-xs text-gray-500">
                Al continuar aceptas nuestros{" "}
                <Link href="/terms" className="text-purple-400 hover:underline">
                  Términos de Servicio
                </Link>{" "}
                y la{" "}
                <Link href="/privacy" className="text-purple-400 hover:underline">
                  Política de Privacidad
                </Link>
                .
              </div>
            </div>
          </div>
        </div>
      </main>

        <Footer />
      </div>
    );
  }

  export default function AuthPage() {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#090B10] flex items-center justify-center text-white">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <AuthFormContent />
      </Suspense>
    );
  }
