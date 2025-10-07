import type { Language } from "src/locales/types";
import type { CardProps } from "@mui/material/Card";
import type { IProjectProps } from "src/types/project";

import { useTranslation } from "react-i18next";
import { useBoolean } from "minimal-shared/hooks";

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

import { ProjectConsultNewForm } from "./project-consult-new-form";

// ----------------------------------------------------------------------

type Props = CardProps & Pick<IProjectProps, "slug"> & { language: Language };
export function ProjectConsultDetailsInfo({ slug, language, sx, ...other }: Props) {
  const { t } = useTranslation("project");
  const localize = useLocalizedPath();

  const { trackEvent } = useAnalytics();

  const user = useUserContext();
  const { isLoggedIn } = user.state;

  const openConsultForm = useBoolean();

  return (
    <>
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
            onClick={openConsultForm.onTrue}
            sx={{ px: 2, borderRadius: "inherit", textAlign: "center" }}
          >
            {t("consult.button")}
          </Button>
        )}
      </Card>

      <ProjectConsultNewForm
        slug={slug}
        language={language}
        open={openConsultForm.value}
        onClose={openConsultForm.onFalse}
      />
    </>
  );
}
