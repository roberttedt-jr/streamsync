# 🎮 StreamSync — Watch Parties de Twitch

> **Crea una sala, comparte un directo de Twitch y disfruta del stream con tu comunidad.**

StreamSync es una plataforma web especializada exclusivamente en Watch Parties de directos de Twitch, permitiendo crear salas compartidas con presencia de usuarios en tiempo real, chat interactivo, controles de anfitrión y opciones voluntarias de voz y vídeo WebRTC.

Desarrollado por **Roberto Tedt (roberttedt-jr)**.

---

## ✨ Características Principales

- **Salas privadas o públicas:** Crea salas compartidas abiertas para la comunidad o privadas mediante enlace exclusivo de un solo clic.
- **Participantes visibles y presencia compartida:** Visualiza en tiempo real quién está en la sala con roles de anfitrión y contador de miembros actualizado en vivo.
- **Chat en directo entre personas conectadas:** Mensajería instantánea bidireccional sin recargas de página para comentar cada jugada en directo.
- **Reproductor Twitch adaptado a escritorio y móvil:** Relación de aspecto 16:9 estricta, sin zonas negras artificiales y con controles inferiores despejados.
- **Gestión de sala para anfitriones:** El creador puede cambiar de stream en cualquier momento y eliminar la sala de forma segura con confirmación explícita ("ELIMINAR").
- **Voz y cámara opcionales (Beta WebRTC):** Estrictamente opt-in. Solo se activa si el usuario lo autoriza expresamente, garantizando la privacidad.

---

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 14 (App Router)
- **Autenticación:** Auth.js / NextAuth (Twitch OAuth con sincronización de seguidos, Modo Invitado y credenciales locales)
- **Base de Datos & ORM:** Prisma con PostgreSQL (Neon)
- **Tiempo Real & Presencia:** Heartbeat serverless con poda automática (TTL 6s) y fallback en memoria
- **Señalización & Medios:** WebRTC mesh peer-to-peer (STUN Google) con intercambio de señales serverless
- **Estilos:** Tailwind CSS con diseño Dark Mode premium responsive

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
