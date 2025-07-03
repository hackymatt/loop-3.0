import type { BoxProps } from "@mui/material/Box";

import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";

// ----------------------------------------------------------------------

type FormResendCodeProps = BoxProps & {
  value?: number;
  disabled?: boolean;
  onResendCode?: () => void;
};

export function FormResendLink({
  sx,
  value,
  disabled,
  onResendCode,
  ...other
}: FormResendCodeProps) {
  const { t } = useTranslation("activate");
  return (
    <Box
      sx={[{ mt: 3, typography: "body2", alignSelf: "center" }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...other}
    >
      {t("help")}{" "}
      <Link
        variant="subtitle2"
        onClick={onResendCode}
        sx={{
          cursor: "pointer",
          ...(disabled && { color: "text.disabled", pointerEvents: "none" }),
        }}
      >
        {t("button")} {disabled && value && value > 0 && `(${value}s)`}
      </Link>
    </Box>
  );
}
