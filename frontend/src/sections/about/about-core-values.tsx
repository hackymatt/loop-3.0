import type { BoxProps } from "@mui/material/Box";

import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import { CONFIG } from "src/global-config";

import { SvgColor } from "src/components/svg-color";

// ----------------------------------------------------------------------

type ICoreValue = {
  name: string;
  description: string;
  icon: string;
};

const iconPath = (name: string) => `${CONFIG.assetsDir}/assets/icons/solid-64/${name}`;

// ----------------------------------------------------------------------

export function AboutCoreValues({ sx, ...other }: BoxProps) {
  const { t } = useTranslation("about");
  const coreValues = t("coreValues.values", { returnObjects: true }) as ICoreValue[];
  return (
    <Box
      component="section"
      sx={[{ overflow: "hidden", py: { xs: 10, md: 15 } }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...other}
    >
      <Container>
        <Box
          sx={{
            gap: 3,
            display: "flex",
            mb: { xs: 5, md: 15 },
            justifyContent: { md: "space-between" },
            textAlign: { xs: "center", md: "left" },
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          <Typography variant="h2">{t("coreValues.title")}</Typography>

          <Typography sx={{ color: "text.secondary", maxWidth: { md: 540 } }}>
            {t("coreValues.subtitle")}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gap: { xs: 5, md: 8 },
            gridTemplateColumns: {
              xs: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
          }}
        >
          {coreValues.map((item) => (
            <Box key={item.name} sx={{ textAlign: { xs: "center", md: "unset" } }}>
              <SvgColor
                src={iconPath(item.icon)}
                sx={(theme) => ({
                  background: `linear-gradient(to bottom, ${theme.vars.palette.primary.light}, ${theme.vars.palette.primary.main})`,
                  width: 64,
                  height: 64,
                })}
              />

              <Typography component="h6" variant="h5" sx={{ mt: 3, mb: 1 }}>
                {item.name}
              </Typography>

              <Typography sx={{ color: "text.secondary" }}> {item.description} </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
