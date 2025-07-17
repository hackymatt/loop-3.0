"use client";

import type { ITestimonialProps } from "src/types/testimonial";
import type { IBlogRecentProps, IBlogFeaturedPost } from "src/types/blog";

import { useTranslation } from "react-i18next";

import { Faqs } from "../faqs";
import { Testimonial } from "../testimonial";
import { AboutHero } from "../about/about-hero";
import { LatestPosts } from "../posts/latest-posts";
import { AboutCoreValues } from "../about/about-core-values";
import { AboutOurMission } from "../about/about-our-mission";

import type { IFaqProps } from "../support/types";

// ----------------------------------------------------------------------

type AboutViewProps = {
  data: {
    featuredReviews: ITestimonialProps[];
    featuredPosts: IBlogFeaturedPost[];
    recentPosts: IBlogRecentProps[];
  };
};

export function AboutView({ data }: AboutViewProps) {
  const { t } = useTranslation("faq");
  const faq = t("faq", { returnObjects: true }) as IFaqProps[];
  const projects = faq.filter((f) => f.id === "projects")[0].content;

  const { featuredReviews, featuredPosts, recentPosts } = data;

  return (
    <>
      <AboutHero />

      <AboutOurMission />

      <AboutCoreValues sx={{ bgcolor: "background.neutral" }} />

      {!!featuredReviews?.length && <Testimonial testimonials={featuredReviews || []} />}

      <Faqs data={projects} />

      {!!featuredPosts?.length && !!recentPosts?.length && (
        <LatestPosts
          largePost={featuredPosts[0]}
          smallPosts={recentPosts}
          sx={{ bgcolor: "background.neutral" }}
        />
      )}
    </>
  );
}
