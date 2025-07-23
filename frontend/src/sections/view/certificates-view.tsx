"use client";

import type { ICertificateProps } from "src/types/certificate";

import { useTranslation } from "react-i18next";
import { useBoolean } from "minimal-shared/hooks";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import { useQueryParams } from "src/hooks/use-query-params";

import { Iconify } from "src/components/iconify";

import { CertificateList } from "../certificates/certificate-list";

// ----------------------------------------------------------------------
type CertificatesProps = {
  data: {
    certificates: ICertificateProps[];
    certificatesCount: number;
    certificatesPageSize: number;
  };
};

export function CertificatesView(data: CertificatesProps) {
  const { t } = useTranslation("certificate");

  const { handleChange, query } = useQueryParams();

  const { certificates, certificatesCount, certificatesPageSize } = data.data;

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
        recordsCount={certificatesCount || 0}
        pagesCount={certificatesPageSize || 0}
        page={Number(query.page) || 1}
        onPageChange={(selectedPage: number) => handleChange("page", String(selectedPage))}
      />
    </Box>
  );

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
