# Guía Oficial de Configuración OAuth y Despliegue en Vercel - StreamSync 2026

Esta guía detalla paso a paso cómo obtener las credenciales oficiales de **Twitch Developer Console** y **Google Cloud Console (YouTube API)**, configurar los alcances (scopes), y desplegar la aplicación en **Vercel** con todas sus variables de entorno.

---

## 1. Configuración de Twitch OAuth 2.0

### Paso 1.1: Registrar la aplicación en Twitch
1. Accede a la consola de desarrolladores de Twitch: [https://dev.twitch.tv/console/apps](https://dev.twitch.tv/console/apps).
2. Inicia sesión con tu cuenta de Twitch.
3. Haz clic en el botón **"Register Your Application"** (Registrar tu aplicación).
4. Rellena los siguientes campos:
   - **Name**: `StreamSync 2026` (o el nombre de tu preferencia).
   - **OAuth Redirect URLs**:
     - Producción: `https://streamsync-livid.vercel.app/api/auth/callback/twitch`
     - Desarrollo local: `http://localhost:3000/api/auth/callback/twitch`
   - **Category**: `Website Integration` o `Application Integration`.
   - **Client Type**: `Confidential`.
5. Haz clic en **Create** (Crear).

### Paso 1.2: Obtener Client ID y Client Secret
1. En la lista de aplicaciones, haz clic en **Manage** junto a tu aplicación recién creada.
2. Copia el valor de **Client ID**.
3. Haz clic en **New Secret** para generar tu **Client Secret**. Cópialo inmediatamente (solo se muestra una vez).

### Scopes requeridos configurados en el código:
- `openid`: Identificación del usuario mediante OpenID Connect.
- `user:read:email`: Correo verificado del usuario.
- `chat:read`: Permiso para leer mensajes de chat de Twitch en las salas.
- `chat:edit`: Permiso para enviar mensajes de chat sincronizados.

---

## 2. Configuración de Google Cloud Console (YouTube Data API v3)

### Paso 2.1: Crear el proyecto en Google Cloud
1. Entra a [https://console.cloud.google.com/](https://console.cloud.google.com/).
2. Haz clic en el selector de proyectos superior y selecciona **"New Project"** (Nuevo proyecto).
3. Nombra el proyecto como `StreamSync-WatchParties` y pulsa **Create**.

### Paso 2.2: Habilitar YouTube Data API v3
1. En el menú lateral, ve a **APIs & Services** > **Library**.
2. Busca `YouTube Data API v3`.
3. Haz clic sobre ella y pulsa **Enable** (Habilitar).

### Paso 2.3: Pantalla de consentimiento OAuth (OAuth Consent Screen)
1. Ve a **APIs & Services** > **OAuth consent screen**.
2. Selecciona **External** (Externo) y pulsa **Create**.
3. Rellena:
   - **App name**: `StreamSync`
   - **User support email**: tu email.
   - **Developer contact information**: tu email.
4. En la sección **Scopes** (Permisos), añade:
   - `openid`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/youtube.readonly`
5. Guarda y continúa. En el modo de prueba (Testing), añade tu cuenta de Google como **Test User** para poder probarla inmediatamente.

### Paso 2.4: Crear Credenciales OAuth 2.0
1. Ve a **APIs & Services** > **Credentials**.
2. Haz clic en **Create Credentials** > **OAuth client ID**.
3. **Application type**: `Web application`.
4. **Name**: `StreamSync Web Client`.
5. **Authorized JavaScript origins**:
   - `https://streamsync-livid.vercel.app`
   - `http://localhost:3000`
6. **Authorized redirect URIs**:
   - `https://streamsync-livid.vercel.app/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google`
7. Haz clic en **Create** y copia tu **Client ID** y **Client Secret**.

---

## 3. Generar la clave secreta de NextAuth

En tu terminal local o consola PowerShell, genera una cadena segura ejecutando:

```bash
# En PowerShell:
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# O en Bash / OpenSSL:
openssl rand -base64 32
```

---

## 4. Variables de Entorno para Vercel y `.env`

Crea o actualiza las siguientes variables en el panel de **Vercel** (`Settings` > `Environment Variables`) y en tu archivo `.env.local`:

```env
# Base de datos PostgreSQL (Neon, Supabase o Railway)
DATABASE_URL="postgresql://usuario:password@host:5432/streamsync?sslmode=require"

# NextAuth URL y Secret
NEXTAUTH_URL="https://streamsync-livid.vercel.app"
NEXTAUTH_SECRET="tu_nextauth_secret_generado"

# Twitch OAuth
TWITCH_CLIENT_ID="tu_twitch_client_id"
TWITCH_CLIENT_SECRET="tu_twitch_client_secret"

# Google / YouTube OAuth
GOOGLE_CLIENT_ID="tu_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="tu_google_client_secret"

# Discord OAuth (Opcional)
DISCORD_CLIENT_ID="tu_discord_client_id"
DISCORD_CLIENT_SECRET="tu_discord_client_secret"
```

---

## 5. Modo Invitado (Respaldo sin configuración previa)

StreamSync incluye un **modo invitado de alta fidelidad** (`Continuar como Invitado` en `/auth`), lo que permite que cualquier usuario o evaluador use el 100% de las funciones (reproductor sincronizado, voz WebRTC, chat y HUD de estadísticas) incluso antes de configurar las APIs de Twitch o Google.

---

## 6. Despliegue en Producción (Vercel)

1. Sube los cambios al repositorio de GitHub:
   ```bash
   git add .
   git commit -m "feat: complete 2026 redesign with twitch/youtube oauth"
   git push origin main
   ```
2. Ejecuta la sincronización de esquema de base de datos con Prisma:
   ```bash
   npx prisma db push
   ```
3. Despliega en Vercel:
   ```bash
   npx vercel --prod --yes
   ```
4. Comprueba en `https://streamsync-livid.vercel.app/` que todas las rutas respondan correctamente con código 200:
   - `/` (Página principal con Navbar 2026 y Footer de Roberto Tedt)
   - `/dashboard` (Directorio de watch parties y selector de directos)
   - `/explore` (Explorador temático de streams)
   - `/room/vct-finals` (Watch party sincronizada con reproductor y voz WebRTC)
   - `/profile` (Ajustes, canales seguidos y subida de foto local)
   - `/auth` (Acceso unificado con Twitch, YouTube e Invitado)
   - `/terms` y `/privacy` (Páginas legales oficiales)
