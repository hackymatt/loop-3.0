"use client";

import type { IDashboardProps } from "src/types/user";

import Grid from "@mui/material/Grid2";
import { Box, Container } from "@mui/material";

import { ProfileSummary } from "../dashboard/profile-summary";
import { ProjectsProgress } from "../dashboard/projects-progress";
import { CertificatesProgress } from "../dashboard/certificates-progress";

// ----------------------------------------------------------------------
type DashboardProps = {
  data: IDashboardProps;
};

export function DashboardView({ data }: DashboardProps) {
  const renderContent = () => (
    <Box
      sx={{
        mb: 10,
        py: 5,
        display: "flex",
        flexDirection: { xs: "column-reverse", md: "row" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: "1 1 auto",
          gap: 5,
          mb: 1,
        }}
      >
        <ProjectsProgress projects={data.projects || []} />

        <CertificatesProgress certificates={data.certificates || []} />
      </Box>
    </Box>
  );

  const renderInfo = () => (
    <Box
      sx={{
        py: 5,
      }}
    >
      <ProfileSummary
        totalPoints={data.totalPoints || 0}
        dailyStreak={data.dailyStreak || 0}
        tokens={data.tokens || 0}
      />
    </Box>
  );

  return (
    <Container>
      <Grid container spacing={{ xs: 0, md: 8 }}>
        <Grid size={{ xs: 12, md: 5, lg: 4 }} order={{ xs: 1, md: 2 }}>
          {renderInfo()}
        </Grid>
        <Grid size={{ xs: 12, md: 7, lg: 8 }} order={{ xs: 2, md: 1 }}>
          {renderContent()}
        </Grid>
      </Grid>
    </Container>
  );
}
