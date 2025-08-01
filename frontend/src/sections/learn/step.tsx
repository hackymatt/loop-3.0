import type { IStepProps } from "src/types/step";
import type { Language } from "src/locales/types";

import React from "react";
import { m } from "framer-motion";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import { Divider, Skeleton, Typography } from "@mui/material";

import { Label } from "src/components/label";
import { Iconify } from "src/components/iconify";
import { Markdown } from "src/components/markdown";

import { Chat } from "./chat";

// ----------------------------------------------------------------------

type StepProps = {
  step: IStepProps;
  locale: Language;
  isLocked?: boolean;
};

// ----------------------------------------------------------------------

export const Step = React.memo(function Step({ step, locale, isLocked = false }: StepProps) {
  const { t } = useTranslation("learn");

  const renderHeader = () => (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="h4">{step.name}</Typography>
        <Label color="warning">{step.totalPoints} XP</Label>
      </Box>
      <Typography
        variant="subtitle2"
        color="text.secondary"
        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
      >
        <Iconify icon="solar:clock-circle-outline" /> {t("estimatedTime")}: {step.duration} min
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
      <Box height="300px">
        <Chat
          language={locale}
          url={`http://localhost:8000/api/step/chat/${step.slug}`}
          placeholder={t("chat.placeholder")}
          history={[{ text: t("chat.welcome"), role: "ai" }]}
        />
      </Box>
    </>
  );
});
