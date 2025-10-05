import type { PlanType } from "src/types/plan";

import { useTranslation } from "react-i18next";

import { Box, Link } from "@mui/material";

import { paths } from "src/routes/paths";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { Iconify } from "src/components/iconify";

// ----------------------------------------------------------------------
type AvailabilityMarkProps = {
  plans: PlanType[];
};

export function AvailabilityMark({ plans }: AvailabilityMarkProps) {
  const { t } = useTranslation("project");
  const localize = useLocalizedPath();

  const renderPlans = () => {
    const plansTranslated = plans.map((plan, index) => (
      <Link key={plan} href={localize(paths.pricing)} color="text.primary" underline="always">
        {t(`included.plans.${plan}`)}
      </Link>
    ));

    if (plansTranslated.length === 1) return plansTranslated[0];
    if (plansTranslated.length === 2) {
      return (
        <>
          {plansTranslated[0]} {t("included.and")} {plansTranslated[1]}
        </>
      );
    }

    return (
      <>
        {plansTranslated.slice(0, -1).map((plan, idx) => (
          <Box component="span" key={idx}>
            {plan}
            {", "}
          </Box>
        ))}
        {t("included.and")} {plansTranslated[plansTranslated.length - 1]}
      </>
    );
  };

  return (
    <Box sx={{ gap: 0.5, display: "flex", alignItems: "center", typography: "caption" }}>
      <Iconify icon="carbon:checkmark-filled" sx={{ color: "success.main" }} />
      {t("included.start")} {renderPlans()}
    </Box>
  );
}
