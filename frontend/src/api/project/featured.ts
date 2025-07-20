import type { Language } from "src/locales/types";
import type { GetQueryResponse } from "src/api/types";
import type { LevelType, IProjectListProps } from "src/types/project";

import { compact } from "lodash-es";

import { getSimpleListData } from "src/api/utils";

import { URLS } from "../urls";

const endpoint = URLS.FEATURED_PROJECTS;

type ILevel = {
  slug: string;
  translated_name: string;
};

type ICategory = {
  slug: string;
  translated_name: string;
};

type ITechnology = {
  slug: string;
  name: string;
};

type IInstructor = {
  full_name: string;
  image: string | null;
  role: string;
};

type IProject = {
  slug: string;
  translated_name: string;
  translated_description: string;
  level: ILevel;
  category: ICategory;
  technologies: ITechnology[];
  instructors: IInstructor[];
  duration: number;
  stages_count: number;
  average_rating: number | null;
  ratings_count: number;
  students_count: number;
};

export const featuredProjectsQuery = (language: Language) => {
  const url = endpoint;
  const queryUrl = url;

  const queryFn = async (): Promise<GetQueryResponse<IProjectListProps[]>> => {
    const results = await getSimpleListData<IProject>(queryUrl, {
      headers: { "Accept-Language": language },
    });
    const modifiedResults: IProjectListProps[] = (results ?? []).map(
      ({
        translated_name,
        translated_description,
        level,
        category,
        technologies,
        instructors,
        duration,
        stages_count,
        average_rating,
        ratings_count,
        students_count,
        ...rest
      }: IProject) => ({
        ...rest,
        name: translated_name,
        description: translated_description,
        level: {
          slug: level.slug as LevelType,
          name: level.translated_name,
        },
        category: {
          slug: category.slug,
          name: category.translated_name,
        },
        technologies: technologies.map((technology) => ({
          slug: technology.slug,
          name: technology.name,
        })),
        teachers: instructors.map(({ full_name, image, ...restInstructor }) => ({
          ...restInstructor,
          name: full_name,
          avatarUrl: image,
        })),
        totalHours: duration / 60,
        totalStages: stages_count,
        ratingNumber: average_rating,
        totalReviews: ratings_count,
        totalStudents: students_count,
        progress: null,
      })
    );
    return { results: modifiedResults };
  };

  return { url, queryFn, queryKey: compact([url]) };
};
