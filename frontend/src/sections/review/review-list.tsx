import type { BoxProps } from "@mui/material/Box";
import type { IReviewItemProp } from "src/types/review";

import Box from "@mui/material/Box";
import Pagination, { paginationClasses } from "@mui/material/Pagination";

import { ReviewItem } from "./review-item";

// ----------------------------------------------------------------------

type Props = BoxProps & {
  reviews: IReviewItemProp[];
  recordsCount: number;
  pagesCount: number;
  page: number;
  onPageChange: (selectedPage: number) => void;
};

export function ReviewList({
  reviews,
  recordsCount,
  pagesCount,
  page,
  onPageChange,
  sx,
  ...other
}: Props) {
  return (
    <Box sx={[{ pt: 5 }, ...(Array.isArray(sx) ? sx : [sx])]} {...other}>
      {reviews.map((review, index) => (
        <ReviewItem
          key={index}
          student={review.student}
          createdAt={review.createdAt}
          message={review.message}
          rating={review.rating}
        />
      ))}

      {recordsCount ? (
        <Pagination
          count={pagesCount}
          page={page}
          onChange={(event, selectedPage: number) => onPageChange(selectedPage)}
          sx={{ mt: 5, mb: 10, [`& .${paginationClasses.ul}`]: { justifyContent: "center" } }}
        />
      ) : null}
    </Box>
  );
}
