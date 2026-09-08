# Guía Oficial de Configuración OAuth y Despliegue en Vercel - StreamSync

Esta guía detalla paso a paso cómo obtener las credenciales oficiales de **Twitch Developer Console** y desplegar la aplicación en **Vercel** con todas sus variables de entorno.

---

## 1. Configuración de Twitch OAuth 2.0

### Paso 1.1: Registrar la aplicación en Twitch
1. Accede a la consola de desarrolladores de Twitch: [https://dev.twitch.tv/console/apps](https://dev.twitch.tv/console/apps).
2. Inicia sesión con tu cuenta de Twitch.
3. Haz clic en el botón **"Register Your Application"** (Registrar tu aplicación).
4. Rellena los siguientes campos:
   - **Name**: `StreamSync` (o el nombre de tu preferencia).
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
- `user:read:follows`: Lectura de los streamers que el usuario sigue en Twitch para sincronización opcional en el perfil.

---

## 2. Generar la clave secreta de NextAuth

En tu terminal local o consola PowerShell, genera una cadena segura ejecutando:

```bash
# En PowerShell:
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# O en Bash / OpenSSL:
openssl rand -base64 32
```

---

## 3. Variables de Entorno para Vercel y `.env`

Crea o actualiza las siguientes variables en el panel de **Vercel** (`Settings` > `Environment Variables`) y en tu archivo `.env.local`:

```env
# Base de datos PostgreSQL (Neon)
DATABASE_URL="postgresql://usuario:password@host/streamsync?sslmode=require"

# NextAuth URL y Secret
NEXTAUTH_URL="https://streamsync-livid.vercel.app"
AUTH_SECRET="tu_nextauth_secret_generado"

# Twitch OAuth
TWITCH_CLIENT_ID="tu_twitch_client_id"
TWITCH_CLIENT_SECRET="tu_twitch_client_secret"
```

---

## 4. Modo Invitado (Respaldo sin configuración previa)

StreamSync incluye un **modo invitado de alta fidelidad** (`Continuar como Invitado` en `/auth`), lo que permite que cualquier usuario use las salas compartidas, chat en tiempo real y opciones voluntarias de voz WebRTC sin necesidad de configurar Twitch.

---

## 5. Despliegue en Producción (Vercel)

1. Sube los cambios al repositorio de GitHub:
   ```bash
   git add .
   git commit -m "chore: specialize streamsync exclusively for twitch watch parties"
   git push origin main
   ```
2. Ejecuta la sincronización de esquema de base de datos con Prisma (si hay cambios de esquema):
   ```bash
   npx prisma db push
   ```
3. Comprueba en `https://streamsync-livid.vercel.app/` que todas las rutas respondan correctamente:
   - `/` (Página principal con branding de Watch Parties de Twitch)
   - `/dashboard` (Directorio de watch parties activas)
   - `/explore` (Explorador de canales y directos de Twitch)
   - `/room/:code` (Watch party compartida con chat en vivo y presencia multiusuario)
   - `/profile` (Ajustes de perfil y sincronización con Twitch)
   - `/auth` (Acceso con Twitch, Invitado y credenciales)
   - `/terms` y `/privacy` (Páginas legales actualizadas)
