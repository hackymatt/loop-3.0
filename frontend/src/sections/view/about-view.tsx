"use client";

import { useTranslation } from "react-i18next";

import { useRecentPosts } from "src/api/blog/recent";
import { useFeaturedPosts } from "src/api/blog/featured";
import { useFeaturedReviews } from "src/api/review/featured";

import { Faqs } from "../faqs";
import { Testimonial } from "../testimonial";
import { AboutHero } from "../about/about-hero";
import { LatestPosts } from "../posts/latest-posts";
import { AboutCoreValues } from "../about/about-core-values";
import { AboutOurMission } from "../about/about-our-mission";

import type { IFaqProps } from "../support/types";

// ----------------------------------------------------------------------

export function AboutView() {
  const { t } = useTranslation("faq");
  const faq = t("faq", { returnObjects: true }) as IFaqProps[];
  const courses = faq.filter((f) => f.id === "courses")[0].content;

  const { data: featuredReviews } = useFeaturedReviews();
  const { data: featuredPosts } = useFeaturedPosts();
  const { data: recentPosts } = useRecentPosts();

  return (
    <>
      <AboutHero />

      <AboutOurMission />

      <AboutCoreValues sx={{ bgcolor: "background.neutral" }} />

      {!!featuredReviews?.length && <Testimonial testimonials={featuredReviews || []} />}

      <Faqs data={courses} />

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
