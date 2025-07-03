import type { DialogProps } from "@mui/material/Dialog";

import { useTranslation } from "react-i18next";
import { varAlpha } from "minimal-shared/utils";

import { Box, Button, Dialog, Avatar, Typography, DialogTitle, DialogContent } from "@mui/material";

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { UpgradeButton } from "src/layouts/components/upgrade-button";

import { Iconify } from "src/components/iconify";

type Props = DialogProps & {
  slug: string;
};

export function UpgradeBanner({ slug, ...other }: Props) {
  const { t } = useTranslation("learn");
  const localize = useLocalizedPath();
  const router = useRouter();

  const handleReturnToCourse = () => {
    router.push(localize(`${paths.course}/${slug}`));
  };

  return (
    <Dialog
      disableEscapeKeyDown
      fullWidth
      maxWidth="sm"
      scroll="body"
      PaperProps={{
        sx: (theme) => ({
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: theme.vars.customShadows.z24,
        }),
      }}
      {...other}
    >
      <DialogTitle
        component="div"
        sx={{
          px: 4,
          py: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Avatar
          sx={{
            bgcolor: "primary.main",
            width: 64,
            height: 64,
            mb: 2,
          }}
        >
          <Iconify icon="solar:lock-bold" width={32} />
        </Avatar>

        <Typography variant="h6" sx={{ textAlign: "center" }}>
          {t("upgrade.title")}
        </Typography>
        <Typography
          variant="subtitle2"
          sx={{ color: "text.secondary", mt: 1, textAlign: "center" }}
        >
          {t("upgrade.description")}
        </Typography>
      </DialogTitle>

      <DialogContent
        sx={{
          px: 4,
          py: 4,
          gap: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box
          sx={(theme) => ({
            bgcolor: varAlpha(theme.vars.palette.primary.lightChannel, 0.08),
            borderRadius: 2,
            px: 2,
            py: 2,
            width: "100%",
            textAlign: "center",
          })}
        >
          <Typography variant="body1" sx={{ color: "text.primary" }}>
            {t("upgrade.banner.title")}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
            {t("upgrade.banner.description")}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mt: 3,
            gap: 1,
          }}
        >
          <UpgradeButton
            slotProps={{
              button: {
                size: "large",
                sx: {
                  width: { xs: 200, md: 300 },
                },
              },
            }}
          />

          <Button variant="text" color="inherit" onClick={handleReturnToCourse}>
            {t("upgrade.button")}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
