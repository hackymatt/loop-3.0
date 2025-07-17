"use client";

import type { ReactNode } from "react";
import type { AxiosError } from "axios";
import type { BoxProps } from "@mui/material";
import type {
  IConfigProp,
  IQuizSubstepProps,
  IVideoSubstepProps,
  ICodingSubstepProps,
  IReadingSubstepProps,
} from "src/types/substep";

import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import React, { useMemo, useState, useCallback } from "react";

import { Box, Container } from "@mui/material";

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";

import { useWebSocket } from "src/hooks/use-websocket";
import { useLocalizedPath } from "src/hooks/use-localized-path";

import { CONFIG } from "src/global-config";
import { LESSON_TYPE } from "src/consts/substep";
import { useProject } from "src/api/project/project";
import { useSubstep } from "src/api/project/substep/substep";
import { useSubstepHint } from "src/api/project/substep/hint";
import { useAccessToken } from "src/api/auth/access-token";
import { useSubstepSubmit } from "src/api/project/substep/submit";
import { useSubstepAnswer } from "src/api/project/substep/answer";
import { useSubstepProgress } from "src/api/project/substep/progress";

import { SplashScreen } from "src/components/loading-screen";
import { CustomBreadcrumbs } from "src/components/custom-breadcrumbs";

import { QuizSubstep } from "../learn/quiz-substep";
import { VideoSubstep } from "../learn/video-substep";
import { CodingSubstep } from "../learn/coding-substep";
import { NotFoundView } from "../error/not-found-view";
import { ReadingSubstep } from "../learn/reading-substep";
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
  const { t } = useTranslation("learn");
  const localize = useLocalizedPath();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const {
    data: projectData,
    isLoading: isLoadingProject,
    isError: isErrorProject,
  } = useProject(projectSlug);
  const {
    data: substepData,
    isLoading: isLoadingSubstep,
    isError: isErrorSubstep,
    error: substepError,
  } = useSubstep(projectSlug, stepSlug, substepSlug);
  const { refetch: getToken } = useAccessToken(false);

  const { connect, disconnect, isRunning } = useWebSocket({
    wsBaseUrl: CONFIG.ws,
    getToken,
    onMessage: (data) => {
      setLogs((prev) => [...prev, data]);
    },
    onOpen: () => setLogs([t("coding.logs.open")]),
    onClose: () => setLogs((prev) => [...prev, t("coding.logs.close")]),
  });

  const { mutateAsync: saveProgress } = useSubstepProgress();
  const { mutateAsync: submit } = useSubstepSubmit();
  const { mutateAsync: showAnswer } = useSubstepAnswer();
  const { mutateAsync: showHint } = useSubstepHint();

  const [error, setError] = useState<string>();
  const [logs, setLogs] = useState<any[]>([]);

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
  const currentSubstepInfo = useMemo(
    () => allSubsteps[currentSubstepIndex],
    [allSubsteps, currentSubstepIndex]
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

  const handleSaveProgress = useCallback(
    async (data: { answer: string | boolean[] }) => {
      try {
        await saveProgress({ ...data, substep: substepSlug });
      } catch {
        enqueueSnackbar(t("errors.answer"), { variant: "error" });
      }
    },
    [enqueueSnackbar, substepSlug, saveProgress, t]
  );

  const handleSubmit = useCallback(
    async (data: { answer: string | boolean[] }) => {
      try {
        await submit({ ...data, substep: substepSlug });
        navigateTo(currentSubstepIndex + 1);
      } catch (err) {
        setError(((err as AxiosError).response?.data as { answer: string })?.answer);
        setLogs(((err as AxiosError).response?.data as { answer: string })?.answer[0].split("\n"));
      }
    },
    [currentSubstepIndex, substepSlug, navigateTo, submit]
  );

  const handleShowAnswer = useCallback(async () => {
    try {
      await showAnswer({ substep: substepSlug });
    } catch {
      enqueueSnackbar(t("errors.answer"), { variant: "error" });
    }
  }, [enqueueSnackbar, substepSlug, showAnswer, t]);

  const handleShowHint = useCallback(async () => {
    try {
      await showHint({ substep: substepSlug });
    } catch {
      enqueueSnackbar(t("errors.hint"), { variant: "error" });
    }
  }, [enqueueSnackbar, substepSlug, showHint, t]);

  const handleRunCode = useCallback(
    async (config: IConfigProp) => {
      if (isRunning) {
        disconnect();
        return;
      }
      await connect(config);
    },
    [connect, disconnect, isRunning]
  );

  if (isError && !isLocked) {
    return <NotFoundView />;
  }
  if (isLoading) return <SplashScreen />;

  const substepType = currentSubstepInfo?.type ?? LESSON_TYPE.READING;

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

  const Content = () => {
    switch (substepType) {
      case LESSON_TYPE.READING:
        return (
          <ContentBox>
            <ReadingSubstep
              substep={substepData as IReadingSubstepProps}
              onSubmit={() => handleSubmit({ answer: "" })}
              isLocked={isLocked}
            />
          </ContentBox>
        );
      case LESSON_TYPE.VIDEO:
        return (
          <ContentBox>
            <VideoSubstep
              substep={substepData as IVideoSubstepProps}
              onSubmit={() => handleSubmit({ answer: "" })}
              isLocked={isLocked}
            />
          </ContentBox>
        );
      case LESSON_TYPE.QUIZ:
        return (
          <ContentBox>
            <QuizSubstep
              substep={substepData as IQuizSubstepProps}
              onSubmit={(answer: boolean[]) => handleSubmit({ answer })}
              onShowAnswer={handleShowAnswer}
              onSaveProgress={(answer: boolean[]) => handleSaveProgress({ answer })}
              error={error}
              isLocked={isLocked}
            />
          </ContentBox>
        );
      case LESSON_TYPE.CODING:
        return (
          <ContentBox sx={{ borderRadius: 0, px: { xs: 0, md: 0 }, py: { xs: 0, md: 0 } }}>
            <CodingSubstep
              substep={substepData as ICodingSubstepProps}
              onRunCode={(config) => handleRunCode(config)}
              onSubmit={(answer: string) => handleSubmit({ answer })}
              onHint={handleShowHint}
              onShowAnswer={handleShowAnswer}
              onSaveProgress={(answer: string) => handleSaveProgress({ answer })}
              logs={logs}
              isRunning={isRunning}
              isLocked={isLocked}
            />
          </ContentBox>
        );
      default:
        return null;
    }
  };

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
