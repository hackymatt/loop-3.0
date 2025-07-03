import type { IVideoLessonProps } from "src/types/lesson";

import React from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import { Button, Divider, Skeleton, Typography } from "@mui/material";

import { Label } from "src/components/label";
import { Player } from "src/components/player";
import { Iconify } from "src/components/iconify";

// ----------------------------------------------------------------------

type VideoLessonProps = { lesson: IVideoLessonProps; onSubmit: () => void; isLocked?: boolean };

// ----------------------------------------------------------------------

export const VideoLesson = React.memo(function VideoLesson({
  lesson,
  onSubmit,
  isLocked = false,
}: VideoLessonProps) {
  const { t } = useTranslation("learn");

  const renderHeader = () => (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="h4">{lesson.name}</Typography>
        <Label color="warning">{lesson.totalPoints} XP</Label>
      </Box>
    </Box>
  );

  const renderContent = () => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflowY: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          justifyContent: "center",
          width: { xs: 1, md: 0.75 },
          height: { xs: 320, md: 480 },
        }}
      >
        {isLocked ? (
          <Skeleton variant="rectangular" sx={{ borderRadius: 2, width: 1, height: 1 }} />
        ) : (
          <Player controls url={lesson.videoUrl} width="100%" height="100%" />
        )}
      </Box>
    </Box>
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
        {t("video.submit")}
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
