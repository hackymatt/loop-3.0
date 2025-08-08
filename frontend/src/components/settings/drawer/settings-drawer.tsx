"use client";

import type { Language } from "src/locales/types";

import { useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { hasKeys, varAlpha } from "minimal-shared/utils";

import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";

import { useRouter, usePathname } from "src/routes/hooks";

import { LANGUAGE } from "src/consts/language";
import { CURRENCY } from "src/consts/currency";
import { langs } from "src/layouts/langs-config";
import { currencies } from "src/layouts/currency-config";

import { LargeBlock } from "./styles";
import { Iconify } from "../../iconify";
import { BaseOption } from "./base-option";
import { Scrollbar } from "../../scrollbar";
import { LanguageOptions } from "./language-options";
import { CurrencyOptions } from "./currency-options";
import { useSettingsContext } from "../context/use-settings-context";

import type { SettingsDrawerProps } from "../types";

// ----------------------------------------------------------------------

export function SettingsDrawer({ sx, defaultSettings }: SettingsDrawerProps) {
  const { t } = useTranslation("settings");

  const settings = useSettingsContext();
  const pathname = usePathname();
  const router = useRouter();
  const locales = Object.values(LANGUAGE);
  const defaultLocale = LANGUAGE.PL;

  const { mode, setMode, systemMode } = useColorScheme();

  useEffect(() => {
    if (mode === "system" && systemMode) {
      settings.setState({ colorScheme: systemMode });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, systemMode]);

  // Visible options by default settings
  const isColorSchemeVisible = hasKeys(defaultSettings, ["colorScheme"]);

  const detectCurrentLanguage = () => {
    const segments = pathname.split("/").filter(Boolean);
    const firstSegment = segments[0];
    const hasLocale = locales.includes(firstSegment as Language);
    return hasLocale ? (firstSegment as Language) : defaultLocale;
  };

  const currentLanguage = detectCurrentLanguage();

  const handleChangeLang = useCallback(
    (newLang: Language) => {
      const segments = pathname.split("/");

      if (newLang === LANGUAGE.PL) {
        if (segments.length > 1 && locales.includes(segments[1] as Language)) {
          segments.splice(1, 1);
        }
      } else {
        if (locales.includes(segments[1] as Language)) {
          segments[1] = newLang;
        } else {
          segments.splice(1, 0, newLang);
        }
      }
      router.push(segments.join("/") || "/");
    },
    [locales, pathname, router]
  );

  const renderHead = () => (
    <Box
      sx={{
        py: 2,
        pr: 1,
        pl: 2.5,
        display: "flex",
        alignItems: "center",
      }}
    >
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        {t("title")}
      </Typography>

      <Tooltip title={t("close")}>
        <IconButton onClick={settings.onCloseDrawer}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const renderMode = () => (
    <BaseOption
      label={t("mode")}
      icon="moon"
      selected={settings.state.colorScheme === "dark"}
      onChangeOption={() => {
        setMode(mode === "light" ? "dark" : "light");
        settings.setState({ colorScheme: mode === "light" ? "dark" : "light" });
      }}
    />
  );

  const renderLanguage = () => (
    <LargeBlock title={t("language")} sx={{ gap: 2.5 }}>
      <LanguageOptions options={langs} value={currentLanguage} onChangeOption={handleChangeLang} />
    </LargeBlock>
  );

  const renderCurrency = () => (
    <LargeBlock title={t("currency")} sx={{ gap: 2.5 }}>
      <CurrencyOptions
        options={currencies}
        value={settings.state.currency || CURRENCY.PLN}
        onChangeOption={(option) => settings.setState({ currency: option })}
      />
    </LargeBlock>
  );

  return (
    <Drawer
      anchor="right"
      open={settings.openDrawer}
      onClose={settings.onCloseDrawer}
      disableScrollLock
      slotProps={{ backdrop: { invisible: true } }}
      PaperProps={{
        sx: [
          (theme) => ({
            ...theme.mixins.paperStyles(theme, {
              color: varAlpha(theme.vars.palette.background.defaultChannel, 0.9),
            }),
            width: 320,
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ],
      }}
    >
      {renderHead()}

      <Scrollbar>
        <Box
          sx={{
            pb: 5,
            gap: 6,
            px: 2.5,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ gap: 2, display: "flex", flexDirection: "column" }}>
            {isColorSchemeVisible && renderMode()}
          </Box>

          {renderLanguage()}
          {renderCurrency()}
        </Box>
      </Scrollbar>
    </Drawer>
  );
}
