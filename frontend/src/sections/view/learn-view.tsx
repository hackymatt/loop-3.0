"use client";

import type { ReactNode } from "react";
import type { AxiosError } from "axios";
import type { BoxProps } from "@mui/material";
import type { ISubstepProps } from "src/types/substep";

import React, { useMemo, useCallback } from "react";

import { Box, Container } from "@mui/material";

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { useProject } from "src/api/project/project";
import { useSubstep } from "src/api/project/substep/substep";
import { useSubstepSubmit } from "src/api/project/substep/submit";

import { SplashScreen } from "src/components/loading-screen";
import { CustomBreadcrumbs } from "src/components/custom-breadcrumbs";

import { Substep } from "../learn/substep";
import { NotFoundView } from "../error/not-found-view";
import { UpgradeBanner } from "../learn/upgrade-banner";
import { ArrowBasicButtons } from "../learn/arrow-buttons/arrow-buttons";

interface LearnViewProps {
  projectSlug: string;
  stepSlug: string;
  substepSlug: string;
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
        height: "80vh",
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Box>
);

export function LearnView({ projectSlug, stepSlug, substepSlug }: LearnViewProps) {
  const localize = useLocalizedPath();
  const router = useRouter();

  const {
    data: projectData,
    isLoading: isLoadingProject,
    isError: isErrorProject,
  } = useProject("pl", projectSlug);
  const {
    data: substepData,
    isLoading: isLoadingSubstep,
    isError: isErrorSubstep,
    error: substepError,
  } = useSubstep(projectSlug, stepSlug, substepSlug);

  const { mutateAsync: submit } = useSubstepSubmit();

  const isLoading = isLoadingProject || isLoadingSubstep;
  const isError = isErrorProject || isErrorSubstep;
  const isLocked = (substepError as AxiosError)?.status === 403;

  const allSubsteps = useMemo(
    () => projectData?.steps.flatMap((ch) => ch.substeps) ?? [],
    [projectData?.steps]
  );
  const currentSubstepIndex = useMemo(
    () => allSubsteps.findIndex((l) => l.slug === substepSlug),
    [allSubsteps, substepSlug]
  );
  const currentStep = useMemo(
    () => projectData?.steps.find((ch) => ch.slug === stepSlug),
    [stepSlug, projectData?.steps]
  );

  const navigateTo = useCallback(
    (index: number) => {
      const substep = allSubsteps[index];
      const step = projectData?.steps.find((ch) =>
        ch.substeps.some((l) => l.slug === substep?.slug)
      );
      router.push(
        localize(
          substep && step
            ? `${paths.learn}/${projectSlug}/${step.slug}/${substep.slug}`
            : `${paths.project}/${projectSlug}`
        )
      );
    },
    [allSubsteps, projectData?.steps, projectSlug, localize, router]
  );

  const handleSubmit = useCallback(
    async (data: { answer: string | boolean[] }) => {
      try {
        await submit({ ...data, substep: substepSlug });
        navigateTo(currentSubstepIndex + 1);
      } catch (err) {
        console.log(err);
      }
    },
    [currentSubstepIndex, substepSlug, navigateTo, submit]
  );

  if (isError && !isLocked) {
    return <NotFoundView />;
  }
  if (isLoading) return <SplashScreen />;

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
          { name: projectData?.name, href: localize(`${paths.project}/${projectSlug}`) },
          { name: currentStep?.name },
          { name: substepData?.name },
        ]}
      />
      <ArrowBasicButtons
        disablePrev={currentSubstepIndex <= 0}
        disableNext={currentSubstepIndex >= allSubsteps.length - 1}
        onClickPrev={() => navigateTo(currentSubstepIndex - 1)}
        onClickNext={() => navigateTo(currentSubstepIndex + 1)}
      />
    </Box>
  );

  const Content = () => (
    <ContentBox>
      <Substep
        substep={substepData as ISubstepProps}
        onSubmit={() => handleSubmit({ answer: "" })}
        isLocked={isLocked}
      />
    </ContentBox>
  );

  return (
    <Box
      component="section"
      sx={{ pb: { xs: 5, md: 10 }, textAlign: { xs: "center", md: "left" } }}
    >
      <Container maxWidth={false}>
        <Header />
        <Content />
      </Container>

      {isLocked && <UpgradeBanner slug={projectSlug} open />}
    </Box>
  );
}
