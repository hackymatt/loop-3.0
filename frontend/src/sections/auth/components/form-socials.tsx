import "./styles.css";

import type { BoxProps } from "@mui/material/Box";
import type { Language } from "src/locales/types";
import type { UseFormReturn } from "react-hook-form";
import type { TokenResponse } from "@react-oauth/google";
import type { ReactFacebookLoginInfo } from "react-facebook-login";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import GitHubLogin from "react-github-login";
import { useGoogleLogin } from "@react-oauth/google";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";

import { useFormErrorHandler } from "src/hooks/use-form-error-handler";

import { CONFIG } from "src/global-config";
import { useLoginGithub } from "src/api/auth/github-login";
import { useLoginGoogle } from "src/api/auth/google-login";
import { useLoginFacebook } from "src/api/auth/facebook-login";
import { GithubIcon, GoogleIcon, FacebookIcon } from "src/assets/icons";

// ----------------------------------------------------------------------

type FormSocialsProps = BoxProps & { methods: UseFormReturn<any>; locale: Language };

export function FormSocials({ methods, locale, sx, ...other }: FormSocialsProps) {
  return (
    <Box
      sx={[
        { gap: 1.5, display: "flex", justifyContent: "center" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <GoogleSignIn methods={methods} locale={locale} />

      <GithubSignIn methods={methods} locale={locale} />

      <FacebookSignIn methods={methods} locale={locale} />
    </Box>
  );
}

function GoogleSignIn({ methods, locale }: { methods: UseFormReturn<any>; locale: Language }) {
  const { mutateAsync: googleLogin } = useLoginGoogle(locale);

  const handleFormError = useFormErrorHandler(methods);

  const handleLogin = async (
    response: Omit<TokenResponse, "error" | "error_description" | "error_uri">
  ) => {
    const { access_token: token } = response;

    try {
      await googleLogin({ token });
    } catch (error) {
      handleFormError(error);
    }
  };

  const login = useGoogleLogin({
    onSuccess: handleLogin,
  });

  return (
    <IconButton color="inherit" onClick={() => login()}>
      <GoogleIcon />
    </IconButton>
  );
}

function GithubSignIn({ methods, locale }: { methods: UseFormReturn<any>; locale: Language }) {
  const { mutateAsync: githubLogin } = useLoginGithub(locale);

  const handleFormError = useFormErrorHandler(methods);

  const handleLogin = async (response: { code: string }) => {
    const { code } = response;

    try {
      await githubLogin({ code });
    } catch (error) {
      handleFormError(error);
    }
  };

  return (
    <GitHubLogin
      clientId={CONFIG.githubClientId}
      onSuccess={handleLogin}
      className="github-login-button"
      scope={["user:email", "read:user"].join(",")}
      redirectUri={`${window.location.origin}/auth/github/callback`}
    >
      <GithubIcon />
    </GitHubLogin>
  );
}

function FacebookSignIn({ methods, locale }: { methods: UseFormReturn<any>; locale: Language }) {
  const { mutateAsync: facebookLogin } = useLoginFacebook(locale);

  const handleFormError = useFormErrorHandler(methods);

  const handleLogin = async (response: ReactFacebookLoginInfo) => {
    const { accessToken: access_token } = response;

    try {
      await facebookLogin({ access_token });
    } catch (error) {
      handleFormError(error);
    }
  };

  return (
    <FacebookLogin
      appId={CONFIG.facebookClientId}
      autoLoad={false}
      callback={handleLogin}
      render={(renderProps) => (
        <IconButton color="inherit" onClick={renderProps.onClick}>
          <FacebookIcon />
        </IconButton>
      )}
    />
  );
}
