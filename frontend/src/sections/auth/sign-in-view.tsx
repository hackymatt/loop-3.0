"use client";

import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";

import Link from "@mui/material/Link";

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";
import { RouterLink } from "src/routes/components";

import { useLocalizedPath } from "src/hooks/use-localized-path";
import { useFormErrorHandler } from "src/hooks/use-form-error-handler";

import { useLogin } from "src/api/auth/login";

import { Form } from "src/components/hook-form";
import { useUserContext } from "src/components/user/context";

import { FormHead } from "./components/form-head";
import { useSignInSchema } from "./components/schema";
import { SignInForm } from "./components/sign-in-form";
import { FormSocials } from "./components/form-socials";
import { FormDivider } from "./components/form-divider";

import type { SignInSchemaType } from "./components/schema";

// ----------------------------------------------------------------------

export function SignInView() {
  const { t } = useTranslation("sign-in");
  const localize = useLocalizedPath();

  const router = useRouter();
  const user = useUserContext();
  const { redirect } = user.state;

  const { mutateAsync: login } = useLogin();

  const defaultValues: SignInSchemaType = { email: "", password: "" };

  const SignInSchema = useSignInSchema();

  const methods = useForm<SignInSchemaType>({ resolver: zodResolver(SignInSchema), defaultValues });

  const { reset, handleSubmit } = methods;

  const handleFormError = useFormErrorHandler(methods);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const { data: responseData, status } = await login(data);
      if (status === 401) {
        user.setState({
          isActive: false,
          isLoggedIn: false,
          email: data.email,
        });
        router.push(localize(paths.activate));
      } else {
        const { email, first_name, last_name, image, user_type, join_type, is_active, plan } =
          responseData;
        user.setState({
          isActive: is_active,
          isLoggedIn: true,
          email,
          firstName: first_name,
          lastName: last_name,
          avatarUrl: image,
          userType: user_type,
          joinType: join_type,
          plan,
          redirect: null,
        });
        router.push(localize(redirect || paths.account.dashboard));
      }
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
            <Link component={RouterLink} href={localize(paths.register)} variant="subtitle2">
              {t("link")}
            </Link>
          </>
        }
      />

      <Form methods={methods} onSubmit={onSubmit}>
        <SignInForm buttonText={t("button")} forgotPasswordText={t("forgotPassword")} />
      </Form>

      <FormDivider label={t("or")} />

      <FormSocials methods={methods} />
    </>
  );
}
