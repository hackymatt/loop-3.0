import type { DialogProps } from "@mui/material";
import type { StackProps } from "@mui/material/Stack";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useBoolean } from "minimal-shared/hooks";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha, styled } from "@mui/material/styles";
import Button, { buttonClasses } from "@mui/material/Button";
import { Dialog, IconButton, DialogTitle, DialogContent } from "@mui/material";

import { Iconify } from "../iconify";

// ----------------------------------------------------------------------

const StyledAppStoreButton = styled(Button)(({ theme }) => ({
  minWidth: 160,
  flexShrink: 0,
  padding: "5px 12px",
  color: theme.palette.common.white,
  border: `solid 1px ${alpha(theme.palette.common.black, 0.24)}`,
  background: `linear-gradient(180deg, ${theme.palette.grey[900]} 0%, ${theme.palette.common.black} 100%)`,
  [`& .${buttonClasses.startIcon}`]: {
    marginLeft: 0,
  },
}));

// ----------------------------------------------------------------------

const Platform = { iOS: "iOS", Android: "Android" } as const;

type IPlatform = keyof typeof Platform;

export function AppStoreButton({ ...other }: StackProps) {
  const { t } = useTranslation("app-store");

  const downloadPromptOpen = useBoolean();

  const [platform, setPlatform] = useState<IPlatform>(Platform.iOS);

  return (
    <>
      <Stack direction={{ xs: "column", md: "row" }} flexWrap="wrap" spacing={2} {...other}>
        <StyledAppStoreButton
          startIcon={<Iconify icon="bxl:apple" width={28} color="white" />}
          onClick={() => {
            setPlatform(Platform.iOS);
            downloadPromptOpen.onToggle();
          }}
        >
          <Stack alignItems="flex-start">
            <Typography variant="caption" sx={{ opacity: 0.72 }}>
              {t("install")}
            </Typography>

            <Typography variant="h6" sx={{ mt: -0.5 }}>
              iOS
            </Typography>
          </Stack>
        </StyledAppStoreButton>

        <StyledAppStoreButton
          startIcon={<Iconify icon="bxl:android" width={28} color="white" />}
          onClick={() => {
            setPlatform(Platform.Android);
            downloadPromptOpen.onToggle();
          }}
        >
          <Stack alignItems="flex-start">
            <Typography variant="caption" sx={{ opacity: 0.72 }}>
              {t("install")}
            </Typography>

            <Typography variant="h6" sx={{ mt: -0.5 }}>
              Android
            </Typography>
          </Stack>
        </StyledAppStoreButton>
      </Stack>
      <DownloadPrompt
        platform={platform}
        open={downloadPromptOpen.value}
        onClose={downloadPromptOpen.onFalse}
      />
    </>
  );
}

interface Props extends DialogProps {
  platform: IPlatform;
  onClose: VoidFunction;
}

function DownloadPrompt({ platform, onClose, ...other }: Props) {
  const { t } = useTranslation("app-store");

  const content = (
    <Stack direction="column" spacing={1} pt={3} pb={3}>
      <Stack direction="row" spacing={0.5} justifyContent="left" alignItems="center">
        <Typography variant="body2">1. {t("steps.click")}</Typography>
        <Iconify
          icon={
            platform === Platform.iOS ? "material-symbols:ios-share" : "material-symbols:more-vert"
          }
          width={28}
          sx={{ bgcolor: "background.neutral", p: 0.5, borderRadius: 1 }}
        />
        {platform === Platform.iOS ? t("steps.screen.iOS") : t("steps.screen.Android")}
      </Stack>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={0.5}
        justifyContent="left"
        alignItems={{ xs: "left", md: "center" }}
      >
        <Typography variant="body2">2. {t("steps.chose")}</Typography>
        <Stack
          direction="row"
          spacing={0.5}
          justifyContent="left"
          alignItems="center"
          sx={{ bgcolor: "background.neutral", p: 0.5, borderRadius: 1 }}
        >
          {platform === Platform.iOS ? (
            <>
              <Typography variant="body2">{t("steps.add.iOS")}</Typography>
              <Iconify icon="material-symbols:add-box-outline-rounded" />
            </>
          ) : (
            <>
              <Iconify icon="material-symbols:open-in-phone" />
              <Typography variant="body2">{t("steps.add.Android")}</Typography>
            </>
          )}
        </Stack>
      </Stack>
    </Stack>
  );

  return (
    <Dialog fullWidth maxWidth="xs" onClose={onClose} {...other}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" pb={1}>
        <DialogTitle sx={{ typography: "h6" }}>{t("title")}</DialogTitle>
        <IconButton onClick={onClose} sx={{ p: 3 }}>
          <Iconify icon="carbon:close" />
        </IconButton>
      </Stack>

      <DialogContent sx={{ py: 0, typography: "body2" }}>
        {t("subtitle").replace(
          "[platform]",
          platform === Platform.iOS ? "App Store" : "Google Play"
        )}{" "}
        {content}
      </DialogContent>
    </Dialog>
  );
}
