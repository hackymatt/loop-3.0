import { Controller, useFormContext } from "react-hook-form";

import FormHelperText from "@mui/material/FormHelperText";

import { MarkdownEditor } from "../markdown-editor";

// ----------------------------------------------------------------------

interface Props {
  name: string;
  helperText?: React.ReactNode;
}

export function RHFMarkdownField({ name, helperText, ...other }: Props) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { ref, ...field }, fieldState: { error } }) => (
        <div>
          <MarkdownEditor {...field} ref={ref} {...other} />

          {(!!error || helperText) && (
            <FormHelperText error={!!error}>{error ? error.message : helperText}</FormHelperText>
          )}
        </div>
      )}
    />
  );
}
