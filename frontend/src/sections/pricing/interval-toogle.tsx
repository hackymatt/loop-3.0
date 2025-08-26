import type { PlanInterval } from "src/types/plan";

import { useTranslation } from "react-i18next";

import { ToggleButton, ToggleButtonGroup } from "@mui/material";

import { PLAN_INTERVAL } from "src/consts/plan";

type IntervalToggleProps = {
  value: PlanInterval;
  onChange: (interval: PlanInterval) => void;
};

export default function IntervalToggle({ value, onChange }: IntervalToggleProps) {
  const { t } = useTranslation("pricing");

  const handleChange = (event: React.MouseEvent<HTMLElement>, newInterval: PlanInterval) => {
    onChange(newInterval);
  };

  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={handleChange}
      color="primary"
      size="small"
      sx={{
        borderRadius: "50px",
        "& .MuiToggleButton-root": {
          borderRadius: "50px",
          px: 2,
        },
      }}
    >
      {Object.values(PLAN_INTERVAL).map((v) => (
        <ToggleButton value={v}>{t(v)}</ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
