import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MatchPa",
    short_name: "MatchPa",
    description: "Encuentra jugadores y completa tu partido de pádel.",
    start_url: "/lobby",
    display: "standalone",
    background_color: "#f5f0f0",
    theme_color: "#003c3c",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
