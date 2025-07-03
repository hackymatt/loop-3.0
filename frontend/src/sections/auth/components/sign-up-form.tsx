import type { BoxProps } from "@mui/material/Box";

import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import { useBoolean } from "minimal-shared/hooks";

import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import LoadingButton from "@mui/lab/LoadingButton";
import InputAdornment from "@mui/material/InputAdornment";

import { Field } from "src/components/hook-form";
import { Iconify } from "src/components/iconify";

// ----------------------------------------------------------------------

type Props = BoxProps & {
  buttonText?: string;
};

export function SignUpForm({ buttonText = "Utwórz konto", sx, ...other }: Props) {
  const { t } = useTranslation("account");
  const showPassword = useBoolean();

  const {
    formState: { isSubmitting, errors },
  } = useFormContext();

  return (
    <Box
      sx={[
        { gap: 3, display: "flex", flexDirection: "column" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Field.Text
        name="email"
        label={t("email.label")}
        placeholder="email@example.com"
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <Field.Text
        name="password"
        label={t("password.label")}
        placeholder={t("password.placeholder")}
        type={showPassword.value ? "text" : "password"}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={showPassword.onToggle} edge="end">
                  <Iconify
                    icon={showPassword.value ? "solar:eye-outline" : "solar:eye-closed-outline"}
                  />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      {errors.root && (
        <Typography variant="body2" color="error" sx={{ width: 1 }}>
          {errors.root.message}
        </Typography>
      )}

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        {buttonText}
      </LoadingButton>
    </Box>
  );
}
