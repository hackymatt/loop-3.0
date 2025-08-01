import type { IStepProps } from "src/types/step";
import type { Language } from "src/locales/types";

import React from "react";
import { m } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useBoolean } from "minimal-shared/hooks";

import Box from "@mui/material/Box";
import { Fab, Paper, Divider, Skeleton, Typography } from "@mui/material";

import { URLS } from "src/api/urls";
import { CONFIG } from "src/global-config";

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
  const chatBoxOpen = useBoolean();

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

  const renderChat = () => (
    <>
      <Fab
        color="primary"
        variant="extended"
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1500,
          boxShadow: 6,
        }}
        onClick={() => chatBoxOpen.onToggle()}
      >
        <Iconify icon="simple-icons:openai" sx={{ color: "white" }} />
        {chatBoxOpen.value ? t("chat.hide") : t("chat.show")}
      </Fab>

      {chatBoxOpen.value && (
        <Paper
          elevation={6}
          sx={{
            position: "fixed",
            bottom: 100,
            right: 24,
            width: { xs: "90%", sm: 400 },
            height: 400,
            zIndex: 1400,
            overflow: "hidden",
          }}
        >
          <Chat
            language={locale}
            url={`${CONFIG.api}${URLS.STEP_CHAT}/${step.slug}`}
            placeholder={t("chat.placeholder")}
            history={[{ text: t("chat.welcome"), role: "ai" }]}
          />
        </Paper>
      )}
    </>
  );

  return (
    <>
      {renderHeader()}
      <Divider />
      {renderContent()}
      {renderChat()}
    </>
  );
});
