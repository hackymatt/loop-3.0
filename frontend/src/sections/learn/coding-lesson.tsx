import "./style.css";

import type { IConfigProp, ICodingFileProp, ICodingLessonProps } from "src/types/lesson";

import Split from "react-split";
import { useTranslation } from "react-i18next";
import { varAlpha } from "minimal-shared/utils";
import React, { useRef, useMemo, useState, useEffect, useCallback } from "react";

import Box from "@mui/material/Box";
import { Button, Skeleton, Typography, ButtonGroup } from "@mui/material";

import { Label } from "src/components/label";
import { Iconify } from "src/components/iconify";
import { Markdown } from "src/components/markdown";
import { CodeEditor } from "src/components/code-editor";

// ----------------------------------------------------------------------

type CodingLessonProps = {
  lesson: ICodingLessonProps;
  onRunCode: (config: IConfigProp) => void;
  onSubmit: (answer: string) => void;
  onHint: () => void;
  onShowAnswer: () => void;
  onSaveProgress: (answer: string) => void;
  logs?: any[];
  isLocked?: boolean;
  isRunning?: boolean;
};

type SectionProps = {
  title: string;
  icon: string;
  label?: React.ReactNode;
};

// ----------------------------------------------------------------------

function SectionHeader({ title, icon, label }: SectionProps) {
  return (
    <Box
      sx={(theme) => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        px: 2,
        py: 1,
        bgcolor: theme.vars.palette.background.neutral,
        width: 1,
        position: "sticky",
        top: 0,
        zIndex: 1,
      })}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Iconify icon={icon} width={18} height={18} />
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
      </Box>
      {label}
    </Box>
  );
}

// ----------------------------------------------------------------------

type ConsoleEntry =
  | string
  | {
      stdout?: string[];
      stderr?: string[];
    };

