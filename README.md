# 🎮 StreamSync — Watch Parties de Twitch

> **Crea una sala, comparte un directo de Twitch y disfruta del stream con tu comunidad.**

StreamSync es una plataforma web especializada exclusivamente en Watch Parties de directos de Twitch, permitiendo crear salas compartidas con presencia de usuarios en tiempo real, chat interactivo, controles de anfitrión y opciones voluntarias de voz y vídeo WebRTC.

Desarrollado por **Roberto Tedt (roberttedt-jr)**.

---

## ✨ Características Principales

- **Salas compartidas con presencia en tiempo real:** Visualiza quién está conectado en la sala con lista interactiva de participantes y estados de conexión.
- **Chat en directo entre participantes:** Mensajería instantánea dentro de la sala con avatares personalizados y soporte para participantes e invitados.
- **Voz y cámara opcionales, solo tras autorización explícita:** Comunicación WebRTC directa entre navegadores, respetando la privacidad sin grabación ni almacenamiento en servidores.
- **Controles y configuración de sala para anfitriones:** Gestión de privacidad, contraseña, límites de participantes y opciones de eliminación segura de la sala por parte del anfitrión.
- **Reproductor Twitch adaptable para escritorio y móvil:** Integración oficial del reproductor de Twitch optimizada para evitar espacios negros y recortados en cualquier tamaño de pantalla.

---

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 14 (App Router)
- **Autenticación:** Auth.js / NextAuth (Twitch OAuth con sincronización de seguidos, Modo Invitado y credenciales locales)
- **Base de Datos & ORM:** Prisma con PostgreSQL (Neon)
- **Estilos:** Tailwind CSS con interfaz Dark Mode premium
- **Comunicaciones:** WebRTC peer-to-peer para voz y cámara opcional

---

## ⚙️ Configuración de Variables de Entorno

Configura las siguientes variables en Vercel (`Settings` > `Environment Variables`) o en tu archivo local `.env.local`:

```env
# Base de datos PostgreSQL (Neon)
DATABASE_URL="postgresql://usuario:password@host/streamsync?sslmode=require"

# NextAuth / Auth.js
NEXTAUTH_URL="https://streamsync-livid.vercel.app"
AUTH_SECRET="tu_clave_secreta_jwt"

# Twitch OAuth
TWITCH_CLIENT_ID="tu_twitch_client_id"
TWITCH_CLIENT_SECRET="tu_twitch_client_secret"
```

### Redirect URIs para Twitch Developer Console
- **Producción:** `https://streamsync-livid.vercel.app/api/auth/callback/twitch`
- **Desarrollo local:** `http://localhost:3000/api/auth/callback/twitch`

---

## 💡 Modo Invitado

StreamSync incluye un modo de acceso inmediato como invitado (`Continuar como Invitado` en `/auth`), permitiendo explorar y crear salas sin necesidad de registrarse previamente.

---

## 📜 Licencia y Avisos Legales

© 2026 StreamSync. Desarrollado por **Roberto**. Todos los derechos reservados.
StreamSync no está afiliado, patrocinado ni respaldado por Twitch Interactive, Inc. Todas las marcas comerciales mostradas pertenecen a sus respectivos propietarios.
