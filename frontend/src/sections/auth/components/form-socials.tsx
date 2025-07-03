import "./styles.css";

import type { BoxProps } from "@mui/material/Box";
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

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";

import { useLocalizedPath } from "src/hooks/use-localized-path";
import { useFormErrorHandler } from "src/hooks/use-form-error-handler";

import { CONFIG } from "src/global-config";
import { useLoginGithub } from "src/api/auth/github-login";
import { useLoginGoogle } from "src/api/auth/google-login";
import { useLoginFacebook } from "src/api/auth/facebook-login";
import { GithubIcon, GoogleIcon, FacebookIcon } from "src/assets/icons";

import { useUserContext } from "src/components/user";

// ----------------------------------------------------------------------

type FormSocialsProps = BoxProps & { methods: UseFormReturn<any> };

export function FormSocials({ methods, sx, ...other }: FormSocialsProps) {
  return (
    <Box
      sx={[
        { gap: 1.5, display: "flex", justifyContent: "center" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <GoogleSignIn methods={methods} />

      <GithubSignIn methods={methods} />

      <FacebookSignIn methods={methods} />
    </Box>
  );
}

function GoogleSignIn({ methods }: { methods: UseFormReturn<any> }) {
  const router = useRouter();
  const user = useUserContext();
  const { redirect } = user.state;

  const localize = useLocalizedPath();

  const { mutateAsync: googleLogin } = useLoginGoogle();

  const handleFormError = useFormErrorHandler(methods);

  const handleLogin = async (
    response: Omit<TokenResponse, "error" | "error_description" | "error_uri">
  ) => {
    const { access_token: token } = response;

    try {
      const { data: responseData } = await googleLogin({ token });
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

function GithubSignIn({ methods }: { methods: UseFormReturn<any> }) {
  const router = useRouter();
  const user = useUserContext();
  const { redirect } = user.state;

  const localize = useLocalizedPath();

  const { mutateAsync: githubLogin } = useLoginGithub();

  const handleFormError = useFormErrorHandler(methods);

  const handleLogin = async (response: { code: string }) => {
    const { code } = response;

    try {
      const { data: responseData } = await githubLogin({ code });
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

function FacebookSignIn({ methods }: { methods: UseFormReturn<any> }) {
  const router = useRouter();
  const user = useUserContext();
  const { redirect } = user.state;

  const localize = useLocalizedPath();

  const { mutateAsync: facebookLogin } = useLoginFacebook();

  const handleFormError = useFormErrorHandler(methods);

  const handleLogin = async (response: ReactFacebookLoginInfo) => {
    const { accessToken: access_token } = response;

    try {
      const { data: responseData } = await facebookLogin({ access_token });
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
