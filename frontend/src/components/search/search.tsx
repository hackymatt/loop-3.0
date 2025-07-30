import type { TextFieldProps } from "@mui/material";

import { useState, useEffect } from "react";
import { useDebounce } from "minimal-shared/hooks";

import { TextField, InputAdornment } from "@mui/material";

import { Iconify } from "src/components/iconify";

type Props = TextFieldProps & {
  value?: string;
  onChange?: (newValue: string) => void;
  placeholder?: string;
};

export default function Search({ value, onChange, placeholder, ...other }: Props) {
  const [internalValue, setInternalValue] = useState<string | undefined>(value);
  const debouncedValue = useDebounce(internalValue ?? "", 500);

  const handleChange = (event: { target: { value: string } }) => {
    setInternalValue(event.target.value);
  };

  useEffect(() => {
    if (debouncedValue !== value) {
      onChange?.(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);

  return (
    <TextField
      fullWidth
      hiddenLabel
      placeholder={placeholder ?? "Szukaj..."}
      value={internalValue}
      onChange={handleChange}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Iconify width={24} icon="carbon:search" sx={{ color: "text.disabled" }} />
            </InputAdornment>
          ),
        },
      }}
      {...other}
    />
  );
}
