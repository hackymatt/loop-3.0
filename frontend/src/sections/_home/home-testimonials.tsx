import type { Variants } from "framer-motion";
import type { BoxProps } from "@mui/material/Box";
import type { ITestimonialProps } from "src/types/testimonial";

import { m } from "framer-motion";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import { Rating, Container, Typography } from "@mui/material";

import { varFade, MotionViewport } from "src/components/animate";
import {
  Carousel,
  useCarousel,
  CarouselDotButtons,
  CarouselArrowBasicButtons,
} from "src/components/carousel";

// ----------------------------------------------------------------------

const variants: Variants = varFade("inUp", { distance: 24 });

type TestimonialsProps = {
  testimonials: ITestimonialProps[];
} & BoxProps;

export function HomeTestimonials({ testimonials, sx, ...other }: TestimonialsProps) {
  const { t } = useTranslation("home");

  const carousel = useCarousel();

  return (
    <Box
      component="section"
      sx={[
        { py: { xs: 10, md: 15 }, bgcolor: "background.neutral" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Container component={MotionViewport}>
        <Box sx={{ maxWidth: 560, mx: "auto" }}>
          <m.div variants={variants}>
            <Typography variant="h2" sx={{ mb: 5, textAlign: "center" }}>
              {t("testimonial")}
            </Typography>
          </m.div>

          <m.div variants={variants}>
            <Carousel carousel={carousel}>
              {testimonials.map((testimonial, index) => (
                <TestimonialItem key={index} testimonial={testimonial} />
              ))}
            </Carousel>
          </m.div>

          <CarouselArrowBasicButtons
            {...carousel.arrows}
            options={carousel.options}
            sx={{
              mt: 10,
              gap: 1,
              width: 1,
              justifyContent: "center",
              display: { xs: "none", md: "flex" },
            }}
          />

          <CarouselDotButtons
            scrollSnaps={carousel.dots.scrollSnaps}
            selectedIndex={carousel.dots.selectedIndex}
            onClickDot={carousel.dots.onClickDot}
            sx={{
              mt: 5,
              width: 1,
              color: "primary.main",
              justifyContent: "center",
              display: { xs: "flex", md: "none" },
            }}
          />
        </Box>
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
        { display: "flex", textAlign: "center", alignItems: "center", flexDirection: "column" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Rating value={testimonial.rating} readOnly />
      <Typography sx={{ my: 3, lineHeight: 1.75, fontSize: { md: 20 } }}>
        {testimonial.message}
      </Typography>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {testimonial.student.name}
      </Typography>
    </Box>
  );
}
