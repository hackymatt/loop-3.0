import type { ICourseProps, ICourseChapterProp } from "src/types/course";

import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Accordion from "@mui/material/Accordion";
import Typography from "@mui/material/Typography";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import { Link, Badge, Stack, Button, Divider, LinearProgress } from "@mui/material";

import { paths } from "src/routes/paths";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { useAnalytics } from "src/app/analytics-provider";

import { Iconify } from "src/components/iconify";
import { useUserContext } from "src/components/user";

import { findNextLesson } from "./find-next-lesson";
import { CourseDetailsLessonList } from "./course-details-lesson-list";

// ----------------------------------------------------------------------

type ChapterItemProps = {
  course: ICourseProps;
  chapter: ICourseChapterProp;
  index: number;
  expanded: boolean;
  onExpanded: (event: React.SyntheticEvent, isExpanded: boolean) => void;
};

export function CourseDetailsChapterItem({
  course,
  chapter,
  index,
  expanded,
  onExpanded,
}: ChapterItemProps) {
  const { t } = useTranslation("course");
  const localize = useLocalizedPath();

  const { trackEvent } = useAnalytics();

  const user = useUserContext();
  const { isLoggedIn } = user.state;

  const started = (chapter.progress || 0) > 0;
  const completed = (chapter.progress || 0) === 100;
  const next = findNextLesson([chapter]);
  const redirect = localize(
    `${paths.learn}/${course.slug}/${chapter.slug}/${next.lesson?.slug || chapter.lessons[0].slug}`
  );

  const renderButton = () => (
    <Button
      variant="contained"
      size="medium"
      color="primary"
      href={isLoggedIn ? redirect : localize(paths.register)}
      onClick={() => {
        if (!isLoggedIn) {
          user.setField("redirect", redirect);
        }
        trackEvent({ category: "chapter", label: `chapter (${chapter.slug})`, action: "start" });
      }}
      sx={{ px: 2, textAlign: "center" }}
    >
      {isLoggedIn && started ? t("chapters.continue") : t("chapters.start")}
    </Button>
  );

  const renderExpand = () => (
    <Link
      variant="subtitle2"
      color="inherit"
      sx={{
        gap: 1,
        display: "flex",
        cursor: "pointer",
        alignItems: "center",
        whiteSpace: "nowrap",
        minWidth: "max-content",
      }}
    >
      {expanded ? t("chapters.hide") : t("chapters.show")} {t("chapters.lesson")}
      <Iconify icon={expanded ? "solar:alt-arrow-up-outline" : "solar:alt-arrow-down-outline"} />
    </Link>
  );

  const renderSummary = () => (
    <AccordionSummary>
      <Stack spacing={2} flexGrow={1} divider={<Divider component="span" />}>
        <Box sx={{ display: "flex", alignItems: "center", width: 1 }}>
          <Badge color="primary" badgeContent={index} sx={{ ml: 1 }} />

          <Typography variant="subtitle1" sx={{ flexGrow: 1, ml: 2 }}>
            {chapter.name}
          </Typography>

          {chapter.progress ? (
            <>
              <LinearProgress
                color="primary"
                variant="determinate"
                value={chapter.progress}
                sx={{ flex: "1 1 auto", mr: 1 }}
              />
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {Math.round(chapter.progress)}%
              </Typography>
            </>
          ) : null}

          <Box sx={{ flexGrow: 1 }} />

          {!completed && renderButton()}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", width: 1, gap: 1 }}>
          <Typography variant="body2" sx={{ color: "text.secondary", flexGrow: 1 }}>
            {chapter.description}
          </Typography>

          {renderExpand()}
        </Box>
      </Stack>
    </AccordionSummary>
  );

  const renderDetails = () => (
    <AccordionDetails sx={{ typography: "body2" }}>
      <CourseDetailsLessonList course={course} chapter={chapter} />
    </AccordionDetails>
  );

  return (
    <Accordion
      expanded={expanded}
      onChange={onExpanded}
      sx={{ borderBottom: "1px solid transparent" }} // Makes divider invisible but keeps spacing
    >
      {renderSummary()}
      {renderDetails()}
    </Accordion>
  );
}
