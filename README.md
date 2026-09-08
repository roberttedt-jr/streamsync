# 🎮 StreamSync 2026 - Watch Parties en Tiempo Real

StreamSync es una plataforma web moderna para disfrutar de directos y vídeos de Twitch y YouTube sincronizados al milisegundo entre amigos, con chat de voz WebRTC, sistema de cola de turnos de palabra ("Levantar la mano"), HUD flotante de estadísticas de videojuegos y autenticación social OAuth.

Desarrollado por **Roberto Tedt (roberttedt-jr)**.

---

## 🛠️ Tecnologías

- **Framework:** Next.js 14 (App Router)
- **Autenticación:** Auth.js / NextAuth (Twitch OAuth, Google OAuth con permisos mínimos de sesión, Modo Invitado y credenciales locales)
- **Base de Datos & ORM:** Prisma con PostgreSQL
- **Estilos:** Tailwind CSS con temas Claro y Oscuro, fuentes *Plus Jakarta Sans*, *Inter* y *JetBrains Mono*
- **Sincronización:** WebRTC Voice HUD con visualizador de ondas y cola de turnos

---

## ⚙️ Configuración de Variables en Vercel

Tu proyecto de StreamSync ya está conectado a Vercel. Sigue estos pasos para introducir tus credenciales desde el panel de Vercel sin exponer ningún secreto en el repositorio de código:

### 1. Entrar en la configuración de Vercel
1. Inicia sesión en [Vercel](https://vercel.com/) y abre tu proyecto **StreamSync**.
2. Ve a la pestaña **Settings** (Configuración) en la barra superior.
3. En el menú lateral izquierdo, haz clic en **Environment Variables** (Variables de entorno).

### 2. Añadir cada variable por separado
Añade cada una de las siguientes variables utilizando la columna **Name** para la clave y **Value** para tu valor privado:

| Variable (Name) | Descripción |
|---|---|
| `TWITCH_CLIENT_ID` | Client ID obtenido en Twitch Developer Console |
| `TWITCH_CLIENT_SECRET` | Client Secret generado en Twitch Developer Console |
| `GOOGLE_CLIENT_ID` | Client ID de tipo Aplicación Web obtenido en Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Client Secret obtenido en Google Cloud Console |
| `AUTH_SECRET` | Clave secreta para firmar sesiones y tokens JWT (e.g. generada con `openssl rand -base64 32`) |

> ⚠️ **Importante:** Nunca utilices el prefijo `NEXT_PUBLIC_` para ningún secreto ni ID de OAuth confidencial. Todas estas variables son leídas exclusivamente desde el servidor y las rutas de Auth.js.

### 3. Seleccionar los entornos adecuados
Al añadir cada variable, marca las casillas **Production**, **Preview** y **Development** para que estén disponibles tanto en tu despliegue principal como en las pruebas.

### 4. Hacer Redeploy tras guardar las variables
Una vez guardadas las 5 variables:
1. Ve a la pestaña **Deployments** en Vercel.
2. Localiza el último despliegue, pulsa en el botón de los tres puntos (`...`) y selecciona **Redeploy**.
3. Vercel reconstruirá la aplicación inyectando las nuevas variables de entorno de forma segura.

### 5. Probar el proyecto localmente (`.env.local`)
Para probar el inicio de sesión con Twitch y Google en tu ordenador local:
1. Crea un archivo llamado `.env.local` en la raíz del proyecto (este archivo está protegido en `.gitignore` y **nunca** se subirá a GitHub).
2. Añade las mismas variables con sus respectivos valores:
   ```env
   TWITCH_CLIENT_ID=tu_valor_aqui
   TWITCH_CLIENT_SECRET=tu_valor_aqui
   GOOGLE_CLIENT_ID=tu_valor_aqui
   GOOGLE_CLIENT_SECRET=tu_valor_aqui
   AUTH_SECRET=tu_clave_secreta_aqui
   ```
3. Inicia el servidor de desarrollo con `npm run dev`.

### 6. Comprobar las Redirect URI de Twitch y Google
Asegúrate de que las URLs de redirección registradas en las consolas de desarrolladores coinciden exactamente con los endpoints utilizados por Auth.js:

#### En Twitch Developer Console:
- **Producción:** `https://streamsync-livid.vercel.app/api/auth/callback/twitch`
- **Desarrollo local:** `http://localhost:3000/api/auth/callback/twitch`

#### En Google Cloud Console:
- **Producción:** `https://streamsync-livid.vercel.app/api/auth/callback/google`
- **Desarrollo local:** `http://localhost:3000/api/auth/callback/google`

---

## 💡 Cómo desactivar temporalmente un Provider

El sistema está programado para ser **tolerante a fallos**:
- Si no configuras `TWITCH_CLIENT_ID` o `TWITCH_CLIENT_SECRET`, el provider de Twitch se desactiva dinámicamente sin romper la aplicación. El botón en `/auth` mostrará una etiqueta indicando que la configuración está pendiente y un mensaje informativo.
- Si no configuras `GOOGLE_CLIENT_ID` o `GOOGLE_CLIENT_SECRET`, ocurrirá lo mismo con Google / YouTube.
- Los usuarios siempre podrán acceder con **1 solo clic mediante el modo "Continuar como Invitado"** o mediante el formulario de registro local con foto de perfil.

---

## ❓ ¿Qué hacer si en Google Cloud Console no te sale "Select a Project"?

Si al entrar en [Google Cloud Console](https://console.cloud.google.com/) no ves el botón o selector de proyectos:
1. Dirígete a la parte superior izquierda de la pantalla, justo a la derecha del logotipo azul de **Google Cloud**.
2. Verás un menú desplegable (que suele mostrar "Seleccionar un proyecto" o el nombre de una organización predeterminada).
3. Haz clic sobre él. Se abrirá una ventana emergente.
4. En la esquina superior derecha de esa ventana emergente, haz clic en el botón **"Nuevo proyecto"** (New Project).
5. Asigna el nombre `StreamSync` y pulsa **Crear**.
6. En unos segundos aparecerá una notificación de que el proyecto ha sido creado. Haz clic en "Seleccionar proyecto" en esa notificación para comenzar a configurar las credenciales OAuth y habilitar la **YouTube Data API v3**.

---

## 📜 Licencia y Derechos

© 2026 StreamSync. Desarrollado por **Roberto**. Todos los derechos reservados.
Las marcas comerciales, nombres y logotipos de Twitch, YouTube, Discord y los videojuegos pertenecen a sus respectivos propietarios.
