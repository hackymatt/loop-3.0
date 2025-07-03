"use client";

import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useBoolean } from "minimal-shared/hooks";
import { zodResolver } from "@hookform/resolvers/zod";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import LoadingButton from "@mui/lab/LoadingButton";
import InputAdornment from "@mui/material/InputAdornment";

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";

import { useLocalizedPath } from "src/hooks/use-localized-path";
import { useFormErrorHandler } from "src/hooks/use-form-error-handler";

import { CONFIG } from "src/global-config";
import { usePasswordUpdate } from "src/api/auth/password-update";

import { Iconify } from "src/components/iconify";
import { Form, Field } from "src/components/hook-form";

import { FormHead } from "./components/form-head";
import { useUpdatePasswordSchema } from "./components/schema";
import { FormReturnLink } from "./components/form-return-link";

import type { UpdatePasswordSchemaType } from "./components/schema";

// ----------------------------------------------------------------------

export function UpdatePasswordView({ token }: { token: string }) {
  const showPassword = useBoolean();

  const router = useRouter();

  const { t } = useTranslation("update-password");
  const { t: account } = useTranslation("account");

  const localize = useLocalizedPath();

  const { mutateAsync: updatePassword } = usePasswordUpdate();

  const defaultValues: UpdatePasswordSchemaType = {
    password: "",
  };

  const UpdatePasswordSchema = useUpdatePasswordSchema();

  const methods = useForm<UpdatePasswordSchemaType>({
    resolver: zodResolver(UpdatePasswordSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const handleFormError = useFormErrorHandler(methods);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await updatePassword({ ...data, token });
      router.push(localize(paths.login));
      reset();
    } catch (error) {
      handleFormError(error);
    }
  });

  const renderForm = () => (
    <Box sx={{ gap: 3, display: "flex", flexDirection: "column" }}>
      <Field.Text
        name="password"
        label={account("password.label")}
        placeholder={account("password.placeholder")}
        type={showPassword.value ? "text" : "password"}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={showPassword.onToggle} edge="end">
                  <Iconify
                    icon={showPassword.value ? "solar:eye-outline" : "solar:eye-closed-outline"}
                  />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <LoadingButton
        fullWidth
        size="large"
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
            alt="Update password"
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
