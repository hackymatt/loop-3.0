"use client";

import type { Breakpoint } from "@mui/material/styles";

import Box from "@mui/material/Box";
import { Toolbar, Container } from "@mui/material";

import { CONFIG } from "src/global-config";

import { Logo } from "src/components/logo";
import { useUserContext } from "src/components/user";
import { MegaMenuMobile, MegaMenuHorizontal } from "src/components/mega-menu";

import { Footer } from "./footer";
import { langs } from "../langs-config";
import { useNavData } from "../nav-config-main";
import { MainSection } from "../core/main-section";
import { Searchbar } from "../components/searchbar";
import { MenuButton } from "../components/menu-button";
import { LayoutSection } from "../core/layout-section";
import { HeaderSection } from "../core/header-section";
import { LoginButton } from "../components/login-button";
import { ThemeButton } from "../components/theme-button";
import { UpgradeButton } from "../components/upgrade-button";
import { RegisterButton } from "../components/register-button";
import { SettingsButton } from "../components/settings-button";
import { LanguagePopover } from "../components/language-popover";
import { NavAccountPopover } from "./nav/components/nav-account";

import type { FooterProps } from "./footer";
import type { NavMainProps } from "./nav/types";
import type { MainSectionProps } from "../core/main-section";
import type { HeaderSectionProps } from "../core/header-section";
import type { LayoutSectionProps } from "../core/layout-section";

// ----------------------------------------------------------------------

type LayoutBaseProps = Pick<LayoutSectionProps, "sx" | "children" | "cssVars">;

export type MainLayoutProps = LayoutBaseProps & {
  layoutQuery?: Breakpoint;
  slotProps?: {
    header?: HeaderSectionProps;
    nav?: {
      data?: NavMainProps["data"];
    };
    main?: MainSectionProps;
    footer?: FooterProps;
  };
};

export function MainLayout({
  sx,
  cssVars,
  children,
  slotProps,
  layoutQuery = "md",
}: MainLayoutProps) {
  const user = useUserContext();
  const { isLoggedIn } = user.state;

  const navData = useNavData();

  const renderHeader = () => {
    const headerSlots: HeaderSectionProps["slots"] = {
      leftArea: (
        <>
          {/** @slot Nav mobile */}
          <MegaMenuMobile
            data={navData}
            slots={{
              button: (
                <MenuButton
                  sx={(theme) => ({
                    mr: 1,
                    ml: -1,
                    [theme.breakpoints.up(layoutQuery)]: { display: "none" },
                  })}
                />
              ),
              topArea: (
                <Box
                  sx={{
                    pt: 3,
                    pb: 2,
                    pl: 2.5,
                    display: "flex",
                  }}
                >
                  <Logo />
                </Box>
              ),
              bottomArea: (
                <Box sx={{ py: 3, px: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
                  {isLoggedIn ? (
                    <>
                      {/* @slot Upgrade button */}
                      <UpgradeButton
                        sx={{ width: 1 }}
                        slotProps={{
                          button: {
                            fullWidth: true,
                            size: "large",
                          },
                        }}
                      />
                    </>
                  ) : (
                    <>
                      {/* @slot Login button */}
                      <LoginButton
                        sx={{ width: 1 }}
                        slotProps={{
                          button: {
                            fullWidth: true,
                            size: "medium",
                          },
                        }}
                      />
                      {/* @slot Register button */}
                      <RegisterButton
                        sx={{ width: 1 }}
                        slotProps={{
                          button: {
                            fullWidth: true,
                            size: "large",
                          },
                        }}
                      />
                    </>
                  )}
                </Box>
              ),
            }}
          />

          {/** @slot Logo */}
          <Logo sx={{ mt: 0.5 }} />
        </>
      ),
      centerArea: (
        <Toolbar
          component={Container}
          sx={{ display: "flex", justifyContent: "center", width: "100%" }}
        >
          <MegaMenuHorizontal
            data={navData}
            slotProps={{
              rootItem: {
                sx: {},
                icon: {},
                title: {},
                info: {},
                arrow: {},
              },
              subItem: {},
              dropdown: {},
              subheader: {},
              tags: {},
              moreLink: {},
              carousel: { sx: {}, options: {} },
              masonry: { sx: {}, columns: 3, defaultColumns: 3 },
            }}
            sx={(theme) => ({
              display: "none",
              [theme.breakpoints.up(layoutQuery)]: { display: "flex" },
            })}
          />
        </Toolbar>
      ),
      rightArea: (
        <Box sx={{ gap: 1, display: "flex", alignItems: "center" }}>
          {/** @slot Searchbar */}
          {CONFIG.isLocal && <Searchbar />}

          {/** @slot Language popover */}
          <LanguagePopover data={langs} />

          {/** @slot Theme button */}
          {CONFIG.isLocal && <ThemeButton />}

          {/** @slot Settings button */}
          {CONFIG.isLocal && <SettingsButton />}

          {isLoggedIn ? (
            <>
              {/* @slot Upgrade button */}
              <UpgradeButton sx={{ display: { xs: "none", [layoutQuery]: "inline-flex" } }} />
              {/* @slot Account button */}
              <NavAccountPopover />
            </>
          ) : (
            <>
              {/* @slot Login button */}
              <LoginButton sx={{ display: { xs: "none", [layoutQuery]: "inline-flex" } }} />

              {/* @slot Register button */}
              <RegisterButton sx={{ display: { xs: "none", [layoutQuery]: "inline-flex" } }} />
            </>
          )}
        </Box>
      ),
    };

    return (
      <HeaderSection
        layoutQuery={layoutQuery}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={slotProps?.header?.slotProps}
        sx={slotProps?.header?.sx}
      />
    );
  };

  const renderFooter = () => <Footer layoutQuery={layoutQuery} />;

  const renderMain = () => <MainSection {...slotProps?.main}>{children}</MainSection>;

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
      cssVars={cssVars}
      sx={sx}
    >
      {renderMain()}
    </LayoutSection>
  );
}
