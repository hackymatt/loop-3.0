import type { Variants } from "framer-motion";
import type { BoxProps } from "@mui/material/Box";

import { m } from "framer-motion";
import { useTranslation } from "react-i18next";
import { varAlpha } from "minimal-shared/utils";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import { paths } from "src/routes/paths";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { CONFIG } from "src/global-config";

import { Iconify } from "src/components/iconify";
import { varFade, AnimateBorder, MotionViewport } from "src/components/animate";

import { SignUpView } from "../auth/sign-up-view";
import { FormHead } from "../auth/components/form-head";

// ----------------------------------------------------------------------

const variants: Variants = varFade("inUp", { distance: 24 });

export function HomeHero({ sx, ...other }: BoxProps) {
  const { t } = useTranslation("home");
  const localize = useLocalizedPath();

  const renderTexts = () => (
    <>
      <m.div variants={variants}>
        <Typography variant="h1">
          {t("title")}
          <Box
            component="span"
            sx={(theme) => ({
              ...theme.mixins.textGradient(
                `90deg, ${theme.vars.palette.primary.main} 20%, ${theme.vars.palette.secondary.main} 100%`
              ),
            })}
          >
            {` ${CONFIG.appName}`}
          </Box>
        </Typography>
      </m.div>

      <m.div variants={variants}>
        <Typography sx={{ maxWidth: 480 }}>{t("subtitle")}</Typography>
      </m.div>
    </>
  );

  const renderActionButton = () => (
    <AnimateBorder
      sx={(theme) => ({
        borderRadius: 1.25,
        position: "relative",
        display: "inline-flex",
        bgcolor: "text.primary",
        color: "background.paper",
      })}
      duration={12}
      slotProps={{
        outlineColor: (theme) =>
          `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.04)}, ${varAlpha(theme.vars.palette.warning.mainChannel, 0.04)})`,
        primaryBorder: {
          size: 50,
          width: "1.5px",
          sx: (theme) => ({ color: theme.vars.palette.primary.main }),
        },
        secondaryBorder: { sx: (theme) => ({ color: theme.vars.palette.warning.main }) },
      }}
    >
      <Button
        size="large"
        variant="text"
        rel="noopener"
        href={localize(paths.register)}
        endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
        sx={{ px: 2, borderRadius: "inherit" }}
      >
        {t("button")}
      </Button>
    </AnimateBorder>
  );

  const renderContent = () => (
    <MotionViewport
      sx={{
        gap: 5,
        maxWidth: 480,
        display: "flex",
        flexDirection: "column",
        alignItems: { xs: "center", md: "flex-start" },
        textAlign: { xs: "center", md: "left" },
      }}
    >
      {renderTexts()}

      <m.div variants={variants}>{renderActionButton()}</m.div>
    </MotionViewport>
  );

  const renderForm = () => (
    <Box
      component={MotionViewport}
      sx={(theme) => ({
        py: 5,
        width: 1,
        zIndex: 2,
        borderRadius: 2,
        flexDirection: "column",
        px: { xs: 3, md: 5 },
        boxShadow: theme.vars.customShadows.z24,
        maxWidth: "var(--layout-auth-content-width)",
        bgcolor: theme.vars.palette.background.default,
        flex: "1 1 auto",
        display: "block",
      })}
    >
      <m.div variants={variants}>
        <SignUpView
          header={<FormHead title={t("sign-up.header")} />}
          buttonText={t("sign-up.button")}
        />
      </m.div>
    </Box>
  );

  return (
    <Box
      component="section"
      sx={[
        (theme) => ({
          ...theme.mixins.bgGradient({
            images: [
              `linear-gradient(to bottom, ${varAlpha(theme.vars.palette.background.defaultChannel, 0.9)}, ${varAlpha(theme.vars.palette.background.defaultChannel, 0.9)})`,
              `url(${CONFIG.assetsDir}/assets/background/overlay-1.webp)`,
            ],
          }),
          py: 10,
          overflow: "hidden",
          position: "relative",
          [theme.breakpoints.up("md")]: {
            py: 15,
            minHeight: 760,
            height: "100vh",
            maxHeight: 1440,
            display: "flex",
            alignItems: "center",
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Container
        sx={(theme) => ({
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "center",
          gap: { xs: 5, md: 10 },
          alignItems: { xs: "center", md: "flex-start" },
          maxWidth: "lg",
        })}
      >
        <Box sx={{ flex: { xs: "none", md: 3 } }}>{renderContent()}</Box>

        <Box sx={{ flex: { xs: "none", md: 2 }, width: { xs: "100%", md: "auto" } }}>
          {renderForm()}
        </Box>
      </Container>
    </Box>
  );
}
