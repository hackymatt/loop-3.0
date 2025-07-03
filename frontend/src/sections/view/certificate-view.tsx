"use client";

import Container from "@mui/material/Container";

import { useCertificate } from "src/api/certificate/certificate";

import { SplashScreen } from "src/components/loading-screen";

import { Certificate } from "../certificates";
import { NotFoundView } from "../error/not-found-view";

// ----------------------------------------------------------------------

export function CertificateView({ id }: { id: string }) {
  const { data: certificate, isError, isLoading } = useCertificate(id);

  if (isError) {
    return <NotFoundView />;
  }

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Container sx={{ py: { xs: 5, md: 10 } }}>
      <Certificate
        courseName={certificate?.courseName || ""}
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