function Console({ entries }: { entries: ConsoleEntry[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [entries]);

  return (
    <Box
      ref={containerRef}
      sx={{
        fontFamily: "monospace",
        height: 1,
        p: 2,
        overflowY: "auto",
      }}
    >
      {entries.map((entry, index) => {
        if (typeof entry === "string") {
          return (
            <Typography key={index} color="text.secondary">
              {`> ${entry}`}
            </Typography>
          );
        }

        const stdoutLines = entry.stdout || [];
        const stderrLines = entry.stderr || [];

        return (
          <Box key={index}>
            {stdoutLines.map((line, i) => (
              <Typography key={`stdout-${index}-${i}`}>{line}</Typography>
            ))}
            {stderrLines.map((line, i) => (
              <Typography key={`stderr-${index}-${i}`} color="error">
                {line}
              </Typography>
            ))}
          </Box>
        );
      })}
    </Box>
  );
}

// ----------------------------------------------------------------------

export const CodingLesson = React.memo(function CodingLesson({
  lesson,
  onSubmit,
  onRunCode,
  onHint,
  onShowAnswer,
  onSaveProgress,
  logs = [],
  isRunning = false,
  isLocked = false,
}: CodingLessonProps) {
  const { t } = useTranslation("learn");

  const mobileTabs = [t("coding.context"), t("coding.exercise")];

  const [code, setCode] = useState<string>(lesson.file.code);
  const [mobileTab, setMobileTab] = useState(mobileTabs[0]);

  const allFiles = useMemo(() => [lesson.file, ...lesson.files], [lesson.file, lesson.files]);
  const [file, setFile] = useState<ICodingFileProp>(lesson.file);

  useEffect(() => {
    if (lesson.answer) setCode(lesson.answer);
  }, [lesson.answer]);

  const handleChangeCode = (value: string) => {
    if (file === lesson.file) {
      setCode(value);
    }
  };

  const handleRunCode = useCallback(() => {
    const { file: defaultFile, files, command, timeout, technology } = lesson;
    onSaveProgress(code);
    onRunCode({
      files: [...files, { ...defaultFile, code }],
      command,
      timeout,
      technology,
    });
  }, [code, lesson, onRunCode, onSaveProgress]);

  const handleSubmit = useCallback(() => {
    onSaveProgress(code);
    onSubmit(code);
  }, [code, onSaveProgress, onSubmit]);

  const handleHint = useCallback(() => {
    onSaveProgress(code);
    onHint();
  }, [code, onHint, onSaveProgress]);

  const handleRestore = useCallback(() => {
    onSaveProgress(file.code);
  }, [file.code, onSaveProgress]);

  const renderRestoreButton = useCallback(
    () => (
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="outlined" size="medium" onClick={handleRestore} disabled={isLocked}>
          <Iconify width={16} icon="solar:undo-left-bold" />
        </Button>
      </Box>
    ),
    [handleRestore, isLocked]
  );

  const renderRunCodeButton = useCallback(
    () => (
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="outlined"
          color={isRunning ? "error" : "secondary"}
          size="medium"
          startIcon={<Iconify width={16} icon={`solar:${isRunning ? "stop" : "play"}-outline`} />}
          onClick={handleRunCode}
          disabled={isLocked}
          sx={{ px: 2, whiteSpace: "nowrap" }}
        >
          {isRunning ? t("coding.editor.runCode.stop") : t("coding.editor.runCode.start")}
        </Button>
      </Box>
    ),
    [handleRunCode, isLocked, isRunning, t]
  );

  const renderSubmitButton = () => (
    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
      <Button
        variant="contained"
        color="primary"
        size="medium"
        onClick={handleSubmit}
        disabled={isLocked}
        sx={{ px: 2, whiteSpace: "nowrap" }}
      >
        {t("coding.editor.submit")}
      </Button>
    </Box>
  );

  const renderHintButton = () => (
    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
      <Button
        variant="outlined"
        color="inherit"
        size="medium"
        onClick={handleHint}
        disabled={isLocked}
        startIcon={<Iconify icon="solar:lightbulb-linear" />}
        sx={{ px: 2, whiteSpace: "nowrap" }}
      >
        {t("coding.hint.button")} (-{lesson.penaltyPoints} XP)
      </Button>
    </Box>
  );

  const renderShowAnswerButton = () => (
    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
      <Button
        variant="contained"
        color="primary"
        size="medium"
        onClick={onShowAnswer}
        disabled={isLocked}
        sx={{ px: 2, whiteSpace: "nowrap" }}
      >
        {t("coding.answer")} (-{lesson.totalPoints - lesson.penaltyPoints} XP)
      </Button>
    </Box>
  );

  const renderButtons = () => (
    <Box
      sx={{
        position: "absolute",
        bottom: 16,
        right: 16,
        display: "flex",
        gap: 1,
        zIndex: 2,
      }}
    >
      {renderRestoreButton()}
      {renderRunCodeButton()}
      {renderSubmitButton()}
    </Box>
  );

  const renderIntroduction = () => (
    <Box sx={{ bgcolor: "background.paper", overflowY: "auto" }}>
      <SectionHeader title={t("coding.introduction")} icon="solar:book-broken" />
      <Box sx={{ px: 2 }}>
        {isLocked ? (
          <>
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} variant="text" sx={{ borderRadius: 2, width: 1, height: 0.1 }} />
            ))}
          </>
        ) : (
          <Markdown key={lesson.introduction} content={lesson.introduction} />
        )}
      </Box>
    </Box>
  );

  const renderHint = () => (
    <Box
      sx={(theme) => ({
        bgcolor: theme.vars.palette.background.neutral,
        overflowY: "auto",
        pb: 2,
      })}
    >
      <SectionHeader title={t("coding.hint.label")} icon="solar:lightbulb-linear" />
      <Box sx={{ px: 2 }}>
        {isLocked ? (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="text" sx={{ borderRadius: 2, width: 1, height: 0.1 }} />
            ))}
          </>
        ) : (
          <Markdown key={lesson.hint} content={lesson.hint || ""} />
        )}

        {!lesson.answer && renderShowAnswerButton()}
      </Box>
    </Box>
  );

  const renderInstructions = () => (
    <Box sx={{ bgcolor: "background.paper", overflowY: "auto" }}>
      <SectionHeader
        title={t("coding.instructions")}
        icon="solar:checklist-bold"
        label={<Label color="warning">{lesson.totalPoints} XP</Label>}
      />
      <Box sx={{ px: 2 }}>
        {isLocked ? (
          <>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} variant="text" sx={{ borderRadius: 2, width: 1, height: 0.1 }} />
            ))}
          </>
        ) : (
          <Markdown key={lesson.instructions} content={lesson.instructions} />
        )}
        {!lesson.hint && renderHintButton()}
      </Box>
      {lesson.hint && renderHint()}
    </Box>
  );

  const renderEditor = () => (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <SectionHeader title={t("coding.editor.label")} icon="solar:code-2-bold" />

      <Box
        sx={{
          flexGrow: 1,
          position: "relative",
          height: 300,
        }}
      >
        {isLocked ? (
          <Skeleton variant="rectangular" sx={{ width: 1, height: 1 }} />
        ) : (
          <Box
            sx={{
              flexGrow: 1,
              position: "relative",
              height: 0.9,
            }}
          >
            <Box
              sx={{
                bgcolor: (theme) => theme.vars.palette.background.neutral,
                overflowX: "auto",
                "&::-webkit-scrollbar": { display: "none" },
                display: "flex",
                justifyContent: "flex-start",
              }}
            >
              <ButtonGroup
                disableElevation
                sx={(theme) => ({
                  display: "inline-flex",
                  justifyContent: "flex-start",
                  "& .MuiButton-root": {
                    borderRadius: 0,
                    boxShadow: "none",
                    py: 0.5,
                    px: 4,
                    textTransform: "none",
                    fontWeight: 500,
                    flex: "0 0 auto",
                  },
                  "& .MuiButton-outlined": {
                    bgcolor: varAlpha(theme.vars.palette.background.defaultChannel, 0.1),
                    border: "none",
                    color: theme.vars.palette.text.primary,
                    transition: theme.transitions.create("opacity", {
                      duration: theme.transitions.duration.shortest,
                    }),
                    "&:hover, &:focus": {
                      opacity: 0.7,
                      bgcolor: varAlpha(theme.vars.palette.background.defaultChannel, 0.1),
                      border: "none",
                      boxShadow: "none",
                    },
                  },
                  "& .MuiButton-contained": {
                    bgcolor: theme.vars.palette.background.paper,
                    color: theme.vars.palette.text.primary,
                    borderTop: `2px solid ${theme.vars.palette.primary.main}`,
                  },
                })}
              >
                {allFiles.map((f) => (
                  <Button
                    key={f.name}
                    variant={f === file ? "contained" : "outlined"}
                    onClick={() => setFile(f)}
                    startIcon={
                      f !== lesson.file && <Iconify icon="solar:lock-outline" width={16} />
                    }
                  >
                    {f.name}
                  </Button>
                ))}
              </ButtonGroup>
            </Box>

            <CodeEditor
              key={file.name}
              technology={lesson.technology}
              value={file === lesson.file ? code : file.code}
              onChange={handleChangeCode}
              readOnly={file !== lesson.file}
            />
          </Box>
        )}
      </Box>

      <Box sx={{ position: "absolute", bottom: 0, right: 0, display: "flex" }}>
        {renderButtons()}
      </Box>
    </Box>
  );

  const renderConsole = () => (
    <Box sx={{ height: 1, width: 1 }}>
      <SectionHeader title={t("coding.console")} icon="carbon:terminal" />
      <Box
        sx={{
          flexGrow: 1,
          position: "relative",
          height: { xs: 315, md: 250 },
        }}
      >
        {isLocked ? (
          <Skeleton variant="rectangular" sx={{ width: 1, height: 1 }} />
        ) : (
          <Console entries={logs} />
        )}
      </Box>
    </Box>
  );

  const renderLeft = () => (
    <Split
      direction="vertical"
      sizes={[60, 40]}
      minSize={200}
      gutterSize={5}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        overflow: "auto",
        textAlign: "left",
      }}
    >
      {renderIntroduction()}
      {renderInstructions()}
    </Split>
  );

  const renderRight = () => (
    <Split
      direction="vertical"
      sizes={[60, 40]}
      minSize={150}
      gutterSize={5}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        overflow: "auto",
      }}
    >
      {renderEditor()}
      {renderConsole()}
    </Split>
  );

  const renderContentDesktop = () => (
    <Split
      className="split"
      sizes={[40, 60]}
      minSize={200}
      gutterSize={5}
      style={{ height: "100%" }}
    >
      {renderLeft()}
      {renderRight()}
    </Split>
  );

  const renderContentMobile = () => (
    <>
      <ButtonGroup fullWidth sx={{ mb: 1 }}>
        {mobileTabs.map((mT) => (
          <Button
            key={mT}
            onClick={() => setMobileTab(mT)}
            variant={mobileTab === mT ? "contained" : "outlined"}
          >
            {mT}
          </Button>
        ))}
      </ButtonGroup>

      <Box sx={{ flexGrow: 1, minHeight: 0, overflow: "auto" }}>
        {mobileTab === mobileTabs[0] && renderLeft()}
        {mobileTab === mobileTabs[1] && renderRight()}
      </Box>
    </>
  );

  return (
    <>
      <Box sx={{ height: 1, display: { xs: "none", md: "block" } }}>{renderContentDesktop()}</Box>
      <Box
        sx={{
          height: 1,
          display: { xs: "flex", md: "none" },
          flexDirection: "column",
        }}
      >
        {renderContentMobile()}
      </Box>
    </>
  );
});
