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

// ----------------------------------------------------------------------

type Props = CardProps & Pick<ICourseProps, "slug" | "chatUrl">;
export function CourseChatDetailsInfo({ sx, slug, chatUrl, ...other }: Props) {
  const { t } = useTranslation("course");
  const localize = useLocalizedPath();

  const { trackEvent } = useAnalytics();

  const user = useUserContext();
  const { isLoggedIn } = user.state;

  return (
    <Card
      sx={[
        { p: 3, gap: 2, borderRadius: 2, display: "flex", flexDirection: "column" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Typography component="h6" variant="h6">
        {t("chat.title")}
      </Typography>

      <Typography variant="body2">{t("chat.subtitle")}</Typography>

      <Box sx={{ gap: 1, display: "flex", alignItems: "center" }}>
        <Iconify icon="carbon:checkmark-filled" sx={{ color: "success.main" }} />
        <Typography variant="caption">
          {t("included.start")}{" "}
          <Link href={localize(paths.pricing)} color="text.primary" underline="always">
            {t("included.plans")}
          </Link>
        </Typography>
      </Box>

      {!isLoggedIn ? (
        <Button
          variant="contained"
          size="large"
          startIcon={<Iconify icon="logos:google-icon" />}
          href={localize(paths.register)}
          onClick={() => {
            user.setField("redirect", localize(`${paths.course}/${slug}`));
            trackEvent({ category: "course", label: `course (${slug})`, action: "chat" });
          }}
          sx={{ px: 2, borderRadius: "inherit", textAlign: "center" }}
        >
          {t("chat.button")}
        </Button>
      ) : chatUrl ? (
        <Button
          variant="contained"
          size="large"
          startIcon={<Iconify icon="logos:google-icon" />}
          href={chatUrl}
          sx={{ px: 2, borderRadius: "inherit", textAlign: "center" }}
        >
          {t("chat.button")}
        </Button>
      ) : null}
    </Card>
  );
}
