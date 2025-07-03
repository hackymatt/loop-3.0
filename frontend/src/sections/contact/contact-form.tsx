import type { BoxProps } from "@mui/material/Box";

import { z as zod } from "zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";

import { useFormErrorHandler } from "src/hooks/use-form-error-handler";

import { useContact } from "src/api/contact/contact";
import { useTermsAcceptance } from "src/consts/acceptances";

import { Form, Field } from "src/components/hook-form";

// ----------------------------------------------------------------------

export type ContactSchemaType = zod.infer<ReturnType<typeof useContactSchema>>;

export const useContactSchema = () => {
  const { t } = useTranslation("contact");
  return zod.object({
    fullName: zod.string().min(1, { message: t("fullName.errors.required") }),
    subject: zod.string().min(1, { message: t("subject.errors.required") }),
    message: zod.string().min(1, { message: t("message.errors.required") }),
    email: zod
      .string()
      .min(1, { message: t("email.errors.required") })
      .email({ message: t("email.errors.invalid") }),
    termsAcceptance: zod.boolean().refine((data) => data === true, {
      message: t("termsAcceptance.errors.required"),
    }),
  });
};

// ----------------------------------------------------------------------

export function ContactForm({ sx, ...other }: BoxProps) {
  const { t } = useTranslation("contact");

  const { mutateAsync: contact } = useContact();

  const termsAcceptance = useTermsAcceptance();

  const defaultValues: ContactSchemaType = {
    fullName: "",
    subject: "",
    email: "",
    message: "",
    termsAcceptance: false,
  };

  const ContactSchema = useContactSchema();

  const methods = useForm<ContactSchemaType>({
    resolver: zodResolver(ContactSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const handleFormError = useFormErrorHandler(methods, { full_name: "fullName" });

  const onSubmit = handleSubmit(async (data) => {
    const { fullName, subject, email, message } = data;
    try {
      await contact({ full_name: fullName, subject, email, message });
      reset();
    } catch (error) {
      handleFormError(error);
    }
  });

  const renderTexts = () => (
    <>
      <Typography variant="h3">{t("title.form")}</Typography>
      <Typography sx={{ mt: 2, mb: 5, color: "text.secondary" }}>{t("subtitle.form")}</Typography>
    </>
  );

  const renderForm = () => (
    <Box sx={{ gap: 2.5, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <Field.Text name="fullName" label={t("fullName.label")} />
      <Field.Text name="email" label={t("email.label")} />
      <Field.Text name="subject" label={t("subject.label")} />
      <Field.Text name="message" multiline rows={4} label={t("message.label")} />

      <Field.Checkbox name="termsAcceptance" label={termsAcceptance} />

      <LoadingButton
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        loading={isSubmitting}
        sx={{ mx: "auto" }}
      >
        {t("button")}
      </LoadingButton>
    </Box>
  );

  return (
    <Box
      component="section"
      sx={[
        { py: { xs: 10, md: 15 }, bgcolor: "background.neutral" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Container>
        <Grid container spacing={3} sx={{ justifyContent: "center" }}>
          <Grid size={{ xs: 12, md: 8 }} sx={{ textAlign: "center" }}>
            {renderTexts()}

            <Form methods={methods} onSubmit={onSubmit}>
              {renderForm()}
            </Form>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
