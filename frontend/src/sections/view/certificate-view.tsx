"use client";

import type { ICertificateProps } from "src/types/certificate";

import Container from "@mui/material/Container";

import { Certificate } from "../certificates";

// ----------------------------------------------------------------------
type CertificateProps = {
  data: {
    certificate: ICertificateProps;
  };
};

export function CertificateView({ data }: CertificateProps) {
  const { certificate } = data;

  return (
    <Container sx={{ py: { xs: 5, md: 10 } }}>
      <Certificate
        projectName={certificate?.projectName || ""}
        studentName={certificate?.studentName || ""}
        completedAt={certificate?.completedAt || ""}
        showButtons
        sx={(theme) => ({
          height: 600,
          [theme.breakpoints.down("md")]: {
            height: 300,
          },
        })}
      />
    </Container>
  );
}
