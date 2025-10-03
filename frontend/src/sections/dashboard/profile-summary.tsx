"use client";

import type { IDashboardProps } from "src/types/user";

import { useTranslation } from "react-i18next";

import { Box, Card, Link, Stack, Avatar, Typography } from "@mui/material";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import { usePluralize } from "src/hooks/use-pluralize";
import { useLocalizedPath } from "src/hooks/use-localized-path";

import { getPlanIcon } from "src/utils/plan-icon";
import { fShortenNumber } from "src/utils/format-number";

import { CONFIG } from "src/global-config";
import { DEFAULT_AVATAR_URL } from "src/consts/avatar";

import { Iconify } from "src/components/iconify";
import { useUserContext } from "src/components/user";

// --------------------------------------------

const iconPath = (name: string) => `${CONFIG.assetsDir}/assets/icons/plans/${name}`;

// --------------------------------------------

const StatBox = ({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
}) => (
  <Card
    sx={(theme) => ({
      borderRadius: 2,
      p: 3,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      backgroundColor: theme.palette.background.default,
      flex: 1,
      minHeight: 160,
    })}
  >
    <Iconify icon={icon} width={24} height={24} sx={{ color: `${color}.main` }} />

    <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
      {label}
    </Typography>

    <Box sx={{ flexGrow: 1 }} />

    <Typography variant="h4" color={`${color}.main`} fontWeight="bold">
      {value}
    </Typography>
  </Card>
);

type Props = Pick<IDashboardProps, "profile">;

export function ProfileSummary({ profile }: Props) {
  const { t: locale } = useTranslation("locale");
  const { t } = useTranslation("dashboard");
  const days = t("profile.days", { returnObjects: true }) as string[];
  const localize = useLocalizedPath();
  const languagePluralize = usePluralize();

  const user = useUserContext();
  const { firstName, email, avatarUrl } = user.state;

  const renderPlan = () => (
    <Link
      component={RouterLink}
      href={localize(paths.account.subscription)}
      color="inherit"
      underline="none"
    >
      <Card
        sx={(theme) => ({
          borderRadius: 3,
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[1],
        })}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: "50%",
            }}
          >
            <Box
              component="img"
              alt={profile.user.planLicense}
              src={iconPath(getPlanIcon(profile.user.plan.type))}
              sx={{ width: 80, height: 80 }}
            />
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              {t("profile.plan")}
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {profile.user.planLicense}
            </Typography>
          </Box>
        </Stack>
      </Card>
    </Link>
  );

  const renderTokens = () => (
    <Card
      sx={(theme) => ({
        borderRadius: 3,
        px: 3,
        py: 2,
        display: "flex",
        alignItems: "center",
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[1],
      })}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: "50%",
          }}
        >
          <Iconify icon="logos:openai-icon" width={24} height={24} />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            {t("profile.tokens")}
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {fShortenNumber(profile.tokens, { code: locale("code") })}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );

  const renderUser = () => (
    <Link
      component={RouterLink}
      href={localize(paths.account.personal)}
      color="inherit"
      underline="none"
    >
      <Card
        sx={(theme) => ({
          borderRadius: 2,
          p: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 2,
          backgroundColor: theme.palette.background.default,
          "&:hover": { boxShadow: theme.vars.customShadows.z24 },
        })}
      >
        <Avatar src={avatarUrl || DEFAULT_AVATAR_URL} sx={{ width: 64, height: 64 }} />

        <Box display="flex" gap={0.5} alignItems="center">
          <Typography variant="subtitle1" noWrap>
            {t("profile.greeting")}, {firstName || email}!
          </Typography>

          <Iconify icon="solar:alt-arrow-right-outline" />
        </Box>
      </Card>
    </Link>
  );

  const renderStats = () => (
    <Box display="flex" gap={2}>
      <StatBox
        icon="solar:medal-star-bold"
        label={t("profile.points")}
        value={fShortenNumber(profile.totalPoints, {
          code: locale("code"),
        })}
        color="primary"
      />
      <StatBox
        icon="solar:fire-bold"
        label={t("profile.streak")}
        value={`${fShortenNumber(profile.dailyStreak, { code: locale("code") })} ${languagePluralize(days, profile.dailyStreak)}`}
        color="warning"
      />
    </Box>
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={2}
      sx={(theme) => ({
        borderRadius: 2,
        p: 2,
        gridTemplateColumns: "repeat(2, 1fr)",
        border: `dashed 1px ${theme.vars.palette.divider}`,
      })}
    >
      {renderUser()}
      {renderPlan()}
      {renderTokens()}
      {renderStats()}
    </Box>
  );
}
