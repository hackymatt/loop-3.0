"use client";

import type { Language } from "src/locales/types";
import type { ContainerProps } from "@mui/material/Container";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

import { NavAccountDesktop } from "./nav";
import { useNavData } from "./nav-config";

// ----------------------------------------------------------------------

type AccountLayoutProps = ContainerProps & {
  language: Language;
  children: React.ReactNode;
};

export function AccountLayout({ language, children, sx, ...other }: AccountLayoutProps) {
  const navData = useNavData();
  return (
    <Container sx={sx} {...other}>
      <Box
        sx={{
          display: "flex",
          mt: { xs: 5, md: 10 },
          mb: { xs: 5, md: 10 },
          alignItems: { md: "flex-start" },
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <NavAccountDesktop data={navData} language={language} />

        <Box
          sx={{
            flexGrow: 1,
            pl: { md: 8 },
            width: { md: `calc(100% - ${280}px)` },
          }}
        >
          {children}
        </Box>
      </Box>
    </Container>
  );
}
