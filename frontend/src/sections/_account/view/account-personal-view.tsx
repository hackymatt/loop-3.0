"use client";

import { z as zod } from "zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { varAlpha } from "minimal-shared/utils";
import { zodResolver } from "@hookform/resolvers/zod";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";

import { useFormErrorHandler } from "src/hooks/use-form-error-handler";

import { useUpdateData } from "src/api/me/data";

import { useUserContext } from "src/components/user";
import { Form, Field } from "src/components/hook-form";

import { UserPhoto } from "src/sections/_account/layout";

// ----------------------------------------------------------------------

const useAccountPersonalSchema = () => {
  const { t } = useTranslation("account");

  return zod.object({
    email: zod
      .string()
      .min(1, { message: t("email.errors.required") })
      .email({ message: t("email.errors.invalid") }),
    firstName: zod.string().min(1, { message: t("firstName.errors.required") }),
    lastName: zod.string().min(1, { message: t("lastName.errors.required") }),
  });
};

type AccountPersonalSchemaType = zod.infer<ReturnType<typeof useAccountPersonalSchema>>;

// ----------------------------------------------------------------------

export function AccountPersonalView() {
  const { t } = useTranslation("account");

  const user = useUserContext();
  const { email, firstName, lastName } = user.state;

  const { mutateAsync: updateData } = useUpdateData();

  const AccountPersonalSchema = useAccountPersonalSchema();
  const methods = useForm<AccountPersonalSchemaType>({
    resolver: zodResolver(AccountPersonalSchema),
    defaultValues: {
      firstName: firstName || "",
      lastName: lastName || "",
      email: email || "",
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const handleFormError = useFormErrorHandler(methods, {
    first_name: "firstName",
    last_name: "lastName",
  });

  const onSubmitPersonal = handleSubmit(async (data) => {
    const { firstName: first_name, lastName: last_name } = data;
    try {
      await updateData({ first_name, last_name });
      user.setState({ firstName: first_name, lastName: last_name });
    } catch (error) {
      handleFormError(error);
    }
  });

  const renderPersonalForm = () => (
    <>
      <Field.Text name="email" label={t("email.label")} disabled />
      <Field.Text name="firstName" label={t("firstName.label")} />
      <Field.Text name="lastName" label={t("lastName.label")} />
    </>
  );

  return (
    <div>
      <Typography component="h6" variant="h5">
        {t("personal.title")}
      </Typography>

      <UserPhoto
        sx={(theme) => ({
          p: 3,
          mt: 3,
          borderRadius: 2,
          display: { xs: "flex", md: "none" },
          border: `solid 1px ${varAlpha(theme.vars.palette.grey["500Channel"], 0.24)}`,
        })}
      />

      <Form methods={methods} onSubmit={onSubmitPersonal}>
        <Box
          sx={{
            my: 3,
            rowGap: 2.5,
            columnGap: 2,
            display: "grid",
            gridTemplateColumns: "repeat(1, 1fr)",
          }}
        >
          {renderPersonalForm()}
        </Box>

        <Box sx={{ textAlign: "right" }}>
          <LoadingButton color="inherit" type="submit" variant="contained" loading={isSubmitting}>
            {t("personal.button")}
          </LoadingButton>
        </Box>
      </Form>
    </div>
  );
}
