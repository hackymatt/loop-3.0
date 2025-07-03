import type { Variants } from "framer-motion";
import type { BoxProps } from "@mui/material/Box";

import { m } from "framer-motion";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import { CONFIG } from "src/global-config";

import { varFade, MotionViewport } from "src/components/animate";

// ----------------------------------------------------------------------

const variants: Variants = varFade("inUp", { distance: 24 });

export function HomeNewStart({ sx, ...other }: BoxProps) {
  const { t } = useTranslation("home");
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
              src={`${CONFIG.assetsDir}/assets/images/home/demo.webp`}
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
            <Typography sx={{ color: "text.secondary", maxWidth: 480 }}>
              {t("platform.subtitle")}
            </Typography>
          </m.div>
        </Box>
      </Container>
    </Box>
  );
}
