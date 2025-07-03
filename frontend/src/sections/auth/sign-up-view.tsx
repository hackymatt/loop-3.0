"use client";

import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";

import { Link } from "@mui/material";

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";
import { RouterLink } from "src/routes/components";

import { useLocalizedPath } from "src/hooks/use-localized-path";
import { useFormErrorHandler } from "src/hooks/use-form-error-handler";

import { useRegister } from "src/api/auth/register";

import { Form } from "src/components/hook-form";
import { useUserContext } from "src/components/user/context";

import { FormHead } from "./components/form-head";
import { SignUpForm } from "./components/sign-up-form";
import { FormSocials } from "./components/form-socials";
import { FormDivider } from "./components/form-divider";
import { SignUpTerms } from "./components/sign-up-terms";
import { useSignUpSchema, type SignUpSchemaType } from "./components/schema";

// ----------------------------------------------------------------------
type Props = {
  header?: React.ReactNode;
  buttonText?: string;
};

export function SignUpView({ header, buttonText = "Utwórz konto" }: Props) {
  const { t } = useTranslation("sign-up");

  const localize = useLocalizedPath();

  const router = useRouter();

  const user = useUserContext();

  const { mutateAsync: register } = useRegister();

  const defaultValues: SignUpSchemaType = {
    email: "",
    password: "",
    termsAcceptance: false,
    dataProcessingConsent: false,
  };

  const SignUpSchema = useSignUpSchema();

  const methods = useForm<SignUpSchemaType>({ resolver: zodResolver(SignUpSchema), defaultValues });

  const { reset, handleSubmit, clearErrors } = methods;

  const handleFormError = useFormErrorHandler(methods);

  const onSubmit = handleSubmit(async (data) => {
    clearErrors();
    try {
      const { email, password } = data;
      await register({ email, password });
      user.setState({ email });
      router.push(localize(paths.activate));
      reset();
    } catch (error) {
      handleFormError(error);
    }
  });

  return (
    <>
      {header ? (
        header
      ) : (
        <FormHead
          title={t("title")}
          description={
            <>
              {`${t("subtitle")} `}
              <Link component={RouterLink} href={localize(paths.login)} variant="subtitle2">
                {t("link")}
              </Link>
            </>
          }
        />
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        <SignUpForm buttonText={buttonText ?? t("button")} />
        <SignUpTerms />
      </Form>

      <FormDivider label={t("or")} />

      <FormSocials methods={methods} />
    </>
  );
}
