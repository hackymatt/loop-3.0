"use client";

import type { ICertificateProps } from "src/types/certificate";

import { useTranslation } from "react-i18next";

import Grid from "@mui/material/Grid2";
import { Box, Button, Typography } from "@mui/material";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { PLAN_TYPE } from "src/consts/plan";
import { UpgradeButton } from "src/layouts/components/upgrade-button";

import { Iconify } from "src/components/iconify";
import { useUserContext } from "src/components/user";

import { Certificate } from "../certificates";
import { CertificateItem } from "../certificates/certificate-item";

// ----------------------------------------------------------------------

type Props = { certificates: ICertificateProps[] };

// ----------------------------------------------------------------------

export function CertificatesProgress({ certificates }: Props) {
  const { t } = useTranslation("dashboard");
  const localize = useLocalizedPath();

  const user = useUserContext();
  const { firstName, lastName, plan } = user.state;

  const studentName = `${firstName} ${lastName}`;

  const blocked = plan.type === PLAN_TYPE.FREE && certificates.length === 0;

  const renderList = () => (
    <Box
      sx={{
        mt: 3,
        gap: 3,
        display: "grid",
        gridTemplateColumns: { xs: "repeat(1, 1fr)", md: "repeat(2, 1fr)" },
      }}
    >
      {certificates.map((certificate) => (
        <CertificateItem key={certificate.id} certificate={certificate} />
      ))}
    </Box>
  );

  const renderInfo = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 5,
        gap: 2,
        textAlign: "center",
      }}
    >
      <Typography variant="body1" sx={{ color: "text.disabled" }}>
        {t("certificates.lack")}
      </Typography>

      <Button
        component={RouterLink}
        href={localize(paths.courses)}
        color="inherit"
        size="large"
        variant="text"
        endIcon={<Iconify icon="solar:alt-arrow-right-outline" />}
      >
        {t("certificates.start")}
      </Button>
    </Box>
  );

  const renderBlocked = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 5,
        gap: 2,
        textAlign: "center",
      }}
    >
      <Box sx={{ p: { xs: 0, md: 5 } }}>
        <Grid container spacing={2} sx={{ alignItems: "center", justifyContent: "center" }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Certificate
              courseName="Introduction to Python Programming"
              studentName={studentName}
            />
          </Grid>

          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
          >
            <Typography variant="body1" sx={{ color: "text.disabled" }}>
              {t("certificates.blocked")}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <UpgradeButton
        slotProps={{
          button: { size: "large", startIcon: <Iconify icon="solar:lock-unlocked-outline" /> },
        }}
      />
    </Box>
  );

  const renderContent = () => {
    if (blocked) return renderBlocked();
    if (certificates.length) return renderList();
    return renderInfo();
  };

  return (
    <Box
      sx={(theme) => ({
        borderRadius: 2,
        p: 2,
        gridTemplateColumns: "repeat(2, 1fr)",
        border: `dashed 1px ${theme.vars.palette.divider}`,
      })}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: { xs: 2, md: 5 },
          textAlign: { xs: "center", md: "left" },
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {blocked && <Iconify icon="solar:lock-bold" sx={{ color: "text.disabled" }} />}
          <Typography
            variant="h5"
            sx={{
              ...(blocked && { color: "text.disabled" }),
            }}
          >
            {t("certificates.title")}
          </Typography>
        </Box>

        <Button
          component={RouterLink}
          href={localize(paths.certificates)}
          color="inherit"
          endIcon={<Iconify icon="solar:alt-arrow-right-outline" />}
          sx={{ display: "inline-flex" }}
          disabled={blocked}
        >
          {t("certificates.button")}
        </Button>
      </Box>

      {renderContent()}
    </Box>
  );
}
