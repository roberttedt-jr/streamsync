import React from "react";
import {
  Gamepad2,
  MessageSquare,
  Music,
  Film,
  Trophy,
  Goal,
  Car,
  CircleDot,
  Sparkles,
  Newspaper,
  Cpu,
  Code,
  GraduationCap,
  Palette,
  Mic,
  Utensils,
  Compass,
  Activity,
  Shirt,
  Radio,
  Users,
  Layers,
  LucideIcon,
} from "lucide-react";

export interface CategoryInfo {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: "gaming",
    name: "Gaming",
    description: "Videojuegos, gameplays y directos de partidas en tiempo real",
    icon: Gamepad2,
  },
  {
    id: "charlando",
    name: "Charlando",
    description: "Charlas espontáneas, debates y conversaciones en directo",
    icon: MessageSquare,
  },
  {
    id: "musica",
    name: "Música y conciertos",
    description: "Sesiones en vivo, festivales, conciertos y sesiones acústicas",
    icon: Music,
  },
  {
    id: "cine-series",
    name: "Cine y series",
    description: "Películas, análisis de series, maratones y estrenos compartidos",
    icon: Film,
  },
  {
    id: "deportes",
    name: "Deportes",
    description: "Competiciones deportivas globales, torneos y retransmisiones",
    icon: Trophy,
  },
  {
    id: "futbol",
    name: "Fútbol",
    description: "Partidos, previas, análisis tácticos y ligas internacionales",
    icon: Goal,
  },
  {
    id: "motor",
    name: "Motor",
    description: "Fórmula 1, MotoGP, rally y competiciones del motor",
    icon: Car,
  },
  {
    id: "baloncesto",
    name: "Baloncesto",
    description: "NBA, Euroliga y directos de basket nacional e internacional",
    icon: CircleDot,
  },
  {
    id: "entretenimiento",
    name: "Entretenimiento",
    description: "Shows de televisión, humor, variedades y cultura pop",
    icon: Sparkles,
  },
  {
    id: "noticias",
    name: "Noticias y actualidad",
    description: "Información de última hora, directos informativos y crónicas",
    icon: Newspaper,
  },
  {
    id: "tecnologia",
    name: "Tecnología",
    description: "Lanzamientos de hardware, gadgets, IA y avances de la industria",
    icon: Cpu,
  },
  {
    id: "programacion",
    name: "Programación",
    description: "Live coding, desarrollo web, software open-source y proyectos tech",
    icon: Code,
  },
  {
    id: "ciencia-educacion",
    name: "Ciencia y educación",
    description: "Divulgación científica, clases magistrales y documentales",
    icon: GraduationCap,
  },
  {
    id: "arte-creatividad",
    name: "Arte y creatividad",
    description: "Ilustración digital, diseño gráfico, modelado 3D y manualidades",
    icon: Palette,
  },
  {
    id: "podcasts",
    name: "Podcasts",
    description: "Entrevistas, tertulias y episodios de podcast retransmitidos en vivo",
    icon: Mic,
  },
  {
    id: "cocina",
    name: "Cocina",
    description: "Recetas paso a paso, catas gastronómicas y directos culinarios",
    icon: Utensils,
  },
  {
    id: "viajes",
    name: "Viajes",
    description: "Exploración urbana, vlogs por el mundo y emisiones IRL",
    icon: Compass,
  },
  {
    id: "fitness-bienestar",
    name: "Fitness y bienestar",
    description: "Entrenamientos guiados, yoga, salud y hábitos de vida activa",
    icon: Activity,
  },
  {
    id: "moda-lifestyle",
    name: "Moda y lifestyle",
    description: "Tendencias, pasarelas de moda, rutinas y estilo de vida",
    icon: Shirt,
  },
  {
    id: "eventos-directo",
    name: "Eventos en directo",
    description: "Conferencias, galas de premios y presentaciones oficiales",
    icon: Radio,
  },
  {
    id: "comunidad",
    name: "Comunidad",
    description: "Sesiones de preguntas, dinámicas y encuentros con seguidores",
    icon: Users,
  },
  {
    id: "otros",
    name: "Otros",
    description: "Cualquier otra temática o contenido en directo",
    icon: Layers,
  },
];

export function getCategoryByName(name: string): CategoryInfo | undefined {
  return CATEGORIES.find(
    (c) => c.name.toLowerCase() === name.toLowerCase() || c.id === name.toLowerCase()
  );
}

export function getCategoryById(id: string): CategoryInfo | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
