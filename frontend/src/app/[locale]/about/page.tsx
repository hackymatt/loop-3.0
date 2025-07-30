import type { Language } from "src/locales/types";
import type { ITestimonialProps } from "src/types/testimonial";
import type { IBlogRecentProps, IBlogFeaturedPost } from "src/types/blog";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";
import { recentPostsQuery } from "src/api/blog/recent";
import { featuredPostsQuery } from "src/api/blog/featured";
import { featuredReviewsQuery } from "src/api/review/featured";

import { AboutView } from "src/sections/view/about-view";

// ----------------------------------------------------------------------
type PageProps = {
  params: { locale: Language };
};

const queries = {
  featuredReviews: (lang: Language) => featuredReviewsQuery(lang),
  featuredPosts: (lang: Language) => featuredPostsQuery(lang),
  recentPosts: (lang: Language) => recentPostsQuery(lang),
};

async function getData(language: Language) {
  const entries = await Promise.all(
    Object.entries(queries).map(async ([key, getQuery]) => {
      const { queryFn } = getQuery(language);
      const { results } = await queryFn();
      return [key, results] as const;
    })
  );

  return Object.fromEntries(entries) as {
    featuredReviews: ITestimonialProps[];
    featuredPosts: IBlogFeaturedPost[];
    recentPosts: IBlogRecentProps[];
  };
}

export default async function Page({ params }: PageProps) {
  const data = await getData(params.locale as Language);
  return <AboutView data={data} />;
}

export async function generateMetadata({ params }: PageProps) {
  const translations = await import(`public/locales/${params.locale}/about.json`);

  const path = params.locale === LANGUAGE.PL ? paths.about : `/${LANGUAGE.EN}${paths.about}`;

  return createMetadata({
    title: translations.meta.title,
    description: translations.meta.description,
    path,
  });
}
