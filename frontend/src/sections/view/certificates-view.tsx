"use client";

import { useTranslation } from "react-i18next";
import { useBoolean } from "minimal-shared/hooks";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import { useQueryParams } from "src/hooks/use-query-params";

import { useCertificates } from "src/api/certificate/certificates";

import { Iconify } from "src/components/iconify";
import { SplashScreen } from "src/components/loading-screen";

import { CertificateList } from "../certificates/certificate-list";

// ----------------------------------------------------------------------

export function CertificatesView() {
  const { t } = useTranslation("certificate");

  const { handleChange, query } = useQueryParams();

  const {
    data: certificates,
    count,
    pageSize,
    isLoading: isLoadingCertificates,
  } = useCertificates(query);

  const openMobile = useBoolean();

  const renderHead = () => (
    <Box sx={{ display: "flex", alignItems: "center", py: 5 }}>
      <Typography variant="h3" sx={{ flexGrow: 1 }}>
        {t("title")}
      </Typography>

      <Iconify
        width={18}
        icon="solar:filter-outline"
        onClick={openMobile.onTrue}
        sx={{ display: { md: "none" } }}
      />
    </Box>
  );

  const renderListView = () => (
    <Box sx={{ gap: 4, display: "flex", flexDirection: "column" }}>
      <CertificateList
        certificates={certificates ?? []}
        recordsCount={count || 0}
        pagesCount={pageSize || 0}
        page={Number(query.page) || 1}
        onPageChange={(selectedPage: number) => handleChange("page", String(selectedPage))}
      />
    </Box>
  );

  if (isLoadingCertificates) {
    return <SplashScreen />;
  }

  return (
    <Container>
      {renderHead()}

      <Box
        sx={{
          mb: 10,
          display: "flex",
          flexDirection: { xs: "column-reverse", md: "row" },
        }}
      >
        <Box sx={{ flex: "1 1 auto", minWidth: 0 }}>{renderListView()}</Box>
      </Box>
    </Container>
  );
}
