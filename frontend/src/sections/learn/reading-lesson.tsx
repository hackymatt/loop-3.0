import type { IReadingLessonProps } from "src/types/lesson";

import React from "react";
import { m } from "framer-motion";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import { Button, Divider, Skeleton, Typography } from "@mui/material";

import { Label } from "src/components/label";
import { Iconify } from "src/components/iconify";
import { Markdown } from "src/components/markdown";

// ----------------------------------------------------------------------

type ReadingLessonProps = {
  lesson: IReadingLessonProps;
  onSubmit: () => void;
  isLocked?: boolean;
};

// ----------------------------------------------------------------------

export const ReadingLesson = React.memo(function ReadingLesson({
  lesson,
  onSubmit,
  isLocked = false,
}: ReadingLessonProps) {
  const { t } = useTranslation("learn");

  const renderHeader = () => (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="h4">{lesson.name}</Typography>
        <Label color="warning">{lesson.totalPoints} XP</Label>
      </Box>
      <Typography variant="subtitle2" color="text.secondary">
        ⏱ {t("reading.estimatedTime")}: {lesson.duration} min
      </Typography>
    </Box>
  );

  const renderContent = () => (
    <m.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ overflowY: "auto", height: "100%" }}
    >
      {isLocked ? (
        <>
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} variant="text" sx={{ borderRadius: 2, width: 1, height: 0.1 }} />
          ))}
        </>
      ) : (
        <Markdown key={lesson.text} content={lesson.text} />
      )}
    </m.div>
  );

  const renderSubmitButton = () => (
    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
      <Button
        variant="contained"
        color="primary"
        size="large"
        startIcon={<Iconify icon="solar:check-circle-bold" />}
        onClick={onSubmit}
        disabled={isLocked}
        sx={(theme) => ({
          px: 3,
          borderRadius: 2,
          textTransform: "none",
          fontWeight: "medium",
          boxShadow: theme.shadows[2],
        })}
      >
        {t("reading.submit")}
      </Button>
    </Box>
  );

  return (
    <>
      {renderHeader()}
      <Divider />
      {renderContent()}
      <Divider sx={{ mt: "auto" }} />
      {renderSubmitButton()}
    </>
  );
});
