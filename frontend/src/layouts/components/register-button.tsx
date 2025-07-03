import type { ButtonProps } from "@mui/material/Button";
import type { Theme, SxProps } from "@mui/material/styles";

import { useTranslation } from "react-i18next";
import { varAlpha } from "minimal-shared/utils";

import Button from "@mui/material/Button";

import { paths } from "src/routes/paths";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { useAnalytics } from "src/app/analytics-provider";

import { AnimateBorder } from "src/components/animate";

// ----------------------------------------------------------------------

export type RegisterButtonProps = {
  sx?: SxProps<Theme>;
  slotProps?: {
    button?: ButtonProps<"a">;
  };
};

export function RegisterButton({ slotProps, sx }: RegisterButtonProps) {
  const { t } = useTranslation("navigation");
  const localize = useLocalizedPath();

  const { trackEvent } = useAnalytics();

  return (
    <AnimateBorder
      sx={[
        {
          borderRadius: 1,
          position: "relative",
          bgcolor: "text.primary",
          color: "background.paper",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      duration={6}
      slotProps={{
        outlineColor: (theme) =>
          `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.04)}, ${varAlpha(theme.vars.palette.warning.mainChannel, 0.04)})`,
        primaryBorder: {
          size: 32,
          width: "2px",
          sx: (theme) => ({
            color: theme.vars.palette.primary.main,
          }),
        },
        secondaryBorder: {
          sx: (theme) => ({
            color: theme.vars.palette.warning.main,
          }),
        },
      }}
    >
      <Button
        variant="text"
        href={localize(paths.register)}
        onClick={() => trackEvent({ category: "auth", label: "register" })}
        {...slotProps?.button}
        sx={[
          { px: 2, borderRadius: "inherit", textAlign: "center", whiteSpace: "nowrap" },
          ...(Array.isArray(slotProps?.button?.sx)
            ? (slotProps?.button?.sx ?? [])
            : [slotProps?.button?.sx]),
        ]}
      >
        {t("register")}
      </Button>
    </AnimateBorder>
  );
}
