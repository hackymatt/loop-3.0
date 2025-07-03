import type { CardProps } from "@mui/material/Card";
import type { ICourseProps } from "src/types/course";

import { useTranslation } from "react-i18next";

import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import { Box, Link } from "@mui/material";
import Typography from "@mui/material/Typography";

import { paths } from "src/routes/paths";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { useAnalytics } from "src/app/analytics-provider";

import { Iconify } from "src/components/iconify";
import { useUserContext } from "src/components/user";

import { Certificate } from "../certificates";
import { findNextLesson } from "./find-next-lesson";

// ----------------------------------------------------------------------

type Props = CardProps & Pick<ICourseProps, "slug" | "name" | "chapters" | "progress">;
export function CourseCertificateDetailsInfo({
  sx,
  slug,
  name,
  chapters,
  progress,
  ...other
}: Props) {
  const { t } = useTranslation("course");
  const { t: certificate } = useTranslation("certificate");
  const localize = useLocalizedPath();

  const { trackEvent } = useAnalytics();

  const user = useUserContext();
  const { isLoggedIn, firstName, lastName } = user.state;

  const started = (progress || 0) > 0;
  const completed = (progress || 0) === 100;
  const next = findNextLesson(chapters);
  const redirect = localize(
    `${paths.learn}/${slug}/${next.chapter?.slug || chapters[0].slug}/${next.lesson?.slug || chapters[0].lessons[0].slug}`
  );

  return (
    <Card
      sx={[
        { p: 3, gap: 2, borderRadius: 2, display: "flex", flexDirection: "column" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Typography component="h6" variant="h6">
        {t("certificate.title")}
      </Typography>

      <Certificate
        courseName={name}
        studentName={isLoggedIn ? `${firstName} ${lastName}` : certificate("name")}
        sx={{ height: 220 }}
      />

      <Typography variant="body2">{t("certificate.subtitle")}</Typography>

      <Box sx={{ gap: 1, display: "flex", alignItems: "center" }}>
        <Iconify icon="carbon:checkmark-filled" sx={{ color: "success.main" }} />
        <Typography variant="caption">
          {t("included.start")}{" "}
          <Link href={localize(paths.pricing)} color="text.primary" underline="always">
            {t("included.plans")}
          </Link>
        </Typography>
      </Box>

      {!completed ? (
        <Button
          variant="contained"
          color="primary"
          size="large"
          href={isLoggedIn ? redirect : localize(paths.register)}
          onClick={() => {
            if (!isLoggedIn) {
              user.setField("redirect", redirect);
            }
            trackEvent({ category: "course", label: `course (${slug})`, action: "certificate" });
          }}
          sx={{ px: 2, borderRadius: "inherit", textAlign: "center" }}
        >
          {isLoggedIn && started ? t("continue") : t("start")}
        </Button>
      ) : null}
    </Card>
  );
}
