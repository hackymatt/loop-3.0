import type { IPlanProps } from "src/types/plan";
import type { Language } from "src/locales/types";
import type { ITestimonialProps } from "src/types/testimonial";
import type { IBlogRecentProps, IBlogFeaturedPost } from "src/types/blog";
import type { IProjectListProps, IProjectTechnologyProp } from "src/types/project";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";
import { plansQuery } from "src/api/plan/plans";
import { recentPostsQuery } from "src/api/blog/recent";
import { featuredPostsQuery } from "src/api/blog/featured";
import { featuredReviewsQuery } from "src/api/review/featured";
import { featuredProjectsQuery } from "src/api/project/featured";
import { featuredTechnologiesQuery } from "src/api/project/technology/featured";

import { HomeView } from "src/sections/view/home-view";

// ----------------------------------------------------------------------

const queries = {
  featuredProjects: featuredProjectsQuery,
  featuredTechnologies: featuredTechnologiesQuery,
  featuredReviews: featuredReviewsQuery,
  featuredPosts: featuredPostsQuery,
  recentPosts: recentPostsQuery,
  plans: plansQuery,
};

async function getData(language: Language) {
  const entries = await Promise.all(
    Object.entries(queries).map(async ([key, queryFnBuilder]) => {
      const { queryFn } = queryFnBuilder(language);
      const { results } = await queryFn();
      return [key, results] as const;
    })
  );

  return Object.fromEntries(entries) as {
    featuredProjects: IProjectListProps[];
    featuredTechnologies: IProjectTechnologyProp[];
    featuredReviews: ITestimonialProps[];
    featuredPosts: IBlogFeaturedPost[];
    recentPosts: IBlogRecentProps[];
    plans: IPlanProps[];
  };
}

export default async function Page({ params }: { params: { locale: Language } }) {
  const data = await getData(params.locale);
  return <HomeView data={data} />;
}

export async function generateMetadata({ params }: { params: { locale: Language } }) {
  const translations = await import(`public/locales/${params.locale}/home.json`);
  const path = params.locale === LANGUAGE.PL ? "" : `/${LANGUAGE.EN}`;

  return createMetadata({
    title: translations.meta.title,
    description: translations.meta.description,
    path,
  });
}
