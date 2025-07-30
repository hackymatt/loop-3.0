"use client";

import { z as zod } from "zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useBoolean } from "minimal-shared/hooks";
import { zodResolver } from "@hookform/resolvers/zod";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import { Link, Button, Divider } from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";

import { paths } from "src/routes/paths";

import { useLocalizedPath } from "src/hooks/use-localized-path";
import { useFormErrorHandler } from "src/hooks/use-form-error-handler";

import { CONFIG } from "src/global-config";
import { JOIN_TYPE, USER_TYPE } from "src/consts/user";
import { useChangePassword } from "src/api/me/password";

import { Iconify } from "src/components/iconify";
import { useUserContext } from "src/components/user";
import { Form, Field } from "src/components/hook-form";

import { DeleteAccountForm } from "./delete-account-form";

// ----------------------------------------------------------------------

const useAccountPasswordSchema = () => {
  const { t } = useTranslation("account");

  return zod
    .object({
      oldPassword: zod
        .string()
        .min(1, { message: t("oldPassword.errors.required") })
        .min(CONFIG.minPasswordLength, {
          message: t("oldPassword.errors.minLength").replace(
            "minPasswordLength",
            String(CONFIG.minPasswordLength)
          ),
        })
        .regex(/[A-Z]/, { message: t("oldPassword.errors.bigLetter") })
        .regex(/[a-z]/, { message: t("oldPassword.errors.smallLetter") })
        .regex(/[0-9]/, { message: t("oldPassword.errors.number") })
        .regex(/[!@#$%^&]/, {
          message: t("oldPassword.errors.specialCharacter"),
        }),
      newPassword: zod
        .string()
        .min(1, { message: t("newPassword.errors.required") })
        .min(CONFIG.minPasswordLength, {
          message: t("newPassword.errors.minLength").replace(
            "minPasswordLength",
            String(CONFIG.minPasswordLength)
          ),
        })
        .regex(/[A-Z]/, { message: t("newPassword.errors.bigLetter") })
        .regex(/[a-z]/, { message: t("newPassword.errors.smallLetter") })
        .regex(/[0-9]/, { message: t("newPassword.errors.number") })
        .regex(/[!@#$%^&]/, {
          message: t("newPassword.errors.specialCharacter"),
        }),
    })
    .refine((data) => data.oldPassword !== data.newPassword, {
      message: t("newPassword.errors.same"),
      path: ["newPassword"],
    });
};

type AccountPasswordSchemaType = zod.infer<ReturnType<typeof useAccountPasswordSchema>>;

// ----------------------------------------------------------------------

export function AccountManageView() {
  const { t } = useTranslation("account");
  const localize = useLocalizedPath();

  const user = useUserContext();
  const { userType, joinType } = user.state;

  const { mutateAsync: changePassword } = useChangePassword();

  const passwordShow = useBoolean();
  const deleteAccountFormOpen = useBoolean();

  const AccountPasswordSchema = useAccountPasswordSchema();

  const methods = useForm<AccountPasswordSchemaType>({
    resolver: zodResolver(AccountPasswordSchema),
    defaultValues: { oldPassword: "", newPassword: "" },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const handleFormError = useFormErrorHandler(methods, {
    old_password: "oldPassword",
    new_password: "newPassword",
  });

  const onSubmitPassword = handleSubmit(async (data) => {
    const { oldPassword, newPassword } = data;
    try {
      await changePassword({ old_password: oldPassword, new_password: newPassword });
      reset();
    } catch (error) {
      handleFormError(error);
    }
  });

  const renderChangePasswordForm = () => (
    <>
      <Field.Text
        name="oldPassword"
        label={t("oldPassword.label")}
        placeholder={t("oldPassword.placeholder")}
        type={passwordShow.value ? "text" : "password"}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={passwordShow.onToggle} edge="end">
                  <Iconify
                    icon={passwordShow.value ? "solar:eye-outline" : "solar:eye-closed-outline"}
                  />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
      <Field.Text
        name="newPassword"
        label={t("newPassword.label")}
        placeholder={t("newPassword.placeholder")}
        type={passwordShow.value ? "text" : "password"}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={passwordShow.onToggle} edge="end">
                  <Iconify
                    icon={passwordShow.value ? "solar:eye-outline" : "solar:eye-closed-outline"}
                  />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
    </>
  );

  const renderChangePassword = () => (
    <>
      <Form methods={methods} onSubmit={onSubmitPassword}>
        <Box sx={{ my: 3, gap: 2.5, display: "flex", flexDirection: "column" }}>
          {renderChangePasswordForm()}
        </Box>

        <Box sx={{ textAlign: "right" }}>
          <LoadingButton color="inherit" type="submit" variant="contained" loading={isSubmitting}>
            {t("manage.button")}
          </LoadingButton>
        </Box>
      </Form>

      {errors.root && (
        <Typography variant="body2" color="error" sx={{ width: 1 }}>
          {errors.root.message}
        </Typography>
      )}

      <Divider sx={{ borderStyle: "dashed", my: 5 }} />
    </>
  );

  const renderDeleteAccount = () => (
    <>
      <Typography variant="body1" sx={{ my: 3 }}>
        {t("delete.text")}{" "}
        <Link href={localize(paths.account.subscription)}>{t("subscription.title")}</Link>.
      </Typography>

      <Button
        color="error"
        type="submit"
        variant="contained"
        onClick={deleteAccountFormOpen.onToggle}
        disabled={userType === USER_TYPE.ADMIN}
      >
        {t("delete.button")}
      </Button>

      <DeleteAccountForm
        open={deleteAccountFormOpen.value}
        onClose={deleteAccountFormOpen.onFalse}
      />
    </>
  );

  return (
    <div>
      <Typography component="h6" variant="h5">
        {t("manage.title")}
      </Typography>

      {joinType === JOIN_TYPE.EMAIL && renderChangePassword()}
      {renderDeleteAccount()}
    </div>
  );
}
