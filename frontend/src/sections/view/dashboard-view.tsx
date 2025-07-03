"use client";

import Grid from "@mui/material/Grid2";
import { Box, Container } from "@mui/material";

import { useDashboard } from "src/api/me/dashboard";

import { ProfileSummary } from "../dashboard/profile-summary";
import { CoursesProgress } from "../dashboard/courses-progress";
import { CertificatesProgress } from "../dashboard/certificates-progress";

// ----------------------------------------------------------------------

export function DashboardView() {
  const { data: dashboard } = useDashboard();

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
        <CoursesProgress courses={dashboard?.courses || []} />

        <CertificatesProgress certificates={dashboard?.certificates || []} />
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
        totalPoints={dashboard?.totalPoints || 0}
        dailyStreak={dashboard?.dailyStreak || 0}
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
