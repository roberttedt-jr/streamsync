import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://streamsync-livid.vercel.app"),
  title: "StreamSync | Watch Parties de Gaming en Directo",
  description:
    "Mira directos de Twitch y vídeos de YouTube sincronizados con amigos. Chat de voz integrado, cero lag y overlay de estadísticas para tu squad gamer.",
  keywords: [
    "watch party gaming",
    "ver Twitch con amigos",
    "ver YouTube con amigos",
    "stream sincronizado",
    "watch party español",
  ],
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
    <html lang="es">
      <body className="antialiased bg-background text-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}