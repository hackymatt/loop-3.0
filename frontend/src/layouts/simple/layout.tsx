"use client";

import type { Breakpoint } from "@mui/material/styles";

import { merge } from "es-toolkit";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { CONFIG } from "src/global-config";

import { Logo } from "src/components/logo";

import { langs } from "../langs-config";
import { SimpleCompactContent } from "./content";
import { MainSection } from "../core/main-section";
import { LayoutSection } from "../core/layout-section";
import { HeaderSection } from "../core/header-section";
import { ThemeButton } from "../components/theme-button";
import { SettingsButton } from "../components/settings-button";
import { LanguagePopover } from "../components/language-popover";

import type { SimpleCompactContentProps } from "./content";
import type { MainSectionProps } from "../core/main-section";
import type { HeaderSectionProps } from "../core/header-section";
import type { LayoutSectionProps } from "../core/layout-section";

// ----------------------------------------------------------------------

type LayoutBaseProps = Pick<LayoutSectionProps, "sx" | "children" | "cssVars">;

export type SimpleLayoutProps = LayoutBaseProps & {
  layoutQuery?: Breakpoint;
  slotProps?: {
    header?: HeaderSectionProps;
    main?: MainSectionProps;
    content?: SimpleCompactContentProps & { compact?: boolean };
  };
};

export function SimpleLayout({
  sx,
  cssVars,
  children,
  slotProps,
  layoutQuery = "md",
}: SimpleLayoutProps) {
  const { t } = useTranslation("navigation");
  const localize = useLocalizedPath();

  const renderHeader = () => {
    const headerSlotProps: HeaderSectionProps["slotProps"] = { container: { maxWidth: false } };

    const headerSlots: HeaderSectionProps["slots"] = {
      leftArea: (
        <>
          {/** @slot Logo */}
          <Logo sx={{ mt: 0.5 }} />
        </>
      ),
      rightArea: (
        <Box sx={{ gap: 1, display: "flex", alignItems: "center" }}>
          {/** @slot Help link */}
          <Link
            component={RouterLink}
            href={localize(paths.support)}
            color="inherit"
            sx={{ typography: "subtitle2" }}
          >
            {t("help")}
          </Link>

          {/** @slot Language popover */}
          {CONFIG.isLocal && <LanguagePopover data={langs} />}

          {/** @slot Theme button */}
          {CONFIG.isLocal && <ThemeButton />}

          {/** @slot Settings button */}
          {CONFIG.isLocal && <SettingsButton />}
        </Box>
      ),
    };

    return (
      <HeaderSection
        layoutQuery={layoutQuery}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
        sx={slotProps?.header?.sx}
      />
    );
  };

  const renderFooter = () => null;

  const renderMain = () => {
    const { compact, ...restContentProps } = slotProps?.content ?? {};

    return (
      <MainSection {...slotProps?.main}>
        {compact ? (
          <SimpleCompactContent layoutQuery={layoutQuery} {...restContentProps}>
            {children}
          </SimpleCompactContent>
        ) : (
          children
        )}
      </MainSection>
    );
  };

  return (
    <LayoutSection
      /** **************************************
       * @Header
       *************************************** */
      headerSection={renderHeader()}
      /** **************************************
       * @Footer
       *************************************** */
      footerSection={renderFooter()}
      /** **************************************
       * @Styles
       *************************************** */
      cssVars={{ "--layout-simple-content-compact-width": "448px", ...cssVars }}
      sx={sx}
    >
      {renderMain()}
    </LayoutSection>
  );
}
