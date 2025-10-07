import type { AxiosError } from "axios";
import type { Language } from "src/locales/types";
import type { DialogProps } from "@mui/material/Dialog";

import { z as zod } from "zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useBoolean } from "minimal-shared/hooks";
import { zodResolver } from "@hookform/resolvers/zod";

import { Alert } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import LoadingButton from "@mui/lab/LoadingButton";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

import { useFormErrorHandler } from "src/hooks/use-form-error-handler";

import { useCreateConsultation } from "src/api/project/consultation/consultations";

import { Form, Field } from "src/components/hook-form";

import { UpgradeBanner } from "../learn/upgrade-banner";

// ----------------------------------------------------------------------

export type ConsultationSchemaType = zod.infer<ReturnType<typeof useConsultationSchema>>;

export const useConsultationSchema = () => {
  const { t } = useTranslation("consultation");
  return zod.object({
    comment: zod.string().min(1, t("comment.errors.required")),
  });
};

// ----------------------------------------------------------------------

type Props = DialogProps & {
  slug: string;
  language: Language;
  onClose: () => void;
};

export function ProjectConsultNewForm({ slug, language, onClose, ...other }: Props) {
  const { t } = useTranslation("consultation");

  const showUpgradeBanner = useBoolean();

  const { mutateAsync: createConsultation } = useCreateConsultation(slug, language);

  const ConsultationSchema = useConsultationSchema();

  const defaultValues: ConsultationSchemaType = { comment: "" };

  const methods = useForm<ConsultationSchemaType>({
    resolver: zodResolver(ConsultationSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const handleFormError = useFormErrorHandler(methods);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await createConsultation(data);
      reset();
      onClose();
    } catch (error) {
      if ((error as AxiosError).response?.status === 403) {
        showUpgradeBanner.onTrue();
        return;
      }
      handleFormError(error);
    }
  });

  if (showUpgradeBanner.value) {
    return (
      <UpgradeBanner
        slug={slug}
        type="feature"
        open
        onClose={() => {
          showUpgradeBanner.onFalse();
          onClose();
        }}
      />
    );
  }

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
          <Field.Text multiline rows={3} name="comment" label={t("comment.label")} />

          {errors.root && (
            <Alert
              variant="filled"
              severity="error"
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              {errors.root.message}
            </Alert>
          )}
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
