"use client";

import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";

import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";

import { paths } from "src/routes/paths";

import { useLocalizedPath } from "src/hooks/use-localized-path";
import { useFormErrorHandler } from "src/hooks/use-form-error-handler";

import { CONFIG } from "src/global-config";
import { usePasswordReset } from "src/api/auth/password-reset";

import { Form, Field } from "src/components/hook-form";

import { FormHead } from "./components/form-head";
import { useResetPasswordSchema } from "./components/schema";
import { FormReturnLink } from "./components/form-return-link";

import type { ResetPasswordSchemaType } from "./components/schema";

// ----------------------------------------------------------------------

export function ResetPasswordView() {
  const { t } = useTranslation("reset-password");
  const { t: account } = useTranslation("account");
  const localize = useLocalizedPath();

  const { mutateAsync: resetPassword } = usePasswordReset();

  const defaultValues: ResetPasswordSchemaType = { email: "" };

  const ResetPasswordSchema = useResetPasswordSchema();

  const methods = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(ResetPasswordSchema),
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
      await resetPassword(data);
      reset();
    } catch (error) {
      handleFormError(error);
    }
  });

  const renderForm = () => (
    <Box sx={{ gap: 3, display: "flex", flexDirection: "column" }}>
      <Field.Text
        name="email"
        label={account("email.label")}
        placeholder="email@example.com"
        slotProps={{ inputLabel: { shrink: true } }}
      />

      {errors.root && (
        <Typography variant="body2" color="error" sx={{ width: 1 }}>
          {errors.root.message}
        </Typography>
      )}

      <LoadingButton
        fullWidth
        size="large"
        color="inherit"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        {t("button")}
      </LoadingButton>
    </Box>
  );

  return (
    <>
      <FormHead
        icon={
          <Box
            component="img"
            alt="Reset password"
            src={`${CONFIG.assetsDir}/assets/icons/auth/ic-lock-password.svg`}
            sx={{ width: 96, height: 96 }}
          />
        }
        title={t("title")}
        description={t("subtitle")}
      />

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm()}
      </Form>

      <FormReturnLink href={localize(paths.login)} label={t("link")} />
    </>
  );
}
