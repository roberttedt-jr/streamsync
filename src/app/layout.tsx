import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import PWAHandler from "@/components/common/PWAHandler";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#09090B",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://streamsync-livid.vercel.app"),
  applicationName: "StreamSync",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "StreamSync",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  title: "StreamSync — Watch Parties de Twitch con tu comunidad",
  description: "Crea una sala, comparte un directo de Twitch y disfruta del stream con presencia y chat compartidos en tiempo real.",
  keywords: [
    "StreamSync",
    "Watch Parties de Twitch",
    "Twitch-only Watch Parties",
    "ver Twitch con amigos",
    "salas de Twitch",
    "stream con tu comunidad",
    "presencia y chat en tiempo real",
  ],
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/streamsync-logo-192.png", sizes: "192x192", type: "image/png" },
      { url: "/streamsync-logo.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon-32x32.png",
  },
  openGraph: {
    title: "StreamSync — Watch Parties de Twitch con tu comunidad",
    description: "Crea una sala, comparte un directo de Twitch y disfruta del stream con presencia y chat compartidos en tiempo real.",
    type: "website",
    url: "https://streamsync-livid.vercel.app",
    images: [
      {
        url: "/streamsync-logo-512.png",
        width: 512,
        height: 512,
        alt: "StreamSync Logo",
      },
    ],
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
                <PWAHandler />
                {children}
              </ToastProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}