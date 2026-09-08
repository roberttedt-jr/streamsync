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

## 📱 Experiencia Móvil & Instalación PWA

StreamSync está optimizado como una Progressive Web App (PWA) de alto rendimiento, diseñada para sentirse como una aplicación nativa en iOS (Safari) y Android (Chrome).

### Cómo instalar StreamSync:
- **iPhone / iPad (Safari):**
  1. Abre `https://streamsync-livid.vercel.app` en Safari.
  2. Toca el botón **Compartir** (icono de flecha hacia arriba).
  3. Selecciona **Añadir a pantalla de inicio**.
  4. Verifica el nombre exacto `StreamSync` y confirma pulsando **Añadir**.
  5. La app se ejecutará en modo **standalone**, aprovechando la pantalla completa, con integración de barra de estado oscura y respeto estricto por la Dynamic Island, notch y safe areas.

- **Android (Chrome):**
  1. Abre `https://streamsync-livid.vercel.app` en Chrome.
  2. Pulsa en el menú de opciones (⋮) o en el banner inferior **Instalar aplicación**.
  3. Confirma para añadir el acceso directo con icono maskable adaptativo en tu cajón de aplicaciones.

### Especificaciones Técnicas de la PWA:
- **Nombre de la App:** `StreamSync`
- **Nombre Corto:** `StreamSync`
- **Modo de Visualización:** `standalone` (con fallback `display_override: ["window-controls-overlay", "standalone"]`)
- **Iconos Oficiales:**
  - `192x192 PNG` (`/streamsync-logo-192.png`)
  - `512x512 PNG` (`/streamsync-logo-512.png`)
  - `180x180 Apple Touch Icon` (`/apple-touch-icon.png`)
  - `192x192 Maskable` (`/streamsync-maskable-192.png`)
  - `512x512 Maskable` (`/streamsync-maskable-512.png`)
- **Estrategia de Service Worker:**
  - Caché de shell estático y activos visuales (iconos, manifest, fuentes).
  - *Network-First* para carga de páginas HTML.
  - *Network-Only* estricto para `/api/*`, sesiones de Auth.js, WebSockets y señalización WebRTC.
  - Detección reactiva de desconexión: aviso flotante *"Sin conexión. Reconectando..."*.
- **Zoom y Accesibilidad (WCAG 2.1):**
  - Se mantiene la posibilidad de zoom del sistema por motivos de accesibilidad (`userScalable: true`), resolviendo el zoom involuntario de iOS Safari estableciendo un tamaño mínimo de fuente de 16px (`font-size: 16px`) en todos los inputs, textareas y selectores móviles.
- **Limitaciones Conocidas y Transparencia:**
  - StreamSync es una PWA instalable desde la web, no una app nativa binaria distribuida en Apple App Store o Google Play Store.
  - Los permisos de cámara y micrófono dependen de la autorización explícita del usuario y de las capacidades WebRTC del navegador móvil.
  - Las funciones en tiempo real (reproductor de Twitch, presencia, chat y llamadas) requieren conexión activa a internet.


---

## 📜 Licencia y Avisos Legales

© 2026 StreamSync. Desarrollado por **Roberto**. Todos los derechos reservados.
StreamSync no está afiliado, patrocinado ni respaldado por Twitch Interactive, Inc. Todas las marcas comerciales mostradas pertenecen a sus respectivos propietarios.
