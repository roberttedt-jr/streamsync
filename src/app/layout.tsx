import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata: Metadata = {
  metadataBase: new URL("https://streamsync-livid.vercel.app"),
  title: "StreamSync | Watch Parties de Gaming en Directo",
  description:
    "Mira directos de Twitch y vídeos de YouTube sincronizados con amigos. Chat de voz integrado, cero lag, overlay de estadísticas de juegos y sincronización milimétrica.",
  keywords: [
    "watch party gaming",
    "ver Twitch con amigos",
    "ver YouTube con amigos",
    "stream sincronizado",
    "watch party español",
    "StreamSync",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "StreamSync | Watch Parties de Gaming en Directo",
    description:
      "Mira directos de Twitch y vídeos de YouTube sincronizados con amigos. Chat de voz integrado, cero lag y overlay de estadísticas.",
    type: "website",
    url: "https://streamsync-livid.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased min-h-screen selection:bg-[#8B5CF6] selection:text-white">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}