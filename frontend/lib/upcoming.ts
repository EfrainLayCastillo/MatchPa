export interface UpcomingFeature {
  title: string;
  text: string;
  tags?: string[];
}

export const UPCOMING_FEATURES: UpcomingFeature[] = [
  {
    title: "Eventos especiales",
    text: "Los main events de cada sucursal, cada uno con su propio look, con cuadro o tabla de posiciones en vivo.",
    tags: ["Americano", "Mexicano", "Eliminación directa", "Liguilla"],
  },
  {
    title: "Chat del partido",
    text: "Mensajes rápidos para tu partido: \"Voy en camino\", \"Llego 10 min tarde\", \"No puedo ir\".",
  },
  {
    title: "Avisos por WhatsApp",
    text: "Que te llegue el ¡Match! donde ya estás todo el día.",
  },
  {
    title: "Clubs",
    text: "Tu grupo de siempre dentro de MatchPa, para armar partidos entre ustedes.",
  },
];
