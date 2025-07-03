import i18n from "i18next";
import HttpApi from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

import { CONFIG } from "src/global-config";
import { LANGUAGE } from "src/consts/language";

const namespaces = [
  "404",
  "500",
  "about",
  "account",
  "activate",
  "advertisement",
  "app-store",
  "blog",
  "certificate",
  "contact",
  "cookies",
  "course",
  "dashboard",
  "faq",
  "home",
  "learn",
  "locale",
  "navigation",
  "newsletter",
  "payment",
  "pricing",
  "privacy-policy",
  "reset-password",
  "review",
  "sign-in",
  "sign-up",
  "terms-of-service",
  "testimonial",
  "update-password",
];

i18n
  .use(HttpApi)
  .use(initReactI18next)
  .init({
    fallbackLng: LANGUAGE.PL,
    supportedLngs: Object.values(LANGUAGE),
    lng: LANGUAGE.PL,
    defaultNS: "navigation",
    ns: namespaces,
    debug: CONFIG.isLocal,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    detection: {
      order: ["path", "cookie", "navigator"],
      lookupFromPathIndex: 0,
    },
  });

export default i18n;
