import type { TextFieldProps } from "@mui/material/TextField";

import { Controller, useFormContext } from "react-hook-form";
import { transformValue, transformValueOnBlur, transformValueOnChange } from "minimal-shared/utils";

import TextField from "@mui/material/TextField";

// ----------------------------------------------------------------------

export type RHFTextFieldProps = TextFieldProps & {
  name: string;
  mask?: (value: string) => string;
  unmask?: (value: string) => string;
};

export function RHFTextField({
  name,
  helperText,
  slotProps,
  type = "text",
  mask,
  unmask,
  ...other
}: RHFTextFieldProps) {
  const { control } = useFormContext();

  const isNumberType = type === "number";

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth
          value={
            mask
              ? mask(field.value ?? "")
              : isNumberType
                ? transformValue(field.value)
                : (field.value ?? "")
          }
          onChange={(event) => {
            const inputValue = event.target.value;
            const cleanedValue = unmask
              ? unmask(inputValue)
              : isNumberType
                ? transformValueOnChange(inputValue)
                : inputValue;

            field.onChange(cleanedValue);
          }}
          onBlur={(event) => {
            const inputValue = event.target.value;
            const cleanedValue = unmask
              ? unmask(inputValue)
              : isNumberType
                ? transformValueOnBlur(inputValue)
                : inputValue;

            field.onChange(cleanedValue);
          }}
          type={isNumberType ? "text" : type}
          error={!!error}
          helperText={error?.message ?? helperText}
          slotProps={{
            ...slotProps,
            htmlInput: {
              autoComplete: "off",
              ...slotProps?.htmlInput,
              ...(isNumberType && {
                inputMode: "decimal",
                pattern: "[0-9]*\\.?[0-9]*",
              }),
            },
          }}
          {...other}
        />
      )}
    />
  );
}
