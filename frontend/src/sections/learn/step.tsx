import type { IStepProps } from "src/types/step";

import React from "react";
import { m } from "framer-motion";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import { Divider, Skeleton, Typography } from "@mui/material";

import { Label } from "src/components/label";
import { Markdown } from "src/components/markdown";

// ----------------------------------------------------------------------

type StepProps = {
  step: IStepProps;
  onSubmit: () => void;
  isLocked?: boolean;
};

// ----------------------------------------------------------------------

export const Step = React.memo(function Step({ step, onSubmit, isLocked = false }: StepProps) {
  const { t } = useTranslation("learn");

  const renderHeader = () => (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="h4">{step.name}</Typography>
        <Label color="warning">{step.totalPoints} XP</Label>
      </Box>
      <Typography variant="subtitle2" color="text.secondary">
        ⏱ {t("estimatedTime")}: {step.duration} min
      </Typography>
    </Box>
  );

  const renderContent = () => (
    <m.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ overflowY: "auto", height: "100%" }}
    >
      {isLocked ? (
        <>
          {Array.from({ length: 50 }).map((_, i) => (
            <Skeleton key={i} variant="text" sx={{ borderRadius: 2, width: 1, height: 0.1 }} />
          ))}
        </>
      ) : (
        <Markdown key={step.text} content={step.text} />
      )}
    </m.div>
  );

  return (
    <>
      {renderHeader()}
      <Divider />
      {renderContent()}
    </>
  );
});
