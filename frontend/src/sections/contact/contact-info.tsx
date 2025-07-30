import type { BoxProps } from "@mui/material/Box";
import type { TypographyProps } from "@mui/material/Typography";

import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";

import { socials } from "src/consts/socials";
import { FacebookIcon, LinkedinIcon, InstagramIcon } from "src/assets/icons";

// ----------------------------------------------------------------------

export function ContactInfo({ sx, ...other }: BoxProps) {
  const { t } = useTranslation("contact");
  const renderSocials = () => (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      {socials.map((social) => (
        <IconButton key={social.label} href={social.url} target="_blank" rel="noopener noreferrer">
          {social.value === "facebook" && <FacebookIcon />}
          {social.value === "instagram" && <InstagramIcon />}
          {social.value === "linkedin" && <LinkedinIcon />}
        </IconButton>
      ))}
    </Box>
  );

  const typographyProps: TypographyProps = {
    variant: "subtitle2",
    sx: { mb: 1 },
  };

  return (
    <Box
      component="section"
      sx={[
        { pt: { xs: 3, md: 5 }, pb: { xs: 5, md: 10 }, textAlign: { xs: "center", md: "left" } },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Container>
        <Typography variant="h2">{t("title.header")}</Typography>

        <Typography variant="subtitle1" sx={{ mt: 2, mb: { xs: 3, md: 5 } }}>
          {t("subtitle.header")}
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: { xs: 3, md: 5 },
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
          }}
        >
          <div>
            <Typography {...typographyProps}>{t("emailLabel")}</Typography>
            <Link color="inherit" variant="body2" href="mailto:info@loop.edu.pl">
              info@loop.edu.pl
            </Link>
          </div>

          <div>
            <Typography {...typographyProps}>{t("phoneLabel")}</Typography>
            <Link color="inherit" variant="body2" href="tel:+48881455596">
              +48 881 455 596
            </Link>
          </div>

          <div>
            <Typography {...typographyProps}>{t("socialMedia")}</Typography>
            {renderSocials()}
          </div>
        </Box>
      </Container>
    </Box>
  );
}
