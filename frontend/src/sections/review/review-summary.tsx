import type { BoxProps } from "@mui/material/Box";

import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import { Button } from "@mui/material";
import Rating from "@mui/material/Rating";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { svgIconClasses } from "@mui/material/SvgIcon";

import { usePluralize } from "src/hooks/use-pluralize";

import { fShortenNumber } from "src/utils/format-number";

import { useAnalytics } from "src/app/analytics-provider";

import { Iconify } from "src/components/iconify";

import { ReviewProgress } from "./review-progress";

// ----------------------------------------------------------------------

type Props = BoxProps & {
  slug: string;
  isCompleted: boolean;
  reviewNumber: number;
  ratingNumber: number;
  onOpenForm: () => void;
};

export function ReviewSummary({
  sx,
  slug,
  isCompleted,
  reviewNumber,
  ratingNumber,
  onOpenForm,
  ...other
}: Props) {
  const { t } = useTranslation("course");
  const { t: locale } = useTranslation("locale");

  const { trackEvent } = useAnalytics();

  const review = t("review", { returnObjects: true }) as string[];

  const languagePluralize = usePluralize();
  return (
    <Box
      component="section"
      sx={[{ py: 10, bgcolor: "background.neutral" }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...other}
    >
      <Container>
        <Grid container spacing={{ xs: 5, md: 8 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: { xs: "center", md: "flex-start" },
              }}
            >
              <Typography variant="h3">{t("reviews.label")}</Typography>

              <Box sx={{ gap: 2, display: "flex", alignItems: "center", my: 3 }}>
                <Typography component="span" variant="h2">
                  {Number.isInteger(ratingNumber) ? `${ratingNumber}.0` : ratingNumber}
                </Typography>

                <div>
                  <Rating
                    value={ratingNumber}
                    readOnly
                    precision={0.1}
                    sx={{ mb: 0.5, [`& .${svgIconClasses.root}`]: { color: "warning.main" } }}
                  />
                  <Typography variant="body2">
                    {fShortenNumber(reviewNumber, {
                      code: locale("code"),
                      currency: locale("currency"),
                    })}{" "}
                    {languagePluralize(review, reviewNumber)}
                  </Typography>
                </div>
              </Box>

              {isCompleted && (
                <Button
                  size="large"
                  color="inherit"
                  variant="contained"
                  startIcon={<Iconify icon="solar:pen-2-outline" />}
                  onClick={() => {
                    onOpenForm();
                    trackEvent({ category: "review", label: "addReview" });
                  }}
                >
                  {t("reviews.button")}
                </Button>
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <ReviewProgress slug={slug} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
