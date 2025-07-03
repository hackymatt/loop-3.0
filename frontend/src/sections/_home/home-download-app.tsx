import type { BoxProps } from "@mui/material";

import { useTranslation } from "react-i18next";

import { Box } from "@mui/material";
import Grid from "@mui/material/Grid2";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import { CONFIG } from "src/global-config";

import { AppStoreButton } from "src/components/app-store";

// ----------------------------------------------------------------------

export function HomeDownloadApp({ sx, ...other }: BoxProps) {
  const { t } = useTranslation("home");

  const renderTexts = () => (
    <Box sx={{ textAlign: "center" }}>
      <Typography variant="h2">{t("app.title")}</Typography>
      <Typography sx={{ mt: 3, mb: 5 }}>{t("app.subtitle")}</Typography>
    </Box>
  );

  const renderImage = () => (
    <Box
      component="img"
      loading="lazy"
      alt="Mobile app"
      src={`${CONFIG.assetsDir}/assets/images/course/download-app.webp`}
      sx={{ width: 560 }}
    />
  );

  const renderButtons = () => (
    <Box sx={{ gap: 2, display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
      <AppStoreButton />
    </Box>
  );

  return (
    <Box
      component="section"
      sx={[
        (theme) => ({
          position: "relative",
          pt: { xs: 5, md: 10 },
          pb: { xs: 10, md: 15 },
          "&::before": {
            ...theme.mixins.bgGradient({
              images: [`url(${CONFIG.assetsDir}/assets/background/texture-2.webp)`],
              sizes: ["auto 100%"],
              positions: ["top right -80px"],
            }),
            top: 0,
            left: 0,
            width: 1,
            height: 1,
            zIndex: -1,
            content: "''",
            opacity: 0.24,
            position: "absolute",
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Container>
        <Grid
          container
          spacing={{ xs: 5, md: 3 }}
          sx={{ justifyContent: { md: "space-between" }, alignItems: "center" }}
        >
          <Grid size={{ xs: 12, md: 6, lg: 5 }}>
            {renderTexts()}
            <Box
              sx={(theme) => ({
                py: 5,
                borderRadius: 2,
                alignItems: "center",
                px: { xs: 3, md: 5 },
                border: `solid 1px ${theme.vars.palette.divider}`,
              })}
            >
              {renderButtons()}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6, lg: 6 }} sx={{ textAlign: { xs: "center", md: "right" } }}>
            {renderImage()}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
