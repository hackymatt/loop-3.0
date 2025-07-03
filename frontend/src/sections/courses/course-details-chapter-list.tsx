import type { ICourseProps } from "src/types/course";

import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

import { Box, Card } from "@mui/material";
import Typography from "@mui/material/Typography";

import { CourseDetailsChapterItem } from "./course-details-chapter-item";

// ----------------------------------------------------------------------

type Props = {
  course: ICourseProps;
};

export function CourseDetailsChapterList({ course }: Props) {
  const { t } = useTranslation("course");

  const [expanded, setExpanded] = useState<string | false>(false);

  const handleExpandedChapter = useCallback(
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    },
    []
  );

  return (
    <div>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t("chapters.title")}
      </Typography>

      <Box sx={{ gap: 1, display: "flex", flexDirection: "column" }}>
        {course.chapters.map((chapter, index) => (
          <Card
            key={chapter.slug}
            sx={{ p: 3, gap: 2, borderRadius: 2, display: "flex", flexDirection: "column" }}
          >
            <CourseDetailsChapterItem
              key={chapter.slug}
              course={course}
              chapter={chapter}
              index={index + 1}
              expanded={expanded === chapter.slug}
              onExpanded={handleExpandedChapter(chapter.slug)}
            />
          </Card>
        ))}
      </Box>
    </div>
  );
}
