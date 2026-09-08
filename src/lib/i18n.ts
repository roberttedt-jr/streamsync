export type Language = "es" | "en";

export const translations = {
  es: {
    header: {
      howItWorks: "Cómo funciona",
      features: "Características",
      community: "Comunidad",
      contact: "Contacto",
      createRoom: "Crear sala",
      createRoomFree: "Crear sala gratis",
      tagline: "Gaming Watch Parties",
    },
    hero: {
      badgeTag: "Voz en directo + Overlay",
      badgeText: "Watch Parties Gaming en Tiempo Real",
      titleStart: "Mira Twitch y YouTube",
      titleGradient: "sincronizado con amigos",
      subtitle:
        "Disfruta de directos y torneos al mismo milisegundo. Habla por voz en ultra baja latencia y consulta estadísticas en vivo sin spoilers ni desajustes.",
      ctaPrimary: "Crear sala gratis",
      ctaSecondary: "Cómo funciona",
      trustNoRegister: "Sin registro obligatorio",
      trustNoLag: "Cero lag entre pantallas",
      trustVoice: "Voz WebRTC integrada",
      mockupSynced: "Sincronizado • 4ms",
      mockupGamers: "4 gamers",
      mockupTourney: "Gaming Watch Party en Directo",
      mockupTeams: "Directo sincronizado con tu squad",
      mockupOverlayTitle: "Overlay de Partida en Vivo",
      mockupRounds: "Rondas",
      mockupTopFragger: "Top Fragger",
      mockupEconomy: "Economía",
      mockupVoiceActive: "Alex está hablando...",
      mockupVoiceRoom: "Sala de voz: Squad Alpha",
    },
    howItWorks: {
      badge: "3 pasos sencillos",
      titleStart: "Empieza tu watch party en",
      titleHighlight: "30 segundos",
      subtitle:
        "Olvídate de cuentas atrás manuales o streams desfasados. StreamSync coordina todo automáticamente en la nube.",
      ctaButton: "Crear tu sala ahora",
      step1: {
        number: "01",
        title: "Crea tu sala",
        description:
          "Elige si quieres ver un canal de Twitch o un vídeo de YouTube. Dale un nombre a tu sala y busca el stream con un solo clic.",
        details: ["Soporte nativo Twitch & YouTube", "Salas públicas o con clave", "Sin esperas ni registros"],
      },
      step2: {
        number: "02",
        title: "Invita a tus amigos",
        description:
          "Copia el enlace generado de tu sala y compártelo en tu servidor de Discord, WhatsApp o grupo de Telegram al instante.",
        details: ["Enlace directo de un solo clic", "Acceso instantáneo desde navegador", "Sin apps obligatorias"],
      },
      step3: {
        number: "03",
        title: "Ver y hablar en tiempo real",
        description:
          "Vídeo sincronizado al milisegundo para todos. Activa el chat de voz integrado y sigue las estadísticas competitivas de la partida.",
        details: ["Sincronización milimétrica", "Chat de voz WebRTC ultra ligero", "Overlay con stats del juego"],
      },
    },
    features: {
      badge: "Potencia Gaming",
      titleStart: "Tecnología pensada para",
      titleHighlight: "gamers exigentes",
      subtitle:
        "Cada detalle de StreamSync está optimizado para que la experiencia compartida sea tan fluida como estar sentados en el mismo sofá.",
      practiceLabel: "En la práctica:",
      feat1: {
        title: "Sincronización Total",
        subtitle: "WebSockets bidireccionales",
        description: "Play, pausa y saltos temporales sincronizados al milisegundo en todos los dispositivos de la sala.",
        example: "Si tu amigo pausa para ir por agua o retrocede una repetición épica, todos quedan sincronizados sin spoilers ni desajustes.",
      },
      feat2: {
        title: "Voz en Directo",
        subtitle: "Audio WebRTC ultra rápido",
        description: "Salas de voz integradas con calidad cristalina y latencia casi nula, sin saturar tu ancho de banda.",
        example: "Grita y celebra cada clutch o remontada en directo con tus amigos exactamente al segundo en que sucede en el stream.",
      },
      feat3: {
        title: "Overlay de Estadísticas",
        subtitle: "Datos competitivos en pantalla",
        description: "Información del juego, categoría, estado del directo y métricas de partidas directamente sobre la interfaz.",
        example: "Conoce el mapa, ronda, puntuación y detalles de torneos sin tener que abrir pestañas secundarias en tu navegador.",
      },
      feat4: {
        title: "Privacidad y Control",
        subtitle: "Sin almacenamiento de streams",
        description: "No almacenamos ni retransmitimos vídeo; solo sincronizamos los eventos de reproducción de forma segura y privada.",
        example: "Salas con enlaces privados para ti y tus amigos, o abiertas para congregar a toda tu comunidad de Discord.",
      },
    },
    testimonials: {
      badge: "Comunidad Gaming",
      titleStart: "Aprobado por",
      titleHighlight: "squads y streamers",
      subtitle: "Usado por comunidades de gaming, creadores de contenido y grupos de amigos que no toleran los spoilers.",
      partnerTitle: "Compatible y diseñado para tus plataformas habituales",
      items: [
        {
          name: "Alex",
          nick: "@Kovacs_FPS",
          age: "19 años",
          role: "Capitán equipo amateur",
          content:
            "Lo usamos para ver streams y torneos en directo con amigos y va perfecto, cero lag entre pantallas. Ya no nos comemos los spoilers que nos pasaban siempre en Discord.",
          tag: "Gaming Squad",
        },
        {
          name: "Sara",
          nick: "@ValkyMod",
          age: "23 años",
          role: "Mod de Servidor Gaming (4.2k miembros)",
          content:
            "Ideal para ver directos con la comunidad del servidor. La sala de voz integrada y alternar entre Twitch y YouTube en un segundo nos salvó las veladas nocturnas.",
          tag: "Comunidad Discord",
        },
        {
          name: "Dani",
          nick: "@PixelRush_TV",
          age: "26 años",
          role: "Creador & Streamer de Variedad",
          content:
            "Organizar watch parties con mis suscriptores solía ser un caos con desfases de 15 segundos. StreamSync lo solucionó con un simple enlace sin instalar nada.",
          tag: "Creador de Contenido",
        },
      ],
    },
    cta: {
      badge: "Listo en menos de 10 segundos",
      titleStart: "Crea tu primera",
      titleHighlight: "watch party hoy",
      subtitle: "Reúne a tu squad, comparte el enlace y vive cada partida o torneo en directo sin desajustes.",
      button: "Crear sala gratis",
      trustFree: "100% Gratis",
      trustNoInstall: "Sin instalaciones",
      trustUnlimited: "Ilimitado para tu grupo",
    },
    footer: {
      description:
        "La plataforma definitiva para disfrutar de directos de Twitch y vídeos de YouTube sincronizados con amigos, chat de voz ultrarrápido y overlay de estadísticas.",
      navTitle: "Navegación",
      legalTitle: "Legal y Proyecto",
      terms: "Términos del Servicio",
      privacy: "Política de Privacidad",
      cookies: "Cookies y Datos",
      openSource: "Código Abierto en GitHub",
      rights: "© 2026 StreamSync. Desarrollado por Roberto. Todos los derechos reservados.",
      madeWith: "Hecho con",
      forGamers: "para gamers y comunidades.",
    },
  },
  en: {
    header: {
      howItWorks: "How it works",
      features: "Features",
      community: "Community",
      contact: "Contact",
      createRoom: "Create room",
      createRoomFree: "Create free room",
      tagline: "Gaming Watch Parties",
    },
    hero: {
      badgeTag: "Live Voice + Overlay",
      badgeText: "Real-Time Gaming Watch Parties",
      titleStart: "Watch Twitch & YouTube",
      titleGradient: "synchronized with friends",
      subtitle:
        "Enjoy live streams and tournaments down to the exact millisecond. Voice chat with ultra-low latency and check live match stats without spoilers or sync drift.",
      ctaPrimary: "Create free room",
      ctaSecondary: "How it works",
      trustNoRegister: "No registration required",
      trustNoLag: "Zero screen-to-screen lag",
      trustVoice: "Integrated WebRTC voice",
      mockupSynced: "Synchronized • 4ms",
      mockupGamers: "4 gamers",
      mockupTourney: "Live Gaming Watch Party",
      mockupTeams: "Synchronized live squad session",
      mockupOverlayTitle: "Live Match Overlay",
      mockupRounds: "Rounds",
      mockupTopFragger: "Top Fragger",
      mockupEconomy: "Economy",
      mockupVoiceActive: "Alex is speaking...",
      mockupVoiceRoom: "Voice Channel: Squad Alpha",
    },
    howItWorks: {
      badge: "3 simple steps",
      titleStart: "Start your watch party in",
      titleHighlight: "30 seconds",
      subtitle:
        "Forget manual countdowns or lagging streams. StreamSync coordinates everything automatically in the cloud.",
      ctaButton: "Create your room now",
      step1: {
        number: "01",
        title: "Create your room",
        description:
          "Choose whether you want to watch a Twitch channel or a YouTube video. Name your room and pick the stream in one click.",
        details: ["Native Twitch & YouTube support", "Public or password rooms", "Instant setup, zero waiting"],
      },
      step2: {
        number: "02",
        title: "Invite your friends",
        description:
          "Copy your generated room link and share it directly on Discord, WhatsApp, or Telegram instantly.",
        details: ["One-click direct link", "Instant browser access", "No apps required"],
      },
      step3: {
        number: "03",
        title: "Watch and talk in real time",
        description:
          "Millisecond-synced video for everyone. Turn on built-in voice chat and follow competitive match statistics live.",
        details: ["Pinpoint sync accuracy", "Ultra-lightweight WebRTC voice", "In-game match stats overlay"],
      },
    },
    features: {
      badge: "Gaming Power",
      titleStart: "Engineered for",
      titleHighlight: "demanding gamers",
      subtitle:
        "Every aspect of StreamSync is tuned so sharing streams feels as seamless as sitting together on the couch.",
      practiceLabel: "In practice:",
      feat1: {
        title: "Total Synchronization",
        subtitle: "Bidirectional WebSockets",
        description: "Play, pause, and time seeking synced to the millisecond across every screen in the room.",
        example: "If a buddy pauses for water or rewinds an epic play, everyone stays in sync with zero spoilers.",
      },
      feat2: {
        title: "Live Voice Chat",
        subtitle: "Ultra-fast WebRTC audio",
        description: "Built-in voice channels with crystal-clear audio and zero perceptible lag, without choking bandwidth.",
        example: "Celebrate clutches and comebacks live with your friends the exact second they happen on screen.",
      },
      feat3: {
        title: "Match Stats Overlay",
        subtitle: "Competitive live HUD",
        description: "Live game data, category, stream status, and match statistics right on the screen.",
        example: "Check the map, round count, and tournament scores without juggling second browser tabs.",
      },
      feat4: {
        title: "Privacy & Control",
        subtitle: "Zero stream storage",
        description: "We don't store or restream video; we only coordinate playback events privately and securely.",
        example: "Private invite-only rooms for close friends, or open parties for your entire Discord server.",
      },
    },
    testimonials: {
      badge: "Gaming Community",
      titleStart: "Approved by",
      titleHighlight: "squads and streamers",
      subtitle: "Used by gaming communities, college teams, and content creators who won't settle for spoilers.",
      partnerTitle: "Compatible and tailored for your everyday platforms",
      items: [
        {
          name: "Alex",
          nick: "@Kovacs_FPS",
          age: "19 y/o",
          role: "Amateur Team Captain",
          content:
            "We use it to watch live streams and esports tournaments with friends and it's flawless, zero screen lag. No more getting spoiled by Discord voice calls.",
          tag: "Gaming Squad",
        },
        {
          name: "Sara",
          nick: "@ValkyMod",
          age: "23 y/o",
          role: "Gaming Discord Mod (4.2k members)",
          content:
            "Perfect for watching streams with our server community. The built-in voice and instant Twitch/YouTube toggle saved our game nights.",
          tag: "Discord Community",
        },
        {
          name: "Dani",
          nick: "@PixelRush_TV",
          age: "26 y/o",
          role: "Variety Creator & Streamer",
          content:
            "Hosting watch parties with my subscribers used to be a 15-second lag nightmare. StreamSync solved it with a single link, zero installs.",
          tag: "Content Creator",
        },
      ],
    },
    cta: {
      badge: "Ready in under 10 seconds",
      titleStart: "Create your first",
      titleHighlight: "watch party today",
      subtitle: "Gather your squad, share the link, and enjoy live matches together with zero sync delay.",
      button: "Create free room",
      trustFree: "100% Free",
      trustNoInstall: "No downloads required",
      trustUnlimited: "Unlimited squad size",
    },
    footer: {
      description:
        "The ultimate platform to enjoy synchronized Twitch & YouTube streams with friends, ultra-fast voice chat, and live game stats.",
      navTitle: "Navigation",
      legalTitle: "Legal & Project",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      cookies: "Cookies & Data",
      openSource: "Open Source on GitHub",
      rights: "© 2026 StreamSync. Desarrollado por Roberto. Todos los derechos reservados.",
      madeWith: "Crafted with",
      forGamers: "for gamers and communities.",
    },
  },
};
