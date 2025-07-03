"use client";

import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useBoolean } from "minimal-shared/hooks";

import { Box, Link, Paper, Stack, Button, Typography } from "@mui/material";

import { paths } from "src/routes/paths";

import { useCookiesTypes } from "src/hooks/use-cookies-types";
import { useLocalizedPath } from "src/hooks/use-localized-path";

import { Form } from "src/components/hook-form";

import { CookiesSettings } from "./cookies-settings";

// ----------------------------------------------------------------------

interface Props {
  onConfirm: (cookies: { [cookie: string]: boolean }) => void;
}

// ----------------------------------------------------------------------

export function CookiesBanner({ onConfirm }: Props) {
  const { t } = useTranslation("cookies");
  const localize = useLocalizedPath();

  const methods = useForm();
  const cookieSettingsFormOpen = useBoolean();
  const { defaultCookies } = useCookiesTypes();

  const allCookies = Object.keys(defaultCookies).reduce(
    (acc, key) => {
      acc[key] = true;
      return acc;
    },
    {} as { [cookie: string]: boolean }
  );

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          width: "100%",
          zIndex: 1300,
          px: 2,
          pb: 2,
        }}
      >
        <Paper
          elevation={12}
          sx={{
            maxWidth: 720,
            mx: "auto",
            p: 3,
            borderRadius: 2,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            gap: 2,
          }}
        >
          <Form methods={methods}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {t("text.main")}{" "}
                <Link
                  target="_blank"
                  rel="noopener"
                  href={localize(paths.privacyPolicy)}
                  sx={{ color: "primary.main", textDecoration: "underline" }}
                >
                  {t("privacyPolicy")}
                </Link>
                .
              </Typography>
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ flexShrink: 0, mt: 2 }}
            >
              <Button variant="contained" color="primary" onClick={() => onConfirm(allCookies)}>
                {t("button.acceptAll")}
              </Button>

              <Button variant="outlined" color="inherit" onClick={cookieSettingsFormOpen.onTrue}>
                {t("button.manage")}
              </Button>
            </Stack>
          </Form>
        </Paper>
      </Box>

      <CookiesSettings
        open={cookieSettingsFormOpen.value}
        onConfirm={(selectedCookies) => {
          onConfirm(selectedCookies);
          cookieSettingsFormOpen.onFalse();
        }}
      />
    </>
  );
}
