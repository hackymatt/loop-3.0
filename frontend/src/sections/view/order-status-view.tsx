"use client";

import type { Variants } from "framer-motion";
import type { SubscriptionResult } from "src/types/user";

import { m } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useRef, useState, useEffect } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { CircularProgress } from "@mui/material";
import Typography from "@mui/material/Typography";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import { useQueryParams } from "src/hooks/use-query-params";
import { useLocalizedPath } from "src/hooks/use-localized-path";

import { SUBSCRIPTION_RESULT } from "src/consts/subscription";
import { useCreateSubscription } from "src/api/plan/subscription";

import { Iconify } from "src/components/iconify";
import { varBounce, MotionContainer } from "src/components/animate";

// ----------------------------------------------------------------------

const variants: Variants = varBounce("in");

type OrderStatusViewProps = {
  status: SubscriptionResult;
};

export default function OrderStatusView({ status }: OrderStatusViewProps) {
  const { t } = useTranslation("order-status");
  const { query } = useQueryParams();
  const localize = useLocalizedPath();
  const { mutateAsync: createSubscription } = useCreateSubscription();

  const [paymentError, setPaymentError] = useState<string | null>(null);
  const hasSubscribed = useRef(false);

  useEffect(() => {
    if (status === SUBSCRIPTION_RESULT.PENDING && !hasSubscribed.current) {
      hasSubscribed.current = true;
      const subscribe = async () => {
        try {
          await createSubscription({
            plan: query?.plan,
            currency: query?.currency,
            interval: query?.interval,
            code: query?.code || null,
          });
        } catch (err) {
          setPaymentError((err as Error).message || "Something went wrong");
        }
      };

      subscribe();
    }
  }, [status, query, createSubscription]);

  const renderPending = () => (
    <m.div variants={variants}>
      {!paymentError ? (
        <>
          <Box sx={{ fontSize: 128 }}>
            <CircularProgress />
          </Box>
          <Stack spacing={1} sx={{ my: 5 }}>
            <Typography variant="h3">{t(`${status}.title`)}</Typography>
            <Typography variant="body1" sx={{ mb: 0.5, display: "block", color: "text.disabled" }}>
              {t(`${status}.subtitle`)}
            </Typography>
          </Stack>
        </>
      ) : (
        <>
          <Typography variant="body2" color="error" sx={{ width: 1, p: 1, my: 5 }}>
            {paymentError}
          </Typography>
          <Button
            component={RouterLink}
            href={localize(
              status === SUBSCRIPTION_RESULT.SUCCESS ? paths.account.dashboard : paths.pricing
            )}
            size="large"
            color="inherit"
            variant="contained"
            startIcon={<Iconify icon="carbon:chevron-left" />}
          >
            {t(`${status}.button`)}
          </Button>
        </>
      )}
    </m.div>
  );

  const renderOther = () => (
    <>
      <m.div variants={variants}>
        <Box sx={{ fontSize: 128 }}>{status === SUBSCRIPTION_RESULT.SUCCESS ? "🎉" : "😞"}</Box>
      </m.div>
      <Stack spacing={1} sx={{ my: 5 }}>
        <Typography variant="h3">{t(`${status}.title`)}</Typography>
        <Typography variant="body1" sx={{ mb: 0.5, display: "block", color: "text.disabled" }}>
          {t(`${status}.subtitle`)}
        </Typography>
      </Stack>
      <Button
        component={RouterLink}
        href={status === SUBSCRIPTION_RESULT.SUCCESS ? paths.account.dashboard : paths.pricing}
        size="large"
        color="inherit"
        variant="contained"
        startIcon={
          status === SUBSCRIPTION_RESULT.FAILED ? <Iconify icon="carbon:chevron-left" /> : undefined
        }
        endIcon={
          status === SUBSCRIPTION_RESULT.SUCCESS ? (
            <Iconify icon="carbon:chevron-right" />
          ) : undefined
        }
      >
        {t(`${status}.button`)}
      </Button>
    </>
  );

  return (
    <Container
      component={MotionContainer}
      sx={{
        textAlign: "center",
        pt: { xs: 5, md: 10 },
        pb: { xs: 10, md: 20 },
      }}
    >
      {status === SUBSCRIPTION_RESULT.PENDING ? renderPending() : renderOther()}
    </Container>
  );
}
