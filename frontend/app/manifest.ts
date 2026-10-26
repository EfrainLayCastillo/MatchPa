import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MatchPa",
    short_name: "MatchPa",
    description: "Encuentra jugadores y completa tu partido de pádel.",
    start_url: "/lobby",
    display: "standalone",
    background_color: "#f7f6f0",
    theme_color: "#0b4a55",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
