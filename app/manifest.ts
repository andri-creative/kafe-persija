import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Persija Cafe POS",
    short_name: "Cafe POS",
    display: "standalone",
    orientation: "landscape",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    start_url: "/admin",
  };
}
