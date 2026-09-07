import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StreamSync | Gaming Watch Parties",
  description: "Mira streams de Twitch y YouTube sincronizados con amigos con voice chat.",
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