import { LANGUAGE } from "src/consts/language";
import { themeConfig } from "src/theme/theme-config";

import type { SettingsState } from "./types";

// ----------------------------------------------------------------------

export const SETTINGS_STORAGE_KEY: string = "app-settings";

export const defaultSettings: SettingsState = {
  colorScheme: themeConfig.defaultMode,
  direction: themeConfig.direction,
  primaryColor: "default",
  fontSize: 16,
  fontFamily: themeConfig.fontFamily.primary,
  language: LANGUAGE.PL,
};
