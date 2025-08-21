import type { Language } from "src/locales/types";
import type { QueryType, ListQueryResponse } from "src/api/types";
import type { LevelType, IProjectListProps } from "src/types/project";

import { compact } from "lodash-es";
import { cookies } from "next/headers";

import { getListData, formatQueryParams } from "src/api/utils";

import { URLS } from "../urls";

const endpoint = URLS.PROJECTS;

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
  progress?: number;
};

export const projectsQuery = (language: Language, query?: QueryType) => {
  const url = endpoint;
  const urlParams = formatQueryParams(query);
  const queryUrl = urlParams ? `${url}?${urlParams}` : url;

  const queryFn = async (): Promise<ListQueryResponse<IProjectListProps[]>> => {
    const {
      data: { results, records_count, pages_count },
    } = await getListData<IProject>(queryUrl, {
      headers: { "Accept-Language": language, Cookie: cookies().toString() },
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
        progress,
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
        technologies: technologies.map((technology: ITechnology) => ({
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
        progress: progress ?? null,
      })
    );
    return { results: modifiedResults, count: records_count, pagesCount: pages_count };
  };

  return { url, queryFn, queryKey: compact([url, urlParams]) };
};
