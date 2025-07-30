import type { CardProps } from "@mui/material";

import { useTranslation } from "react-i18next";

import { Box, Card } from "@mui/material";
import Typography from "@mui/material/Typography";

import { Player } from "src/components/player";

// ----------------------------------------------------------------------

type Props = CardProps & {
  url: string;
};

export function ProjectDetailsPreview({ url, sx, ...other }: Props) {
  const { t } = useTranslation("project");

  const renderPreview = () => (
    <Box
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        aspectRatio: "16 / 9",
      }}
    >
      <Player url={url} playing controls loop muted width="100%" height="100%" />
    </Box>
  );

  return (
    <Card
      sx={[
        { p: 3, gap: 2, borderRadius: 2, display: "flex", flexDirection: "column" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Typography component="h6" variant="h6">
        {t("preview")}
      </Typography>
      {renderPreview()}
    </Card>
  );
}
