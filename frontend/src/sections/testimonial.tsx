import type { BoxProps } from "@mui/material/Box";
import type { ITestimonialProps } from "src/types/testimonial";

import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import { fDate } from "src/utils/format-time";

import {
  Carousel,
  useCarousel,
  CarouselDotButtons,
  CarouselArrowBasicButtons,
} from "src/components/carousel";

// ----------------------------------------------------------------------

type TestimonialsProps = {
  testimonials: ITestimonialProps[];
} & BoxProps;

export function Testimonial({ testimonials, sx, ...other }: TestimonialsProps) {
  const { t } = useTranslation("testimonial");

  const carousel = useCarousel({
    slidesToShow: { xs: 1, sm: 2, md: 3, lg: 4 },
    slideSpacing: "24px",
  });

  return (
    <Box
      component="section"
      sx={[{ pt: 8, pb: 10 }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...other}
    >
      <Container>
        <Box sx={{ display: "flex", alignItems: "center", mb: { xs: 5, md: 8 } }}>
          <Typography variant="h2" sx={{ flexGrow: 1 }}>
            {t("title")}
          </Typography>

          <CarouselArrowBasicButtons
            {...carousel.arrows}
            options={carousel.options}
            sx={{ gap: 1 }}
          />
        </Box>

        <Carousel carousel={carousel}>
          {testimonials.map((testimonial, index) => (
            <TestimonialItem key={index} testimonial={testimonial} />
          ))}
        </Carousel>

        <CarouselDotButtons
          scrollSnaps={carousel.dots.scrollSnaps}
          selectedIndex={carousel.dots.selectedIndex}
          onClickDot={carousel.dots.onClickDot}
          sx={{
            mt: 5,
            width: 1,
            color: "primary.main",
            justifyContent: "center",
            display: { xs: "inline-flex", md: "none" },
          }}
        />
      </Container>
    </Box>
  );
}

// ----------------------------------------------------------------------

type TestimonialItemProps = BoxProps & {
  testimonial: ITestimonialProps;
};

function TestimonialItem({ testimonial, sx, ...other }: TestimonialItemProps) {
  return (
    <Box
      sx={[
        {
          p: 3,
          gap: 1,
          display: "flex",
          borderRadius: 2,
          flexDirection: "column",
          bgcolor: "background.neutral",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Typography variant="caption" sx={{ color: "text.disabled" }}>
        {fDate(testimonial.createdAt)}
      </Typography>
      <Typography variant="subtitle2">{testimonial.student.name}</Typography>
      <Rating size="small" value={testimonial.rating} readOnly />
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {testimonial.message}
      </Typography>
    </Box>
  );
}
