import type { MetadataRoute } from "next";

import { CONFIG } from "src/global-config";

export default function manifest(): MetadataRoute.Manifest {
  const { env: ENV } = CONFIG;
  const envModified = ENV === "LOCAL" ? "DEV" : ENV;
  const env = envModified === "PROD" ? "" : `-${envModified.toLocaleLowerCase()}`;
  return {
    name: `loop${env}`,
    short_name: `loop${env}`,
    start_url: "/",
    display: "standalone",
    description:
      "Ucz się programowania szybciej z AI, interaktywnymi Zamiast teorii – praktyczne projekty, które trafiają do Twojego portfolio. Nauka programowania z loop to kod, GitHub, własne decyzje i realne umiejętności.",
    lang: "pl-PL",
    dir: "auto",
    theme_color: "#000000",
    background_color: "#1D1D1D",
    orientation: "any",
    icons: [
      {
        purpose: "maskable",
        sizes: "512x512",
        src: `assets/logo/pwa/${envModified.toLocaleLowerCase()}/maskable.png`,
        type: "image/png",
      },
      {
        purpose: "any",
        sizes: "512x512",
        src: `assets/logo/pwa/${envModified.toLocaleLowerCase()}/rounded.png`,
        type: "image/png",
      },
    ],
    screenshots: [],
    related_applications: [],
    prefer_related_applications: false,
    shortcuts: [],
    display_override: [],
    protocol_handlers: [],
  };
}
