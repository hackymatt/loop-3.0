"use client";

import type { AxiosError } from "axios";

import { useEffect } from "react";
import { notFound } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useSetState, useCountdownSeconds } from "minimal-shared/hooks";

import Box from "@mui/material/Box";
import { Typography } from "@mui/material";

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { CONFIG } from "src/global-config";
import { useResend } from "src/api/auth/resend";
import { useActivate } from "src/api/auth/activate";

import { useUserContext } from "src/components/user/context";

import { FormHead } from "./components/form-head";
import { FormReturnLink } from "./components/form-return-link";
import { FormResendLink } from "./components/form-resend-link";

// ----------------------------------------------------------------------

export function ActivateView({ token }: { token: string | undefined }) {
  const { t } = useTranslation("activate");
  const localize = useLocalizedPath();

  const router = useRouter();

  const { state, setState } = useSetState<{ error: string }>({ error: "" });

  const user = useUserContext();

  const { mutateAsync: activate } = useActivate();
  const { mutateAsync: resend } = useResend();

  useEffect(() => {
    const activateAccount = async () => {
      if (token) {
        try {
          await activate({ token });
          user.setField("isActive", true);
          router.push(localize(paths.login));
        } catch (error) {
          setState({ error: ((error as AxiosError).response?.data as { error: string }).error });
        }
      }
    };

    activateAccount();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const countdownSeconds = useCountdownSeconds(30);

  const handleResendCode = async () => {
    countdownSeconds.start();
    try {
      const { status } = await resend({ token, email: user.state.email || "" });
      user.setField("isActive", true);
      if (status === 200) {
        router.push(localize(paths.login));
      }
    } catch (error) {
      setState({ error: ((error as AxiosError).response?.data as { root: string }).root });
    }
  };

  if (!token && user.state.email === "") {
    notFound();
  }

  return (
    <>
      <FormHead
        icon={
          <Box
            component="img"
            alt="Email inbox"
            src={`${CONFIG.assetsDir}/assets/icons/auth/ic-email-inbox.svg`}
            sx={{ width: 96, height: 96 }}
          />
        }
        title={t("title")}
        description={t("subtitle")}
      />

      {!!state.error && (
        <Typography variant="body2" sx={{ color: "error.main", textAlign: "center" }}>
          {state.error}
        </Typography>
      )}

      <FormResendLink
        onResendCode={handleResendCode}
        value={countdownSeconds.value}
        disabled={countdownSeconds.isCounting}
      />

      <FormReturnLink href={localize(paths.login)} label={t("link")} />
    </>
  );
}
