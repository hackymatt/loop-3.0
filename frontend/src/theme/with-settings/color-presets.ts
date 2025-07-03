import { primary, secondary } from "../core/palette";

import type { PaletteColorNoChannels } from "../core";

// ----------------------------------------------------------------------

export const primaryColorPresets: Record<string, PaletteColorNoChannels> = {
  default: {
    lighter: primary.lighter,
    light: primary.light,
    main: primary.main,
    dark: primary.dark,
    darker: primary.darker,
    contrastText: primary.contrastText,
  },
  preset1: {
    lighter: "#FEE7E4",
    light: "#FBAEB5",
    main: "#F2779A",
    dark: "#AE3B72",
    darker: "#741655",
    contrastText: "#FFFFFF",
  },
  preset2: {
    lighter: "#D0FCE0",
    light: "#72F2B9",
    main: "#1AD5A6",
    dark: "#0D9991",
    darker: "#045966",
    contrastText: "#1C252E",
  },
  preset3: {
    lighter: "#CCF4FE",
    light: "#68CDF9",
    main: "#078DEE",
    dark: "#0351AB",
    darker: "#012972",
    contrastText: "#FFFFFF",
  },
  preset4: {
    lighter: "#FEE9D1",
    light: "#FDAB76",
    main: "#FA541C",
    dark: "#B3200E",
    darker: "#770508",
    contrastText: "#FFFFFF",
  },
  preset5: {
    lighter: "#F9E9D1",
    light: "#DBA573",
    main: "#87431D",
    dark: "#61210E",
    darker: "#400C05",
    contrastText: "#FFFFFF",
  },
};

export const secondaryColorPresets: Record<string, PaletteColorNoChannels> = {
  default: {
    lighter: secondary.lighter,
    light: secondary.light,
    main: secondary.main,
    dark: secondary.dark,
    darker: secondary.darker,
    contrastText: secondary.contrastText,
  },
  preset1: {
    lighter: "#CAFDEB",
    light: "#61F4D9",
    main: "#00DCDA",
    dark: "#00849E",
    darker: "#004569",
    contrastText: "#FFFFFF",
  },
  preset2: {
    lighter: "#D6E5FD",
    light: "#85A9F3",
    main: "#3562D7",
    dark: "#1A369A",
    darker: "#0A1967",
    contrastText: "#FFFFFF",
  },
  preset3: {
    lighter: "#FFF3D8",
    light: "#FFD18B",
    main: "#FFA03F",
    dark: "#B75D1F",
    darker: "#7A2D0C",
    contrastText: "#1C252E",
  },
  preset4: {
    lighter: "#EFD6FF",
    light: "#C684FF",
    main: "#8E33FF",
    dark: "#5119B7",
    darker: "#27097A",
    contrastText: "#FFFFFF",
  },
  preset5: {
    lighter: "#FCF0DA",
    light: "#EEC18D",
    main: "#C87941",
    dark: "#904220",
    darker: "#601B0C",
    contrastText: "#FFFFFF",
  },
};
