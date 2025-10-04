import type { CardProps } from "@mui/material/Card";
import type { IProjectProps } from "src/types/project";

import { useTranslation } from "react-i18next";

import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { paths } from "src/routes/paths";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { PLAN_TYPE } from "src/consts/plan";
import { useAnalytics } from "src/app/analytics-provider";

import { Iconify } from "src/components/iconify";
import { useUserContext } from "src/components/user";
import { AvailabilityMark } from "src/components/availability-mark";

// ----------------------------------------------------------------------

type Props = CardProps & Pick<IProjectProps, "slug">;
export function ProjectConsultDetailsInfo({ sx, slug, ...other }: Props) {
  const { t } = useTranslation("project");
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
        {t("consult.title")}
      </Typography>

      <Typography variant="body2">{t("consult.subtitle")}</Typography>

      <AvailabilityMark plans={[PLAN_TYPE.PREMIUM]} />

      {!isLoggedIn ? (
        <Button
          variant="contained"
          size="large"
          startIcon={<Iconify icon="solar:call-chat-linear" />}
          href={localize(paths.auth.register)}
          onClick={() => {
            user.setField("redirect", localize(`${paths.project}/${slug}`));
            trackEvent({ category: "project", label: `project (${slug})`, action: "chat" });
          }}
          sx={{ px: 2, borderRadius: "inherit", textAlign: "center" }}
        >
          {t("consult.button")}
        </Button>
      ) : (
        <Button
          variant="contained"
          size="large"
          startIcon={<Iconify icon="solar:call-chat-linear" />}
          href={localize(`${paths.channel}/${slug}`)}
          sx={{ px: 2, borderRadius: "inherit", textAlign: "center" }}
        >
          {t("consult.button")}
        </Button>
      )}
    </Card>
  );
}
