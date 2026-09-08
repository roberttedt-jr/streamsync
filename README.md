# 🎮 StreamSync — Watch Parties de Twitch

<div align="center">

![StreamSync Banner](public/streamsync-logo.png)

### **Disfruta directos de Twitch con tu comunidad en tiempo real.**

[![Next.js 14](https://img.shields.io/badge/Next.js-14.1.0-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Twitch API](https://img.shields.io/badge/Twitch-9146FF?style=for-the-badge&logo=twitch&logoColor=white)](https://dev.twitch.tv/)
[![PostgreSQL Neon](https://img.shields.io/badge/Neon_Postgres-00E599?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.10-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PWA Ready](https://img.shields.io/badge/PWA-iOS_%26_Android-blueviolet?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Production-black?style=for-the-badge&logo=vercel&logoColor=white)](https://streamsync-livid.vercel.app)

**Dominio de Producción:** [https://streamsync-livid.vercel.app](https://streamsync-livid.vercel.app)

[Características](#-características-principales) • [Arquitectura](#-arquitectura-y-tiempo-real) • [Stack Tecnológico](#-stack-tecnológico) • [Experiencia Móvil & PWA](#-experiencia-móvil-ios--pwa) • [Instalación Local](#-guía-de-instalación-y-desarrollo) • [Despliegue](#-despliegue-en-producción-vercel)

</div>

---

## 📖 Descripción del Proyecto

**StreamSync** es una plataforma web de alto rendimiento especializada **exclusivamente en Watch Parties de directos de Twitch**. Permite a creadores, comunidades y grupos de amigos reunirse en salas compartidas para disfrutar emisiones en vivo sincronizadas con presencia de participantes en tiempo real, chat bidireccional persistente, controles de anfitrión y llamadas opcionales de voz y vídeo mediante WebRTC.

La aplicación está diseñada bajo una estética oscura moderna (*Glassmorphism*) con soporte completo como **Progressive Web App (PWA)**, ofreciendo una experiencia idéntica a una aplicación nativa en dispositivos móviles (iPhone, iPad y Android).

---

## ✨ Características Principales

### 📺 Reproductor Twitch 16:9 Adaptativo
- Integración oficial con el **Twitch Embedded Player API**.
- Relación de aspecto 16:9 estricta (`aspect-video`), eliminando franjas negras artificiales (*letterboxing*).
- Controles inferiores despejados tanto en navegadores de escritorio como en terminales móviles.
- Detección reactiva de streamers en directo y cambio instantáneo de canal por el anfitrión.

### 👥 Presencia Compartida en Tiempo Real
- Sincronización multiusuario serverless mediante latidos periódicos (*heartbeat* de 2.5s) y poda automática (TTL de 6 segundos en PostgreSQL / Neon).
- Visualización en vivo de participantes conectados, roles (Anfitrión / Miembro) y contador activo.
- Sistema de salas públicas (visibles en el directorio de Explorar) y salas privadas accesibles solo mediante enlace exclusivo.

### 💬 Chat en Directo Persistente
- Mensajería instantánea dentro de la sala sin recargas de página ni dependencias de servicios externos pesados.
- Identificación de remitentes con avatar, nombre de usuario y distintivo visual de anfitrión.
- Desplazamiento automático (*auto-scroll*) y adaptabilidad ergonómica para teclados móviles.

### 📞 Voz y Cámara WebRTC (Opcionales y Voluntarias)
- Conexiones de malla directas peer-to-peer (P2P) entre navegadores mediante servidores STUN de baja latencia.
- **Estrictamente opt-in:** no se solicitan permisos ni se transmiten señales de audio/vídeo a menos que el usuario pulse explícitamente en activar micrófono o cámara.
- Indicadores de voz activa y controles rápidos de silenciado individual.

### 🛡️ Control y Gestión Segura para Anfitriones
- El creador de la sala puede actualizar el stream en directo en cualquier momento para toda la audiencia.
- Mecanismo de eliminación segura con confirmación explícita (escribiendo `"ELIMINAR"`), lo que expulsa inmediatamente a los invitados conectados mediante respuesta HTTP 410.

---

## 📱 Experiencia Móvil iOS & PWA

StreamSync ha sido optimizado meticulosamente para sentirse como una **aplicación nativa en iPhone, iPad y Android**:

- **Instalación como App Independiente (`standalone`):** Sin barras de navegación del navegador ni controles de Safari/Chrome.
- **Bloqueo estricto del zoom involuntario:**
  - Viewport configurado con `maximumScale: 1` y `userScalable: false`.
  - Interceptación activa de gestos multitáctiles en iOS (`gesturestart`, `gesturechange`, `gestureend`) y doble toque en pantalla.
  - Tamaño de fuente base de `16px` en campos interactivos para prevenir el auto-zoom nativo de Safari al enfocar inputs.
- **Integración de Safe Areas:** Respeto exhaustivo de la Dynamic Island, notch, barra de estado y gesture bar inferior (`env(safe-area-inset-*)`).
- **Selector de Pestañas Segmentado:** Barra táctil uniforme de 40px de altura (`Chat`, `Stream`, `Personas [N]`, `Llamada`) distribuida en cuadrícula simétrica sin roturas de línea.
- **Iconografía Oficial:** Conjunto completo de iconos de alta resolución (192px, 512px, Maskable y Apple Touch Icon de 180px).

---

## 🏗️ Arquitectura y Tiempo Real

StreamSync emplea una arquitectura de sincronización serverless de alta disponibilidad, eliminando servidores persistentes costosos y aprovechando el Edge de Vercel y Neon PostgreSQL:

```
┌─────────────────────────────────┐                 ┌─────────────────────────────────┐
│       Sesión A (Anfitrión)      │                 │      Sesión B (Participante)    │
│  - WebRTC PeerConnection        │                 │  - WebRTC PeerConnection        │
│  - MediaStream (Cámara/Mic)     │                 │  - MediaStream (Cámara/Mic)     │
│  - Twitch Player (16:9 estricto)│                 │  - Twitch Player (16:9 estricto)│
└────────────────┬────────────────┘                 └────────────────┬────────────────┘
                 │                                                   │
                 │  Heartbeat (2.5s) + Señalización WebRTC           │
                 ▼                                                   ▼
       ┌───────────────────────────────────────────────────────────────────┐
       │   Next.js API Route: /api/rooms/[roomId]/sync (Edge / Node.js)    │
       │                                                                   │
       │  • TTL de presencia (6 seg) y poda automática de desconexiones    │
       │  • Rate limiting de chat integrado por connectionId               │
       │  • Enrutamiento atómico de señales WebRTC (offer / answer / ice)  │
       │  • Ejección inmediata en caso de borrado de sala (HTTP 410)       │
       └─────────────────────────────────┬─────────────────────────────────┘
                                         │
                        ┌────────────────┴────────────────┐
                        ▼                                 ▼
         ┌─────────────────────────────┐   ┌─────────────────────────────┐
         │  Neon PostgreSQL (Serverless)│   │      In-Memory Fallback     │
         │  • RoomParticipant (TTL 6s) │   │  • Map<roomId, Set<Peers>>  │
         │  • RoomMessage (Historial)  │   │  • Signal Buffer (TTL 30s)  │
         │  • RoomSignal (Mesh WebRTC) │   │                             │
         └─────────────────────────────┘   └─────────────────────────────┘
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Descripción |
|---|---|---|
| **Framework** | [Next.js 14 (App Router)](https://nextjs.org/) | Renderizado híbrido SSR/SSG, Route Handlers y Server Components |
| **Lenguaje** | [TypeScript 5.3](https://www.typescriptlang.org/) | Tipado estático estricto en toda la aplicación |
| **Estilos & UI** | [Tailwind CSS 3.4](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/) | Diseño Dark Mode, utilidades de safe area y componentes glassmorphism |
| **Base de Datos** | [PostgreSQL en Neon](https://neon.tech/) | Base de datos serverless con soporte de pooling y conexiones directas |
| **ORM** | [Prisma 5.10](https://www.prisma.io/) | Modelado de datos declarativo, migraciones y tipado de consultas |
| **Autenticación** | [Auth.js / NextAuth 4](https://next-auth.js.org/) | Twitch OAuth, sincronización de canales seguidos y modo Invitado |
| **Vídeo en Vivo** | [Twitch Embedded Player](https://dev.twitch.tv/docs/embed/everything/) | Reproductor embebido oficial optimizado para escritorio y móvil |
| **Comunicaciones** | [WebRTC](https://webrtc.org/) | Audio/Vídeo Mesh Peer-to-Peer con servidores STUN de Google |
| **PWA & Offline** | Service Worker + Web App Manifest | Soporte standalone, caché de shell y detección reactiva de red |

---

## 📁 Estructura del Repositorio

```text
streamsync/
├── prisma/
│   └── schema.prisma                 # Modelos de BD (User, Room, Participant, Message, Signal)
├── public/
│   ├── manifest.webmanifest          # Manifiesto PWA oficial para navegadores modernos
│   ├── sw.js                         # Service Worker seguro (Network-First / Network-Only para APIs)
│   ├── apple-touch-icon.png          # Icono oficial iOS 180x180
│   ├── streamsync-logo-192.png       # Icono PWA estándar 192x192
│   ├── streamsync-logo-512.png       # Icono PWA estándar 512x512
│   ├── streamsync-maskable-192.png   # Icono maskable adaptativo 192x192
│   └── streamsync-maskable-512.png   # Icono maskable adaptativo 512x512
├── src/
│   ├── app/
│   │   ├── api/                      # Route Handlers de API (Next.js)
│   │   │   ├── auth/                 # Rutas de autenticación NextAuth & credenciales
│   │   │   ├── integrations/         # Sincronización de canales seguidos de Twitch
│   │   │   └── rooms/                # Creación, presencia en tiempo real y señalización
│   │   ├── dashboard/                # Panel de usuario con directos en vivo y salas creadas
│   │   ├── explore/                  # Directorio de salas públicas activas en la comunidad
│   │   ├── profile/                  # Perfil de usuario, historial y cuentas vinculadas
│   │   ├── room/[id]/                # Sala de Watch Party interactiva (Reproductor + Chat + Pestañas)
│   │   ├── globals.css               # Estilos globales, safe areas y bloqueo de zoom en iOS
│   │   ├── layout.tsx                # Layout principal, viewport estricto y providers
│   │   └── page.tsx                  # Landing page de presentación con previsualización interactiva
│   ├── components/
│   │   ├── auth/                     # Modales de inicio de sesión, registro y perfil
│   │   ├── common/                   # Navbar, Footer y PWAHandler (gestos y service worker)
│   │   ├── room/                     # Componentes de sala, cuadrícula de vídeo y ajustes
│   │   └── video/                    # Reproductor TwitchPlayer responsivo
│   ├── context/                      # Contextos globales (Auth, Theme, Toast, Language)
│   └── lib/                          # Cliente Prisma, utilidades de auth, i18n y WebRTC
├── package.json                      # Dependencias y scripts del proyecto
├── tailwind.config.ts                # Configuración del sistema de diseño
└── tsconfig.json                     # Configuración estricta de TypeScript
```

---

## 🚀 Guía de Instalación y Desarrollo

### 1. Prerrequisitos
- [Node.js](https://nodejs.org/) v18.17.0 o superior.
- Gestor de paquetes `npm`.
- Una base de datos PostgreSQL (recomendado: [Neon](https://neon.tech/)).
- Una aplicación registrada en la [Twitch Developer Console](https://dev.twitch.tv/console/apps).

### 2. Clonar el Repositorio
```bash
git clone https://github.com/roberttedt-jr/streamsync.git
cd streamsync
```

### 3. Instalar Dependencias
```bash
npm install
```

### 4. Configurar Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto basado en la siguiente plantilla:

```env
# Base de Datos PostgreSQL (Neon)
DATABASE_URL="postgresql://usuario:password@ep-ejemplo.eu-central-1.aws.neon.tech/streamsync?sslmode=require"
DIRECT_URL="postgresql://usuario:password@ep-ejemplo.eu-central-1.aws.neon.tech/streamsync?sslmode=require"

# NextAuth / Auth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera_una_clave_segura_con_openssl_rand_hex_32"
AUTH_SECRET="misma_clave_secreta_jwt"

# Twitch OAuth (Developer Console: https://dev.twitch.tv/console)
TWITCH_CLIENT_ID="tu_twitch_client_id"
TWITCH_CLIENT_SECRET="tu_twitch_client_secret"
```

> **Importante para Twitch OAuth:**  
> En la consola de desarrolladores de Twitch, añade las siguientes **OAuth Redirect URLs**:
> - Desarrollo local: `http://localhost:3000/api/auth/callback/twitch`
> - Producción: `https://tu-dominio.vercel.app/api/auth/callback/twitch`

### 5. Sincronizar Base de Datos con Prisma
```bash
npx prisma generate
npx prisma db push
```

### 6. Ejecutar en Servidor de Desarrollo
```bash
npm run dev
```
Abre en tu navegador [http://localhost:3000](http://localhost:3000) para acceder a la aplicación.

### 7. Comprobación de Tipos y Compilación de Producción
```bash
# Validar tipos de TypeScript
npx tsc --noEmit

# Compilar para producción
npm run build

# Iniciar servidor compilado
npm run start
```

---

## 🌐 Despliegue en Producción (Vercel)

StreamSync está optimizado para desplegarse en [Vercel](https://vercel.com/) con cero configuración adicional:

1. Importa el repositorio desde GitHub en tu panel de Vercel.
2. En la sección **Environment Variables**, añade las variables correspondientes a producción:
   - `DATABASE_URL` y `DIRECT_URL` (conexión Neon).
   - `NEXTAUTH_URL` (URL canónica de tu dominio, ej: `https://streamsync-livid.vercel.app`).
   - `NEXTAUTH_SECRET` y `AUTH_SECRET`.
   - `TWITCH_CLIENT_ID` y `TWITCH_CLIENT_SECRET`.
3. Haz clic en **Deploy**. Vercel compilará automáticamente la aplicación y la desplegará en su red Edge global.

---

## 📲 Cómo Instalar la PWA en tu Dispositivo

### En iPhone o iPad (Safari):
1. Abre `https://streamsync-livid.vercel.app` en Safari.
2. Toca el botón central **Compartir** (icono de cuadrado con flecha hacia arriba).
3. Selecciona **Añadir a pantalla de inicio**.
4. Confirma el nombre `StreamSync` y pulsa **Añadir**.
5. Abre la aplicación desde tu pantalla de inicio para disfrutarla en modo nativo a pantalla completa.

### En Android (Chrome):
1. Abre `https://streamsync-livid.vercel.app` en Google Chrome.
2. Pulsa en los tres puntos del menú superior o en el aviso inferior **Añadir StreamSync a la pantalla de inicio**.
3. Confirma la instalación.

---

## 🧪 Pruebas y Certificación de Calidad

El repositorio cuenta con scripts de verificación automatizada mediante navegadores reales headless con [Puppeteer](https://pptr.dev/):

- **Verificación de Viewport y Zoom:** Certifica que el meta tag contenga `maximum-scale=1` y `user-scalable=no`.
- **Verificación de Safe Areas & Responsive:** Comprobación de que no haya desbordamiento horizontal (`scrollWidth <= 390px`) en viewports de iPhone SE, iPhone 14 y iPad.
- **Verificación de Pestañas Segmentadas:** Asegura una altura uniforme y estrictamente idéntica de `40px` en todas las opciones del control segmentado móvil (`Chat`, `Stream`, `Personas`, `Llamada`).
- **Verificación de PWA:** Certifica que el manifiesto web y todos los iconos devuelvan código de estado `HTTP 200`.

---

## 📜 Licencia y Avisos de Marca

© 2026 **StreamSync**. Creado y mantenido por [Roberto Tedt](https://github.com/roberttedt-jr).

Este proyecto está bajo la licencia [MIT](LICENSE).

*Aviso de marcas: Twitch, el logotipo de Twitch y cualquier activo visual asociado son marcas comerciales registradas de Twitch Interactive, Inc. StreamSync es un proyecto independiente desarrollado por la comunidad y no está respaldado ni afiliado oficialmente con Twitch Interactive.*
