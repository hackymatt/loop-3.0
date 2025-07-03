import type { LinkProps } from "@mui/material/Link";

import { forwardRef } from "react";
import { mergeClasses } from "minimal-shared/utils";

import { Box } from "@mui/material";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { CONFIG } from "src/global-config";

import { Image } from "../image";
import { logoClasses } from "./classes";
import { useSettingsContext } from "../settings";

// ----------------------------------------------------------------------

export type LogoProps = LinkProps & {
  isSingle?: boolean;
  isLink?: boolean;
  disabled?: boolean;
};

export const Logo = forwardRef<HTMLAnchorElement, LogoProps>((props, ref) => {
  const { className, isSingle = false, isLink = true, disabled, sx, ...other } = props;

  const localize = useLocalizedPath();
  const settings = useSettingsContext();
  const { colorScheme } = settings.state;

  const logoPath = (name: string) => `${CONFIG.assetsDir}/assets/logo/${name}`;

  const singleLogo = (
    <Image
      alt="logo-loop-single"
      src={logoPath(colorScheme === "light" ? "logo-mark.svg" : "logo-mark-dark.svg")}
      ratio="1/1"
    />
  );

  const fullLogo = (
    <Image
      alt="logo-loop-full"
      src={logoPath(colorScheme === "light" ? "logo.svg" : "logo-dark.svg")}
      ratio="1/1"
    />
  );

  return isLink ? (
    <LogoRoot
      ref={ref}
      component={RouterLink}
      href={localize(paths.home)}
      aria-label="Logo"
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        () => ({
          width: 64,
          height: 64,
          ...(!isSingle && { width: 80, height: 22 }),
          ...(disabled && { pointerEvents: "none" }),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {isSingle ? singleLogo : fullLogo}
    </LogoRoot>
  ) : (
    <Box
      aria-label="Logo"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        () => ({
          width: 64,
          height: 64,
          ...(!isSingle && { width: 80, height: 22 }),
          ...(disabled && { pointerEvents: "none" }),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {isSingle ? singleLogo : fullLogo}
    </Box>
  );
});

// ----------------------------------------------------------------------

const LogoRoot = styled(Link)(() => ({
  flexShrink: 0,
  color: "inherit",
  display: "inline-flex",
  verticalAlign: "middle",
}));
