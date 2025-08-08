import type { BoxProps } from "@mui/material/Box";
import type { Currency } from "src/locales/types";
import type { SliderProps } from "@mui/material/Slider";

import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import Slider, { sliderClasses } from "@mui/material/Slider";

import { OptionButton } from "./styles";

import type { SettingsState } from "../types";

// ----------------------------------------------------------------------

export type CurrencyOptionsProps = BoxProps & {
  options: {
    value: Currency;
    label: string;
    symbol: string;
  }[];
  value: Currency;
  onChangeOption: (newOption: Currency) => void;
};

export function CurrencyOptions({
  sx,
  value,
  options,
  onChangeOption,
  ...other
}: CurrencyOptionsProps) {
  return (
    <Box
      sx={[
        () => ({
          gap: 1.5,
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <OptionButton
            key={option.value}
            selected={selected}
            onClick={() => onChangeOption(option.value)}
            sx={(theme) => ({
              py: 2,
              gap: 0.75,
              flexDirection: "column",
              fontSize: theme.typography.pxToRem(12),
              alignItems: "center",
            })}
          >
            <Typography>{option.symbol}</Typography>
            {option.label}
          </OptionButton>
        );
      })}
    </Box>
  );
}

// ----------------------------------------------------------------------

export type FontSizeOptionsProps = SliderProps & {
  options: [number, number];
  value: SettingsState["fontSize"];
  onChangeOption: (newOption: number) => void;
};

export function FontSizeOptions({
  sx,
  value,
  options,
  onChangeOption,
  ...other
}: FontSizeOptionsProps) {
  return (
    <Slider
      marks
      step={1}
      size="small"
      valueLabelDisplay="on"
      aria-label="Change font size"
      valueLabelFormat={(val) => `${val}px`}
      value={value}
      min={options[0]}
      max={options[1]}
      onChange={(event: Event, newOption: number | number[]) => onChangeOption(newOption as number)}
      sx={[
        (theme) => ({
          [`& .${sliderClasses.rail}`]: {
            height: 12,
          },
          [`& .${sliderClasses.track}`]: {
            height: 12,
            background: `linear-gradient(135deg, ${theme.vars.palette.primary.light}, ${theme.vars.palette.primary.dark})`,
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    />
  );
}
