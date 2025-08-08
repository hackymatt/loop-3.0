"use client";

import type { Variants } from "framer-motion";

import { m } from "framer-motion";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import { Iconify } from "src/components/iconify";
import { varBounce, MotionContainer } from "src/components/animate";

// ----------------------------------------------------------------------

const variants: Variants = varBounce("in");

export default function OrderCompletedView() {
  const { t } = useTranslation("order-completed");
  return (
    <Container
      component={MotionContainer}
      sx={{
        textAlign: "center",
        pt: { xs: 5, md: 10 },
        pb: { xs: 10, md: 20 },
      }}
    >
      <m.div variants={variants}>
        <Box sx={{ fontSize: 128 }}>🎉</Box>
      </m.div>

      <Stack spacing={1} sx={{ my: 5 }}>
        <Typography variant="h3">{t("title")}</Typography>
        <Typography variant="body1" sx={{ mb: 0.5, display: "block", color: "text.disabled" }}>
          {t("subtitle")}
        </Typography>
      </Stack>

      <Button
        component={RouterLink}
        href={paths.account.dashboard}
        size="large"
        color="inherit"
        variant="contained"
        endIcon={<Iconify icon="carbon:chevron-right" />}
      >
        {t("button")}
      </Button>
    </Container>
  );
}
