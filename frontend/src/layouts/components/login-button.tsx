import type { ButtonProps } from "@mui/material/Button";
import type { Theme, SxProps } from "@mui/material/styles";

import { useTranslation } from "react-i18next";

import Button from "@mui/material/Button";

import { paths } from "src/routes/paths";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { useAnalytics } from "src/app/analytics-provider";

// ----------------------------------------------------------------------

export type LoginButtonProps = {
  sx?: SxProps<Theme>;
  slotProps?: {
    button?: ButtonProps<"a">;
  };
};

export function LoginButton({ slotProps, sx }: LoginButtonProps) {
  const { t } = useTranslation("navigation");
  const localize = useLocalizedPath();

  const { trackEvent } = useAnalytics();

  return (
    <Button
      variant="outlined"
      size="small"
      href={localize(paths.login)}
      onClick={() => trackEvent({ category: "auth", label: "login" })}
      {...slotProps?.button}
      sx={[
        {
          px: 2,
          borderRadius: 1,
          textAlign: "center",
          whiteSpace: "nowrap",
        },
        ...(Array.isArray(slotProps?.button?.sx)
          ? (slotProps?.button?.sx ?? [])
          : [slotProps?.button?.sx]),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {t("login")}
    </Button>
  );
}
