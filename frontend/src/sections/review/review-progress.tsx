import type { BoxProps } from "@mui/material/Box";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";

import { fShortenNumber } from "src/utils/format-number";

import { useReviewsSummary } from "src/api/review/summary";

import { Iconify } from "src/components/iconify";

// ----------------------------------------------------------------------

const RATINGS = Array.from({ length: 5 }, (_, i) => 5 - i);

type ReviewProgressProps = {
  slug: string;
} & BoxProps;

// ----------------------------------------------------------------------

export function ReviewProgress({ slug, sx, ...other }: ReviewProgressProps) {
  const { t: locale } = useTranslation("locale");

  const { data: reviewsSummary } = useReviewsSummary(slug);

  const ratings = useMemo(
    () =>
      RATINGS.map((rating) => {
        const ratingData = reviewsSummary?.find((item) => item.rating === rating);
        return {
          value: `${rating}start`,
          number: ratingData?.count || 0,
        };
      }),
    [reviewsSummary]
  );

  const totals = ratings
    .map((rating) => rating.number)
    .reduce((accumulator: number, curr: number) => accumulator + curr);

  return (
    <Box
      sx={[
        { gap: 2, display: "flex", flexDirection: "column" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {ratings.map((rating, index) => (
        <Box key={rating.value} sx={{ display: "flex", alignItems: "center" }}>
          <Box sx={{ mr: 0.5, width: 12, textAlign: "center", typography: "subtitle2" }}>
            {5 - index}
          </Box>

          <Iconify width={16} icon="eva:star-fill" sx={{ color: "warning.main" }} />

          <LinearProgress
            color="inherit"
            variant="determinate"
            value={(rating.number / totals) * 100}
            sx={{ mx: 2, width: 1, height: 6 }}
          />

          <Typography variant="body2" sx={{ minWidth: 40, color: "text.disabled" }}>
            {fShortenNumber(rating.number, { code: locale("code"), currency: locale("currency") })}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
