import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Spotify clone",
    short_name: "Spotify clone",
    description: "Listen to music!",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      {
        src: "/icon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  }
}
