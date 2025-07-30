"use client";

import type { BoxProps } from "@mui/material/Box";
import type { Theme, SxProps } from "@mui/material/styles";
import type { ButtonBaseProps } from "@mui/material/ButtonBase";

import { useSnackbar } from "notistack";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { usePopover } from "minimal-shared/hooks";
import { varAlpha, isActiveLink } from "minimal-shared/utils";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Popover from "@mui/material/Popover";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { Tab, Tabs, Input, Button } from "@mui/material";
import ButtonBase, { buttonBaseClasses } from "@mui/material/ButtonBase";

import { usePathname } from "src/routes/hooks";
import { RouterLink } from "src/routes/components";

import { useUpdateData } from "src/api/me/data";
import { DEFAULT_AVATAR_URL } from "src/consts/avatar";

import { Iconify } from "src/components/iconify";
import { useUserContext } from "src/components/user";

// ----------------------------------------------------------------------

export type NavItemsProps = {
  sx?: SxProps<Theme>;
  data: {
    path?: string;
    title: string;
    icon: React.ReactNode;
  }[];
};

export function NavAccountDesktop({ data, sx }: NavItemsProps) {
  const pathname = usePathname();

  const currentTab = data.find((item) => item.path === pathname)?.title;

  const user = useUserContext();
  const { email, firstName } = user.state;

  const renderUserInfo = () => (
    <Box sx={{ p: 3, pb: 2 }}>
      <UserPhoto sx={{ mb: 2 }} />
      <div>
        <Typography variant="subtitle1" noWrap sx={{ mb: 0.5 }}>
          {firstName}
        </Typography>
        <Typography variant="body2" noWrap sx={{ color: "text.secondary" }}>
          {email}
        </Typography>
      </div>
    </Box>
  );

  const renderNav = () => (
    <Box
      component="nav"
      sx={{
        my: 1,
        px: 3,
        "& li": { display: "flex" },
      }}
    >
      <ul>
        {data.map((item) => (
          <li key={item.title}>
            <NavItem title={item.title} path={item.path} icon={item.icon} />
          </li>
        ))}
      </ul>
    </Box>
  );

  return (
    <>
      <Stack
        divider={<Divider component="span" sx={{ borderStyle: "dashed" }} />}
        sx={[
          (theme) => ({
            width: 280,
            flexShrink: 0,
            borderRadius: 2,
            display: { xs: "none", md: "flex" },
            border: `solid 1px ${varAlpha(theme.vars.palette.grey["500Channel"], 0.24)}`,
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {renderUserInfo()}
        {renderNav()}
      </Stack>

      <Tabs
        scrollButtons="auto"
        variant="scrollable"
        allowScrollButtonsMobile
        value={currentTab}
        TabScrollButtonProps={{
          sx: {
            "&.Mui-disabled": {
              display: "none",
            },
          },
        }}
        sx={{ display: { xs: "flex", md: "none" }, mb: 2 }}
      >
        {data.map((item) => (
          <Tab
            key={item.title}
            value={item.title}
            component={RouterLink}
            href={item.path!}
            label={item.title}
          />
        ))}
      </Tabs>
    </>
  );
}

// ----------------------------------------------------------------------

export function NavAccountPopover({ data, sx }: NavItemsProps) {
  const { open, onClose, onOpen, anchorEl } = usePopover();

  const pathname = usePathname();

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
        sx={{ gap: 0.5, display: "flex", flexDirection: "column", "& li": { display: "flex" } }}
      >
        {data.map((item) => (
          <li key={item.title}>
            <NavItem title={item.title} path={item.path} icon={item.icon} />
          </li>
        ))}
      </Box>
    </Box>
  );

  const renderMenuActions = () => (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
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
      <NavItem title="Logout" icon={<Iconify icon="carbon:logout" />} onClick={onClose} />
    </Popover>
  );

  return (
    <>
      <IconButton disableRipple color={open ? "primary" : "inherit"} onClick={onOpen}>
        <Iconify width={22} icon="solar:user-rounded-outline" />
      </IconButton>
      {renderMenuActions()}
    </>
  );
}

// ----------------------------------------------------------------------

type NavItemProps = ButtonBaseProps & NavItemsProps["data"][number];

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

// ----------------------------------------------------------------------

export function UserPhoto({ sx, ...other }: BoxProps) {
  const { t } = useTranslation("account");

  const user = useUserContext();
  const { avatarUrl } = user.state;

  const { enqueueSnackbar } = useSnackbar();

  const { mutateAsync: updateData } = useUpdateData();

  const [image, setImage] = useState<string>(avatarUrl || DEFAULT_AVATAR_URL);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const { data } = await updateData({ image: file });
      user.setField("avatarUrl", data.image);
    } catch {
      enqueueSnackbar(t("photo.error"), { variant: "error" });
    }
  };

  return (
    <Box
      sx={[
        {
          gap: 2,
          display: "flex",
          alignItems: "center",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Avatar src={image || DEFAULT_AVATAR_URL} sx={{ width: 64, height: 64 }} />

      {/* Hidden File Input */}
      <Input
        type="file"
        inputProps={{ accept: "image/*" }}
        sx={{ display: "none" }}
        onChange={handleImageChange}
        id="file-upload"
      />

      {/* Trigger File Input */}
      <label htmlFor="file-upload">
        <Button component="span" startIcon={<Iconify icon="solar:pen-2-outline" />}>
          <Typography variant="caption">{t("photo.change")}</Typography>
        </Button>
      </label>
    </Box>
  );
}
