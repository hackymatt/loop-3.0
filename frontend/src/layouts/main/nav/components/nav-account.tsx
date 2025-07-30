"use client";

import type { ButtonBaseProps } from "@mui/material/ButtonBase";
import type { Theme, SxProps, Breakpoint } from "@mui/material/styles";

import { useEffect } from "react";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import { usePopover } from "minimal-shared/hooks";
import { isActiveLink } from "minimal-shared/utils";

import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Popover from "@mui/material/Popover";
import IconButton from "@mui/material/IconButton";
import ButtonBase, { buttonBaseClasses } from "@mui/material/ButtonBase";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";
import { useRouter, usePathname } from "src/routes/hooks";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { useLogout } from "src/api/auth/logout";
import { DEFAULT_AVATAR_URL } from "src/consts/avatar";

import { Iconify } from "src/components/iconify";
import { useUserContext } from "src/components/user";

// ----------------------------------------------------------------------

export type NavItemsProps = {
  layoutQuery?: Breakpoint;
  sx?: SxProps<Theme>;
};

// ----------------------------------------------------------------------

const useNavData = () => {
  const { t } = useTranslation("navigation");
  const localize = useLocalizedPath();

  return [
    {
      title: t("dashboard"),
      path: localize(paths.account.dashboard),
      icon: <Iconify icon="solar:home-2-outline" />,
    },
    {
      title: t("accountSettings"),
      path: localize(paths.account.personal),
      icon: <Iconify icon="solar:user-rounded-outline" />,
    },
    {
      title: t("support"),
      path: localize(paths.support),
      icon: <Iconify icon="solar:question-circle-outline" />,
    },
  ];
};

// ----------------------------------------------------------------------

export function NavAccountPopover({ sx }: NavItemsProps) {
  const { open, onClose, onOpen, anchorEl } = usePopover();

  const { t } = useTranslation("navigation");
  const { t: account } = useTranslation("account");

  const localize = useLocalizedPath();

  const user = useUserContext();
  const { avatarUrl } = user.state;

  const { mutateAsync: logout } = useLogout();

  const router = useRouter();

  const pathname = usePathname();

  const { enqueueSnackbar } = useSnackbar();

  const navData = useNavData();

  useEffect(() => {
    if (open) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderNav = () => (
    <Box component="nav">
      <Box
        component="ul"
        sx={{
          gap: 0.5,
          display: "flex",
          flexDirection: "column",
          p: 0,
          "& li": { display: "flex" },
        }}
      >
        {navData.map((item) => (
          <li key={item.title}>
            <NavItem title={item.title} path={item.path} icon={item.icon} />
          </li>
        ))}
      </Box>
    </Box>
  );

  const handleLogout = async () => {
    try {
      const { status } = await logout({});
      if (status === 205) {
        router.push(localize(paths.home));
        user.resetState();
        onClose();
      }
    } catch {
      enqueueSnackbar(account("logout.error"), { variant: "error" });
    }
  };

  const renderMenuActions = () => (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      disableScrollLock
      slotProps={{
        paper: {
          sx: [
            {
              width: 220,
              [`& .${buttonBaseClasses.root}`]: {
                px: 1.5,
                py: 0.75,
                height: "auto",
              },
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ],
        },
      }}
    >
      {renderNav()}
      <Divider sx={{ my: 0.5, borderStyle: "dashed" }} />
      <NavItem
        title={t("logout")}
        icon={<Iconify icon="solar:logout-2-outline" />}
        onClick={handleLogout}
      />
    </Popover>
  );

  return (
    <>
      <IconButton disableRipple color={open ? "primary" : "inherit"} onClick={onOpen}>
        <Avatar src={avatarUrl || DEFAULT_AVATAR_URL} sx={{ width: 32, height: 32 }} />
        <Iconify
          width={16}
          icon={open ? "solar:alt-arrow-up-outline" : "solar:alt-arrow-down-outline"}
          sx={{ ml: 0.5 }}
        />
      </IconButton>
      {renderMenuActions()}
    </>
  );
}

// ----------------------------------------------------------------------

type NavItemProps = ButtonBaseProps & {
  path?: string;
  title: string;
  icon: React.ReactNode;
};

export function NavItem({ title, path = "", icon, sx, ...other }: NavItemProps) {
  const pathname = usePathname();

  const isActive = path && isActiveLink(pathname, path);

  const buttonProps = path
    ? {
        href: path,
        component: RouterLink,
      }
    : {};

  return (
    <ButtonBase
      disableRipple
      key={title}
      {...buttonProps}
      sx={[
        {
          gap: 2,
          width: 1,
          height: 44,
          borderRadius: 1,
          typography: "body2",
          justifyContent: "flex-start",
          ...(isActive && { color: "primary.main", typography: "subtitle2" }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {icon}
      {title}
    </ButtonBase>
  );
}
