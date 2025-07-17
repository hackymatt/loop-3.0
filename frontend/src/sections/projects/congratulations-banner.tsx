import type { DialogProps } from "@mui/material/Dialog";

import Confetti from "react-confetti";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";

import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import { Box, DialogActions } from "@mui/material";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";

import { useFormErrorHandler } from "src/hooks/use-form-error-handler";

import { useReviewSubmit } from "src/api/review/submit";

import { useUserContext } from "src/components/user";
import { Form, Field } from "src/components/hook-form";

import { useReviewSchema } from "./review-new-form";

import type { ReviewSchemaType } from "./review-new-form";

// ----------------------------------------------------------------------

type Props = DialogProps & {
  slug: string;
  onClose: () => void;
};

export function CongratulationsBanner({ slug, onClose, ...other }: Props) {
  const { t } = useTranslation("review");

  const user = useUserContext();
  const { firstName } = user.state;

  const { mutateAsync: submitReview } = useReviewSubmit();

  const ReviewSchema = useReviewSchema();

  const defaultValues: ReviewSchemaType = { rating: 0, comment: "" };

  const methods = useForm<ReviewSchemaType>({ resolver: zodResolver(ReviewSchema), defaultValues });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const handleFormError = useFormErrorHandler(methods);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await submitReview({ ...data, slug });
      onClose();
    } catch (error) {
      handleFormError(error);
    }
  });

  return (
    <Dialog
      disableEscapeKeyDown
      fullWidth
      maxWidth="sm"
      scroll="body"
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          background: "#f9f9fb",
        },
      }}
      {...other}
    >
      <Confetti numberOfPieces={200} recycle={false} />
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle
          sx={{
            px: 4,
            pt: 4,
            pb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h4" component="h2">
              🎉 {t("congratulations.label")}, {firstName}!
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent
          sx={{
            py: 0,
            gap: 2.5,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="subtitle1">{t("congratulations.text")}</Typography>

          <div>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t("rating.label")}:
            </Typography>
            <Field.Rating name="rating" />
          </div>

          <Field.Text multiline rows={3} name="comment" label={t("review.label")} />
        </DialogContent>

        <DialogActions>
          <LoadingButton color="inherit" type="submit" variant="contained" loading={isSubmitting}>
            {t("submit")}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
