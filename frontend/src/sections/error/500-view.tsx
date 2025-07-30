"use client";

import { m } from "framer-motion";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { CONFIG } from "src/global-config";
import { SimpleLayout } from "src/layouts/simple";

import { varBounce, MotionContainer } from "src/components/animate";

// ----------------------------------------------------------------------

export function Error500View() {
  const { t } = useTranslation("500");
  const localize = useLocalizedPath();

  return (
    <SimpleLayout slotProps={{ content: { compact: true } }}>
      <MotionContainer>
        <m.div variants={varBounce("in")}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            {t("title")}
          </Typography>
        </m.div>

        <m.div variants={varBounce("in")}>
          <Typography sx={{ color: "text.secondary" }}>{t("subtitle")}</Typography>
        </m.div>

        <m.div variants={varBounce("in")}>
          <Box
            component="img"
            alt="Error"
            src={`${CONFIG.assetsDir}/assets/illustrations/illustration-500.svg`}
            sx={{ mx: "auto", width: 320, maxWidth: 1, height: "auto", my: { xs: 5, sm: 10 } }}
          />
        </m.div>

        <Button
          component={RouterLink}
          href={localize(paths.home)}
          size="large"
          color="inherit"
          variant="contained"
        >
          {t("button")}
        </Button>
      </MotionContainer>
    </SimpleLayout>
  );
}
