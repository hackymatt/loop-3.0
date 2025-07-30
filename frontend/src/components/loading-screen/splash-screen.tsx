"use client";

import type { Theme, SxProps } from "@mui/material/styles";

import { m } from "framer-motion";

import Portal from "@mui/material/Portal";
import { styled } from "@mui/material/styles";

import { Logo } from "../logo";

// ----------------------------------------------------------------------

export type SplashScreenProps = React.ComponentProps<"div"> & {
  portal?: boolean;
  sx?: SxProps<Theme>;
};

export function SplashScreen({ portal = true, sx, ...other }: SplashScreenProps) {
  const animateLogo = () => (
    <m.div
      animate={{
        scale: [1, 0.96, 1, 0.96, 1],
        opacity: [1, 0.48, 1, 0.48, 1],
      }}
      transition={{
        duration: 2,
        repeatDelay: 1,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <Logo disabled isSingle sx={{ width: 64, height: 64 }} />
    </m.div>
  );

  const content = () => (
    <div style={{ overflow: "hidden" }}>
      <LoadingContent sx={sx} {...other}>
        {animateLogo()}
      </LoadingContent>
    </div>
  );

  if (portal) {
    return <Portal>{content()}</Portal>;
  }

  return content();
}

// ----------------------------------------------------------------------

const LoadingContent = styled("div")(({ theme }) => ({
  right: 0,
  bottom: 0,
  zIndex: 9998,
  width: "100%",
  height: "100%",
  display: "flex",
  position: "fixed",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.vars.palette.background.default,
}));
