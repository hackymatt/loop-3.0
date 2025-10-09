import type { Variants } from "framer-motion";
import type { BoxProps } from "@mui/material/Box";
import type { Language } from "src/locales/types";

import { m } from "framer-motion";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

import { CONFIG } from "src/global-config";

import { varFade, MotionViewport } from "src/components/animate";

// ----------------------------------------------------------------------

const variants: Variants = varFade("inUp", { distance: 24 });

type HomeNewStartProps = { language: Language } & BoxProps;

export function HomeNewStart({ language, sx, ...other }: HomeNewStartProps) {
  const { t } = useTranslation("home");
  const theme = useTheme();

  return (
    <Box
      component="section"
      sx={[
        { bgcolor: "background.neutral", pt: { xs: 10, md: 15 }, pb: { xs: 5, md: 10 } },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Container component={MotionViewport}>
        <Box
          sx={{
            px: 3,
            gap: 3,
            pb: 10,
            display: "flex",
            borderRadius: 3,
            textAlign: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <m.div variants={variants}>
            <Box
              component="img"
              loading="lazy"
              alt="Cover"
              src={`${CONFIG.assetsDir}/assets/images/home/demo/${theme.palette.mode}/${language}.webp`}
              sx={{ width: 720 }}
            />
          </m.div>

          <m.div variants={variants}>
            <Typography variant="overline" sx={{ color: "text.disabled" }}>
              {t("platform.header")}
            </Typography>
          </m.div>

          <m.div variants={variants}>
            <Typography variant="h2">
              {t("platform.title")}
              <Box
                component="span"
                sx={(thm) => ({
                  ...thm.mixins.textGradient(
                    `90deg, ${thm.vars.palette.primary.main} 20%, ${thm.vars.palette.secondary.main} 100%`
                  ),
                })}
              >
                {` ${CONFIG.appName}`}
              </Box>
            </Typography>
          </m.div>

          <m.div variants={variants}>
            <Typography sx={{ color: "text.secondary", maxWidth: 480 }}>
              {t("platform.subtitle")}
            </Typography>
          </m.div>
        </Box>
      </Container>
    </Box>
  );
}
