import type { IStepProps } from "src/types/step";
import type { Language } from "src/locales/types";

import { useTranslation } from "react-i18next";
import { useBoolean } from "minimal-shared/hooks";
import React, { useState, useCallback } from "react";

import Box from "@mui/material/Box";
import { Fab, Paper, Divider, Skeleton, Typography } from "@mui/material";

import { URLS } from "src/api/urls";
import { CONFIG } from "src/global-config";

import { Label } from "src/components/label";
import { Iconify } from "src/components/iconify";
import { Markdown } from "src/components/markdown";

import { Chat } from "./chat";

import type { ChatMessage } from "./chat";

// ----------------------------------------------------------------------

type StepProps = {
  step: IStepProps;
  isLocked?: boolean;
  locale: Language;
};

// ----------------------------------------------------------------------

export const Step = React.memo(function Step({ step, isLocked = false, locale }: StepProps) {
  const { t } = useTranslation("learn");
  const chatBoxOpen = useBoolean();

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { text: t("chat.welcome"), role: "ai" },
  ]);
  const handleHistoryUpdate = useCallback((newMessage: ChatMessage) => {
    setChatHistory((prev) => [...prev, newMessage]);
  }, []);

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

  const renderContent = () =>
    isLocked ? (
      <>
        {Array.from({ length: 50 }).map((_, i) => (
          <Skeleton key={i} variant="text" sx={{ borderRadius: 2, width: 1, height: 0.1 }} />
        ))}
      </>
    ) : (
      <Markdown key={step.text} content={step.text} />
    );

  const renderChatBox = () =>
    chatBoxOpen.value && (
      <Paper
        elevation={6}
        sx={{
          position: "fixed",
          bottom: 80,
          right: 16,
          width: { xs: 0.9, sm: 400 },
          height: 0.75,
          zIndex: 1400,
          overflow: "hidden",
        }}
      >
        <Chat
          language={locale}
          url={`${CONFIG.api}${URLS.STEP_CHAT}/${step.slug}`}
          placeholder={t("chat.placeholder")}
          history={chatHistory}
          onMessage={handleHistoryUpdate}
          errorMessage={t("chat.errorMessage")}
        />
      </Paper>
    );

  const renderChat = () => (
    <>
      <Fab
        color="primary"
        variant="extended"
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 1500,
          boxShadow: 6,
        }}
        onClick={chatBoxOpen.onToggle}
      >
        <Iconify icon="simple-icons:openai" sx={{ color: "white", mr: 1 }} />
        {chatBoxOpen.value ? t("chat.hide") : t("chat.show")}
      </Fab>

      {renderChatBox()}
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
