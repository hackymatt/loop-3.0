import type { ICourseProps, ICourseChapterProp } from "src/types/course";

import { Box } from "@mui/material";

import { CourseDetailsLessonItem } from "./course-details-lesson-item";

// ----------------------------------------------------------------------

type Props = {
  course: ICourseProps;
  chapter: ICourseChapterProp;
};

export function CourseDetailsLessonList({ course, chapter }: Props) {
  return (
    <div>
      <Box sx={{ gap: 1, display: "flex", flexDirection: "column" }}>
        {chapter.lessons.map((lesson) => (
          <CourseDetailsLessonItem
            key={lesson.slug}
            course={course}
            chapter={chapter}
            lesson={lesson}
          />
        ))}
      </Box>
    </div>
  );
}
