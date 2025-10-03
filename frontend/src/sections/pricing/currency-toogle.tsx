import type { Currency } from "src/types/plan";

import { ToggleButton, ToggleButtonGroup } from "@mui/material";

import { currencies } from "src/layouts/currency-config";

type CurrencyToggleProps = {
  value: Currency;
  onChange: (currency: Currency) => void;
};

export default function CurrencyToggle({ value, onChange }: CurrencyToggleProps) {
  const handleChange = (event: React.MouseEvent<HTMLElement>, newCurrency: Currency) => {
    if (newCurrency) {
      onChange(newCurrency);
    }
  };

  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={handleChange}
      color="primary"
      size="small"
      sx={{
        borderRadius: "50px",
        "& .MuiToggleButton-root": {
          borderRadius: "50px",
          px: 2,
        },
      }}
    >
      {currencies.map(({ value: v, symbol, label }) => (
        <ToggleButton key={v} value={v}>{`${symbol} ${label}`}</ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
