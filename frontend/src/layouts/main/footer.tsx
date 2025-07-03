import type { BoxProps } from "@mui/material/Box";
import type { Theme, SxProps, Breakpoint } from "@mui/material/styles";

import { useTranslation } from "react-i18next";
import { isEqualPath } from "minimal-shared/utils";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid2";
import Divider from "@mui/material/Divider";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";

import { paths } from "src/routes/paths";
import { usePathname } from "src/routes/hooks";
import { RouterLink } from "src/routes/components";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { socials } from "src/consts/socials";
import { FacebookIcon, LinkedinIcon, InstagramIcon } from "src/assets/icons";

import { Logo } from "src/components/logo";
import { useUserContext } from "src/components/user";
import { AppStoreButton } from "src/components/app-store";

import { usePageLinks } from "../nav-config-main";

// ----------------------------------------------------------------------

export type FooterProps = BoxProps & {
  layoutQuery?: Breakpoint;
};

export function Footer({ layoutQuery = "md", sx, ...other }: FooterProps) {
  const { t } = useTranslation("navigation");
  const localize = useLocalizedPath();

  const user = useUserContext();
  const { isLoggedIn } = user.state;

  const currentYear = new Date().getFullYear();

  const listItems = usePageLinks();

  const pathname = usePathname();

  const renderInfo = () => <Logo />;

  const renderRoutes = () => (
    <>
      <Link
        component={RouterLink}
        href={localize(paths.courses)}
        variant="body2"
        sx={{ color: "text.primary" }}
      >
        {t("courses")}
      </Link>

      {!isLoggedIn && (
        <Link
          component={RouterLink}
          href={localize(paths.pricing)}
          variant="body2"
          sx={{ color: "text.primary" }}
        >
          {t("pricing")}
        </Link>
      )}

      <Link
        component={RouterLink}
        href={localize(paths.posts)}
        variant="body2"
        sx={{ color: "text.primary" }}
      >
        {t("blog")}
      </Link>

      {!isLoggedIn && (
        <Link
          component={RouterLink}
          href={localize(paths.about)}
          variant="body2"
          sx={{ color: "text.primary" }}
        >
          {t("about")}
        </Link>
      )}

      <Link
        component={RouterLink}
        href={localize(paths.contact)}
        variant="body2"
        sx={{ color: "text.primary" }}
      >
        {t("contact")}
      </Link>

      <Link
        component={RouterLink}
        href={localize(paths.support)}
        variant="body2"
        sx={{ color: "text.primary" }}
      >
        {t("support")}
      </Link>
    </>
  );

  const renderSocials = () => (
    <>
      <Typography variant="h6">{t("socialMedia")}</Typography>

      <Box sx={{ display: "flex", justifyContent: "center" }}>
        {socials.map((social) => (
          <IconButton
            key={social.label}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {social.value === "facebook" && <FacebookIcon />}
            {social.value === "instagram" && <InstagramIcon />}
            {social.value === "linkedin" && <LinkedinIcon />}
          </IconButton>
        ))}
      </Box>
    </>
  );

  const renderApps = () => (
    <>
      <Typography variant="h6">{t("apps")}</Typography>

      <Box
        sx={{
          gap: 2,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <AppStoreButton />
      </Box>
    </>
  );

  const renderList = () => (
    <Box
      component="ul"
      sx={(theme) => ({
        columnGap: 2,
        display: "none",
        columnCount: { xs: 3, lg: 4 },
        [theme.breakpoints.up(layoutQuery)]: {
          display: "block",
        },
      })}
    >
      {listItems.map((list) => (
        <Box
          component="li"
          key={list.subheader}
          sx={{
            mb: 2,
            gap: 1.25,
            display: "flex",
            breakInside: "avoid",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <Typography variant="subtitle2">{list.subheader}</Typography>

          <Box component="ul" sx={{ gap: "inherit", display: "flex", flexDirection: "column" }}>
            {list.items.map((item) => {
              const isActive = isEqualPath(item.path, pathname);

              return (
                <Box component="li" key={item.title} sx={{ display: "inline-flex" }}>
                  <Link
                    component={RouterLink}
                    href={item.path}
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      "&:hover": { color: "text.primary" },
                      ...(isActive && { color: "text.primary", fontWeight: "fontWeightSemiBold" }),
                    }}
                  >
                    {item.title}
                  </Link>
                </Box>
              );
            })}
          </Box>
        </Box>
      ))}
    </Box>
  );

  const renderTop = () => (
    <Container sx={{ py: 10 }}>
      <Grid container spacing={3} justifyContent={{ md: "space-between" }}>
        <Grid
          size={{ xs: 12, md: 5, lg: 4 }}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: { xs: 3, md: 5 },
          }}
        >
          <Box sx={[(theme) => ({ ...blockStyles(theme, layoutQuery) }), { gap: 3 }]}>
            {renderInfo()}
          </Box>

          <Box sx={[(theme) => ({ ...blockStyles(theme, layoutQuery) }), { gap: 1 }]}>
            {renderRoutes()}
          </Box>

          <Box sx={[(theme) => ({ ...blockStyles(theme, layoutQuery) })]}>{renderSocials()}</Box>

          <Box sx={[(theme) => ({ ...blockStyles(theme, layoutQuery) })]}>{renderApps()}</Box>
        </Grid>

        <Grid component="nav" size={{ xs: 12, md: 6, lg: 6 }}>
          {renderList()}
        </Grid>
      </Grid>
    </Container>
  );

  const renderBottom = () => (
    <Container
      sx={{
        py: 3,
        gap: 2.5,
        display: "flex",
        textAlign: "center",
        color: "text.secondary",
        justifyContent: "space-between",
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      <Typography variant="caption">
        © {currentYear} {t("allRightsReserved")}
      </Typography>

      <Box
        component="span"
        sx={{
          gap: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Link
          variant="caption"
          color="inherit"
          component={RouterLink}
          href={localize(paths.privacyPolicy)}
        >
          {t("privacyPolicy")}
        </Link>
        <Box
          sx={{
            width: 3,
            height: 3,
            opacity: 0.4,
            borderRadius: "50%",
            bgcolor: "currentColor",
          }}
        />
        <Link
          variant="caption"
          color="inherit"
          component={RouterLink}
          href={localize(paths.termsOfService)}
        >
          {t("termsOfService")}
        </Link>
      </Box>
    </Container>
  );

  return (
    <Box
      component="footer"
      sx={[
        (theme) => ({
          borderTop: `solid 1px ${theme.vars.palette.divider}`,
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {renderTop()}
      <Divider />
      {renderBottom()}
    </Box>
  );
}

// ----------------------------------------------------------------------

const blockStyles = (theme: Theme, layoutQuery: Breakpoint): SxProps<Theme> => ({
  gap: 2,
  display: "flex",
  textAlign: "center",
  alignItems: "center",
  flexDirection: "column",
  [theme.breakpoints.up(layoutQuery)]: {
    textAlign: "left",
    alignItems: "flex-start",
  },
});
