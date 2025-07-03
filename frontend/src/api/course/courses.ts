import type { QueryType, ListQueryResponse } from "src/api/types";
import type { LevelType, ICourseListProps } from "src/types/course";

import { compact } from "lodash-es";
import { useQuery } from "@tanstack/react-query";

import { getListData, formatQueryParams } from "src/api/utils";

import { URLS } from "../urls";

const endpoint = URLS.COURSES;

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

type ICourse = {
  slug: string;
  translated_name: string;
  translated_description: string;
  level: ILevel;
  category: ICategory;
  technology: ITechnology;
  instructors: IInstructor[];
  duration: number;
  lessons_count: number;
  average_rating: number | null;
  ratings_count: number;
  students_count: number;
  progress?: number;
};

export const coursesQuery = (query?: QueryType) => {
  const url = endpoint;
  const urlParams = formatQueryParams(query);
  const queryUrl = urlParams ? `${url}?${urlParams}` : url;

  const queryFn = async (): Promise<ListQueryResponse<ICourseListProps[]>> => {
    const { results, records_count, pages_count } = await getListData<ICourse>(queryUrl);
    const modifiedResults: ICourseListProps[] = (results ?? []).map(
      ({
        translated_name,
        translated_description,
        level,
        category,
        technology,
        instructors,
        duration,
        lessons_count,
        average_rating,
        ratings_count,
        students_count,
        progress,
        ...rest
      }: ICourse) => ({
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
        technology: {
          slug: technology.slug,
          name: technology.name,
        },
        teachers: instructors.map(({ full_name, image, ...restInstructor }) => ({
          ...restInstructor,
          name: full_name,
          avatarUrl: image,
        })),
        totalHours: duration / 60,
        totalLessons: lessons_count,
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

export const useCourses = (query?: QueryType, enabled: boolean = true) => {
  const { queryKey, queryFn } = coursesQuery(query);
  const { data, ...rest } = useQuery({ queryKey, queryFn, enabled });
  return {
    data: data?.results,
    count: data?.count,
    pageSize: data?.pagesCount,
    ...rest,
  };
};
