"use client";

import type { IconButtonProps } from "@mui/material/IconButton";

import IconButton from "@mui/material/IconButton";
import { useColorScheme } from "@mui/material/styles";

import { Iconify } from "src/components/iconify";
import { useSettingsContext } from "src/components/settings/context";

// ----------------------------------------------------------------------

export type ThemeButtonProps = IconButtonProps;

export function ThemeButton({ sx, ...other }: ThemeButtonProps) {
  const settings = useSettingsContext();
  const { mode, setMode } = useColorScheme();

  const isLightMode = settings.state.colorScheme === "light";

  return (
    <IconButton
      color="inherit"
      aria-label="theme"
      onClick={() => {
        setMode(mode === "light" ? "dark" : "light");
        settings.setState({ colorScheme: mode === "light" ? "dark" : "light" });
      }}
      sx={[{ p: 0, width: 40, height: 40 }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...other}
    >
      <Iconify
        icon={isLightMode ? "solar:moon-outline" : "solar:sun-outline"}
        width={22}
        height={22}
      />
    </IconButton>
  );
}
