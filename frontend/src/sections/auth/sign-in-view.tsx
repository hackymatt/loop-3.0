"use client";

import type { Language } from "src/locales/types";

import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";

import Link from "@mui/material/Link";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import { useLocalizedPath } from "src/hooks/use-localized-path";
import { useFormErrorHandler } from "src/hooks/use-form-error-handler";

import { useLogin } from "src/api/auth/login";

import { Form } from "src/components/hook-form";

import { FormHead } from "./components/form-head";
import { useSignInSchema } from "./components/schema";
import { SignInForm } from "./components/sign-in-form";
import { FormSocials } from "./components/form-socials";
import { FormDivider } from "./components/form-divider";

import type { SignInSchemaType } from "./components/schema";

// ----------------------------------------------------------------------
type SignInViewProps = {
  locale: Language;
};

export function SignInView({ locale }: SignInViewProps) {
  const { t } = useTranslation("sign-in");
  const localize = useLocalizedPath();

  const { mutateAsync: login } = useLogin(locale);

  const defaultValues: SignInSchemaType = { email: "", password: "" };

  const SignInSchema = useSignInSchema();

  const methods = useForm<SignInSchemaType>({ resolver: zodResolver(SignInSchema), defaultValues });

  const { reset, handleSubmit } = methods;

  const handleFormError = useFormErrorHandler(methods);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await login(data);
      reset();
    } catch (error) {
      handleFormError(error);
    }
  });

  return (
    <>
      <FormHead
        title={t("title")}
        description={
          <>
            {`${t("subtitle")} `}
            <Link component={RouterLink} href={localize(paths.auth.register)} variant="subtitle2">
              {t("link")}
            </Link>
          </>
        }
      />

      <Form methods={methods} onSubmit={onSubmit}>
        <SignInForm buttonText={t("button")} forgotPasswordText={t("forgotPassword")} />
      </Form>

      <FormDivider label={t("or")} />

      <FormSocials methods={methods} locale={locale} />
    </>
  );
}
