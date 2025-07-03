import "src/global.css";

// ----------------------------------------------------------------------
import type { Metadata, Viewport } from "next";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";

import { CONFIG } from "src/global-config";
import { LANGUAGE } from "src/consts/language";
import { TranslationProvider, LocalizationProvider } from "src/locales";

import { ProgressBar } from "src/components/progress-bar";
import { MotionLazy } from "src/components/animate/motion-lazy";
import { SettingsDrawer, defaultSettings } from "src/components/settings";

import SnackbarProvider from "../snackbar-provider";
import { AnalyticsProvider } from "../analytics-provider";
import { CookiesManagerProvider } from "../cookies-manager-provider";

// ----------------------------------------------------------------------

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  icons: [
    {
      rel: "icon",
      url: `${CONFIG.assetsDir}/favicon.ico`,
    },
  ],
};

export async function generateStaticParams() {
  return Object.values(LANGUAGE).map((lng) => ({ locale: lng }));
}

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export default function LocaleLayout({ children, params: { locale } }: Props) {
  return (
    <TranslationProvider locale={locale}>
      <LocalizationProvider>
        <AppRouterCacheProvider options={{ key: "css" }}>
          <SnackbarProvider>
            <CookiesManagerProvider>
              <AnalyticsProvider>
                <MotionLazy>
                  <ProgressBar />
                  <SettingsDrawer defaultSettings={defaultSettings} />
                  {children}
                </MotionLazy>
              </AnalyticsProvider>
            </CookiesManagerProvider>
          </SnackbarProvider>
        </AppRouterCacheProvider>
      </LocalizationProvider>
    </TranslationProvider>
  );
}
