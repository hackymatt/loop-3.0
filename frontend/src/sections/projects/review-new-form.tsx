import type { DialogProps } from "@mui/material/Dialog";

import { z as zod } from "zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

import { useFormErrorHandler } from "src/hooks/use-form-error-handler";

import { useReviewSubmit } from "src/api/review/submit";

import { Form, Field } from "src/components/hook-form";

// ----------------------------------------------------------------------

export type ReviewSchemaType = zod.infer<ReturnType<typeof useReviewSchema>>;

export const useReviewSchema = () => {
  const { t } = useTranslation("review");
  return zod.object({
    rating: zod.number().min(1, t("rating.errors.minRating")),
    comment: zod.string(),
  });
};

// ----------------------------------------------------------------------

type Props = DialogProps & {
  slug: string;
  onClose: () => void;
};

export function ReviewNewForm({ slug, onClose, ...other }: Props) {
  const { t } = useTranslation("review");

  const { mutateAsync: submitReview } = useReviewSubmit();

  const ReviewSchema = useReviewSchema();

  const defaultValues: ReviewSchemaType = { rating: 0, comment: "" };

  const methods = useForm<ReviewSchemaType>({ resolver: zodResolver(ReviewSchema), defaultValues });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const handleFormError = useFormErrorHandler(methods);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await submitReview({ ...data, slug });
      reset();
      onClose();
    } catch (error) {
      handleFormError(error);
    }
  });

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} {...other}>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle sx={{ typography: "h3", pb: 3 }}>{t("title")}</DialogTitle>

        <DialogContent
          sx={{
            py: 0,
            gap: 2.5,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t("rating.label")}:
            </Typography>
            <Field.Rating name="rating" />
          </div>

          <Field.Text multiline rows={3} name="comment" label={t("review.label")} />
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose} color="inherit">
            {t("cancel")}
          </Button>
          <LoadingButton color="inherit" type="submit" variant="contained" loading={isSubmitting}>
            {t("submit")}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
