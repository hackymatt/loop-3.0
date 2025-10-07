"use client";

import type { IPlanProps } from "src/types/plan";
import type { FabProps } from "@mui/material/Fab";
import type { Language } from "src/locales/types";
import type { UseBackToTopReturn } from "minimal-shared/hooks";
import type { ITestimonialProps } from "src/types/testimonial";
import type { IBlogRecentProps, IBlogFeaturedPost } from "src/types/blog";
import type { IProjectListProps, IProjectTechnologyProp } from "src/types/project";

import { useBackToTop } from "minimal-shared/hooks";

import Fab from "@mui/material/Fab";
import SvgIcon from "@mui/material/SvgIcon";

import { ScrollProgress, useScrollProgress } from "src/components/animate/scroll-progress";

import { HomeHero } from "../_home/home-hero";
import { HomeFAQs } from "../_home/home-faqs";
import { HomePricing } from "../_home/home-pricing";
import { HomeNewStart } from "../_home/home-new-start";
import { HomeCertificate } from "../_home/home-certificate";
import { HomeLatestPosts } from "../_home/home-latest-posts";
import { HomeDownloadApp } from "../_home/home-download-app";
import { HomeTestimonials } from "../_home/home-testimonials";
import { HomeAdvertisement } from "../_home/home-advertisement";
import { HomeFeaturedProjects } from "../_home/home-featured-projects";
import { HomeFeatureTechnologies } from "../_home/home-feature-technologies";

// ----------------------------------------------------------------------
type HomeViewProps = {
  data: {
    featuredProjects: IProjectListProps[];
    featuredTechnologies: IProjectTechnologyProp[];
    featuredReviews: ITestimonialProps[];
    featuredPosts: IBlogFeaturedPost[];
    recentPosts: IBlogRecentProps[];
    plans: IPlanProps[];
  };
  language: Language;
};

export function HomeView({ data, language }: HomeViewProps) {
  const pageProgress = useScrollProgress();

  const { onBackToTop, isVisible } = useBackToTop("90%");

  const {
    featuredProjects,
    featuredTechnologies,
    featuredReviews,
    featuredPosts,
    recentPosts,
    plans,
  } = data;

  return (
    <>
      <ScrollProgress
        variant="linear"
        progress={pageProgress.scrollYProgress}
        sx={{ position: "fixed" }}
      />

      <BackToTopButton isVisible={isVisible} onClick={onBackToTop} />

      <HomeHero language={language} />

      <HomeNewStart />

      <HomeCertificate />

      {!!featuredProjects?.length && <HomeFeaturedProjects projects={featuredProjects} isHome />}

      {!!featuredTechnologies?.length && (
        <HomeFeatureTechnologies technologies={featuredTechnologies} />
      )}

      <HomePricing plans={plans} />

      <HomeFAQs />

      {!!featuredReviews?.length && <HomeTestimonials testimonials={featuredReviews} />}

      {!!featuredPosts?.length && !!recentPosts?.length && (
        <HomeLatestPosts featuredPost={featuredPosts[0]} recentPosts={recentPosts} />
      )}

      <HomeAdvertisement />

      <HomeDownloadApp />
    </>
  );
}

// ----------------------------------------------------------------------

type BackToTopProps = FabProps & {
  isVisible: UseBackToTopReturn["isVisible"];
};

function BackToTopButton({ isVisible, sx, ...other }: BackToTopProps) {
  return (
    <Fab
      aria-label="Back to top"
      sx={[
        (theme) => ({
          width: 48,
          height: 48,
          position: "fixed",
          transform: "scale(0)",
          right: { xs: 24, md: 32 },
          bottom: { xs: 24, md: 32 },
          zIndex: theme.zIndex.speedDial,
          transition: theme.transitions.create(["transform"]),
          ...(isVisible && { transform: "scale(1)" }),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <SvgIcon>
        {/* https://icon-sets.iconify.design/solar/double-alt-arrow-up-bold-duotone/ */}
        <path
          fill="currentColor"
          d="M5 17.75a.75.75 0 0 1-.488-1.32l7-6a.75.75 0 0 1 .976 0l7 6A.75.75 0 0 1 19 17.75z"
          opacity="0.5"
        />
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M4.43 13.488a.75.75 0 0 0 1.058.081L12 7.988l6.512 5.581a.75.75 0 1 0 .976-1.138l-7-6a.75.75 0 0 0-.976 0l-7 6a.75.75 0 0 0-.081 1.057"
          clipRule="evenodd"
        />
      </SvgIcon>
    </Fab>
  );
}
