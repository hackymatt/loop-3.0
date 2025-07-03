import type { ICourseProps, ICourseLessonProp, ICourseChapterProp } from "src/types/course";

import { Box, Button, Typography } from "@mui/material";

import { paths } from "src/routes/paths";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { getLessonTypeIcon } from "src/utils/lesson-type-icon";

import { useAnalytics } from "src/app/analytics-provider";

import { Iconify } from "src/components/iconify";
import { useUserContext } from "src/components/user";

// ----------------------------------------------------------------------

type LessonItemProps = {
  course: ICourseProps;
  chapter: ICourseChapterProp;
  lesson: ICourseLessonProp;
};

export function CourseDetailsLessonItem({ course, chapter, lesson }: LessonItemProps) {
  const { trackEvent } = useAnalytics();
  const localize = useLocalizedPath();

  const user = useUserContext();
  const { isLoggedIn } = user.state;

  const completed = (lesson.progress || 0) === 100;
  const redirect = localize(`${paths.learn}/${course.slug}/${chapter.slug}/${lesson.slug}`);

  return (
    <Button
      variant="text"
      size="medium"
      color="inherit"
      href={isLoggedIn ? redirect : localize(paths.register)}
      onClick={() => {
        if (!isLoggedIn) {
          user.setField("redirect", redirect);
        }
        trackEvent({ category: "course", label: `lesson (${lesson.slug})`, action: "start" });
      }}
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        textAlign: "left",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Iconify icon={getLessonTypeIcon(lesson.type, completed)} />
        {lesson.name}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {completed && <Iconify icon="carbon:checkmark-filled" sx={{ color: "success.main" }} />}
        <Typography variant="body2">
          {completed ? lesson.earnedPoints : lesson.totalPoints} XP
        </Typography>
      </Box>
    </Button>
  );
}
