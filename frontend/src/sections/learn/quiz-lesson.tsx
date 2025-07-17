import type { IQuizSubstepProps } from "src/types/substep";

import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";

import {
  Box,
  Radio,
  Button,
  Divider,
  Checkbox,
  Skeleton,
  FormGroup,
  FormLabel,
  RadioGroup,
  Typography,
  FormControl,
  FormControlLabel,
} from "@mui/material";

import { QUIZ_TYPE } from "src/consts/substep";
import { useAnalytics } from "src/app/analytics-provider";

import { Label } from "src/components/label";

// ----------------------------------------------------------------------

type QuizSubstepProps = {
  substep: IQuizSubstepProps;
  onSubmit: (answer: boolean[]) => void;
  onShowAnswer: () => void;
  onSaveProgress: (answer: boolean[]) => void;
  error?: string;
  isLocked?: boolean;
};

// ----------------------------------------------------------------------

export const QuizSubstep = React.memo(function QuizSubstep({
  substep,
  onSubmit,
  onShowAnswer,
  onSaveProgress,
  error,
  isLocked = false,
}: QuizSubstepProps) {
  const { t } = useTranslation("learn");
  const { trackEvent } = useAnalytics();

  const isMultiple = substep.quizType === QUIZ_TYPE.MULTI;

  // Form state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

  useEffect(() => {
    const userOption = (substep.answer || [])
      .map((value, index) => (value ? index : -1))
      .filter((index) => index !== -1);

    setSelectedOption(userOption.length === 0 ? null : userOption[0]);
    setSelectedOptions(userOption);
  }, [substep.answer]);

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(Number(event.target.value));
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const index = Number(event.target.value);
    const checked = event.target.checked;

    setSelectedOptions((prev) => (checked ? [...prev, index] : prev.filter((v) => v !== index)));
  };

  const handleSubmit = () => {
    const answer = substep.question.options.map((_, index) =>
      isMultiple ? selectedOptions.includes(index) : selectedOption === index
    );
    onSaveProgress(answer);
    onSubmit(answer);
  };

  const renderOptions = () =>
    isMultiple ? (
      <FormGroup sx={{ width: 1, height: 1 }}>
        {substep.question.options.map((option, index) =>
          isLocked ? (
            <Skeleton
              key={index}
              variant="text"
              sx={{ width: 1, height: 0.1, borderRadius: 1, mb: 1 }}
            />
          ) : (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  value={index}
                  checked={selectedOptions.includes(index)}
                  onChange={handleCheckboxChange}
                />
              }
              label={option.text}
            />
          )
        )}
      </FormGroup>
    ) : (
      <RadioGroup
        value={selectedOption !== null ? selectedOption.toString() : ""}
        onChange={handleRadioChange}
        sx={{ width: 1, height: 1 }}
      >
        {(substep.question?.options || Array.from({ length: 5 })).map((option, index) =>
          isLocked ? (
            <Skeleton
              key={index}
              variant="text"
              sx={{ width: 1, height: 0.1, borderRadius: 1, mb: 1 }}
            />
          ) : (
            <FormControlLabel key={index} value={index} control={<Radio />} label={option.text} />
          )
        )}
      </RadioGroup>
    );

  const renderHeader = () => (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="h4">{substep.name}</Typography>
        <Label color="warning">{substep.totalPoints} XP</Label>
      </Box>
      <Typography variant="subtitle2" color="text.secondary">
        🧠 {t("quiz.type.label")}: {isMultiple ? t("quiz.type.multi") : t("quiz.type.single")}
      </Typography>
    </Box>
  );

  const renderContent = () => (
    <Box sx={{ py: 2, width: 1, height: 1 }}>
      <FormControl sx={{ width: 1, height: 1 }}>
        {isLocked ? (
          <Skeleton variant="text" sx={{ width: 1, height: 0.1, borderRadius: 2 }} />
        ) : (
          <FormLabel
            sx={{
              fontSize: "1.25rem",
              fontWeight: "bold",
              color: "primary.main",
              mb: 2,
            }}
          >
            {substep.question.text}
          </FormLabel>
        )}
        {renderOptions()}
      </FormControl>
      {error && (
        <Typography variant="body2" color="error" sx={{ width: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );

  const renderSubmitButton = () => (
    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={handleSubmit}
        disabled={isLocked || isMultiple ? selectedOptions.length === 0 : selectedOption === null}
        sx={{ px: 2 }}
      >
        {t("quiz.submit")}
      </Button>
    </Box>
  );

  const renderAnswerButton = () => (
    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
      <Button
        variant="text"
        color="inherit"
        size="large"
        onClick={() => {
          onShowAnswer();
          trackEvent({ category: "learn", label: "quiz", action: "showAnswer" });
        }}
        disabled={isLocked}
        sx={{ px: 2 }}
      >
        {t("quiz.answer")}
      </Button>
    </Box>
  );

  const renderButtons = () => (
    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
      {renderAnswerButton()}
      {renderSubmitButton()}
    </Box>
  );

  return (
    <>
      {renderHeader()}
      <Divider />
      {renderContent()}
      <Divider sx={{ mt: "auto" }} />
      {renderButtons()}
    </>
  );
});
