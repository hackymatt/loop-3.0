import "src/global.css";

// ----------------------------------------------------------------------
import type { Metadata, Viewport } from "next";

import { GoogleOAuthProvider } from "@react-oauth/google";

import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";

import { CONFIG } from "src/global-config";
import { LANGUAGE } from "src/consts/language";
import { themeConfig, ThemeProvider } from "src/theme";
import { themeOverrides } from "src/theme/theme-overrides";

import { detectUser } from "src/components/user/server";
import { UserProvider } from "src/components/user/context";
import { defaultUser } from "src/components/user/user-config";
import { defaultSettings, SettingsProvider } from "src/components/settings";

import { ReactQueryProvider } from "./react-query-provider";

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

export default async function RootLayout({ children, params: { locale } }: Props) {
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} suppressHydrationWarning>
      <body>
        <InitColorSchemeScript
          defaultMode={themeConfig.defaultMode}
          modeStorageKey={themeConfig.modeStorageKey}
          attribute={themeConfig.cssVariables.colorSchemeSelector}
        />
        <GoogleOAuthProvider clientId={CONFIG.googleClientId}>
          <ReactQueryProvider>
            <UserProvider defaultUser={defaultUser} cookieUser={await detectUser()}>
              <SettingsProvider defaultSettings={defaultSettings}>
                <ThemeProvider
                  themeOverrides={themeOverrides}
                  defaultMode={themeConfig.defaultMode}
                  modeStorageKey={themeConfig.modeStorageKey}
                >
                  {children}
                </ThemeProvider>
              </SettingsProvider>
            </UserProvider>
          </ReactQueryProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
