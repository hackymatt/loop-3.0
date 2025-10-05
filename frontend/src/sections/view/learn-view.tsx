"use client";

import type { ReactNode } from "react";
import type { BoxProps } from "@mui/material";
import type { IStepProps } from "src/types/step";
import type { Language } from "src/locales/types";
import type { IProjectProps } from "src/types/project";

import { useMemo, useCallback } from "react";

import { Box, Container } from "@mui/material";

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { CustomBreadcrumbs } from "src/components/custom-breadcrumbs";

import { Step } from "../learn/step";
import { UpgradeBanner } from "../learn/upgrade-banner";
import { ArrowBasicButtons } from "../learn/arrow-buttons/arrow-buttons";

interface LearnViewProps {
  data: { project: IProjectProps; step: IStepProps; isLocked: boolean };
  locale: Language;
  projectSlug: string;
  stageSlug: string;
  stepSlug: string;
}

const ContentBox = ({ children, sx }: { children: ReactNode; sx?: BoxProps["sx"] }) => (
  <Box
    component="section"
    sx={[
      {
        px: { xs: 2, md: 4 },
        py: { xs: 2, md: 3 },
        bgcolor: "background.paper",
        borderRadius: 3,
        boxShadow: 3,
        display: "flex",
        flexDirection: "column",
        gap: 3,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Box>
);

export function LearnView({ data, locale, projectSlug, stageSlug, stepSlug }: LearnViewProps) {
  const localize = useLocalizedPath();
  const router = useRouter();

  const { project, step, isLocked } = data;

  const allSteps = useMemo(
    () => project?.stages.flatMap((stage) => stage.steps) ?? [],
    [project?.stages]
  );
  const currentStepIndex = useMemo(
    () => allSteps.findIndex((s) => s.slug === stepSlug),
    [allSteps, stepSlug]
  );
  const currentStage = useMemo(
    () => project?.stages.find((stage) => stage.slug === stageSlug),
    [stageSlug, project?.stages]
  );

  const navigateTo = useCallback(
    (index: number) => {
      const s = allSteps[index];
      const stage = project?.stages.find((ch) => ch.steps.some((l) => l.slug === s?.slug));
      router.push(
        localize(
          s && stage
            ? `${paths.learn}/${projectSlug}/${stage.slug}/${s.slug}`
            : `${paths.project}/${projectSlug}`
        )
      );
    },
    [allSteps, project?.stages, router, localize, projectSlug]
  );

  const Header = () => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 2,
        width: "100%",
      }}
    >
      <CustomBreadcrumbs
        links={[
          { name: project?.name, href: localize(`${paths.project}/${projectSlug}`) },
          { name: currentStage?.name },
          { name: step?.name },
        ]}
      />
      <ArrowBasicButtons
        disablePrev={currentStepIndex <= 0}
        disableNext={false}
        onClickPrev={() => navigateTo(currentStepIndex - 1)}
        onClickNext={() => navigateTo(currentStepIndex + 1)}
      />
    </Box>
  );

  const Content = () => (
    <ContentBox sx={{ position: "relative" }}>
      <Step step={step} isLocked={isLocked} locale={locale} />
    </ContentBox>
  );

  return (
    <Box
      component="section"
      sx={{ pb: { xs: 5, md: 10 }, textAlign: { xs: "center", md: "left" } }}
    >
      <Container>
        <Header />
        <Content />
      </Container>

      {isLocked && <UpgradeBanner slug={projectSlug} type="project" open />}
    </Box>
  );
}
