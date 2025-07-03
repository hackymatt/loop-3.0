import type { GetQueryResponse } from "src/api/types";
import type { LevelType, ICourseProps } from "src/types/course";

import { compact } from "lodash-es";
import { useQuery } from "@tanstack/react-query";

import { getData } from "src/api/utils";

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

type ILesson = {
  slug: string;
  translated_name: string;
  points: number;
  type: "reading" | "video" | "quiz" | "coding";
  progress?: number;
  earned_points?: number | null;
};

type IChapter = {
  slug: string;
  translated_name: string;
  translated_description: string;
  lessons: ILesson[];
  progress?: number;
};

type IPrerequisite = {
  slug: string;
  translated_name: string;
};

type ICourse = {
  slug: string;
  translated_name: string;
  translated_description: string;
  translated_overview: string;
  level: ILevel;
  category: ICategory;
  technology: ITechnology;
  instructors: IInstructor[];
  lessons_count: number;
  duration: number;
  chat_url: string | null;
  points: number;
  reading_count: number;
  video_count: number;
  quiz_count: number;
  coding_count: number;
  average_rating: number | null;
  ratings_count: number;
  students_count: number;
  chapters: IChapter[];
  prerequisites: IPrerequisite[];
  progress?: number;
  reviewed?: boolean;
};

export const courseQuery = (slug: string) => {
  const url = endpoint;
  const queryUrl = `${url}/${slug}`;

  const queryFn = async (): Promise<GetQueryResponse<ICourseProps>> => {
    const { data } = await getData<ICourse>(queryUrl);
    const {
      translated_name,
      translated_description,
      translated_overview,
      level,
      category,
      technology,
      instructors,
      lessons_count,
      duration,
      chat_url,
      points,
      reading_count,
      video_count,
      quiz_count,
      coding_count,
      average_rating,
      ratings_count,
      students_count,
      chapters,
      prerequisites,
      progress,
      reviewed,
      ...rest
    }: ICourse = data;

    const modifiedResults: ICourseProps = {
      ...rest,
      name: translated_name,
      description: translated_description,
      overview: translated_overview,
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
      totalLessons: lessons_count,
      totalReading: reading_count,
      totalVideos: video_count,
      totalQuizzes: quiz_count,
      totalExercises: coding_count,
      totalHours: duration / 60,
      chatUrl: chat_url,
      totalPoints: points,
      ratingNumber: average_rating,
      totalReviews: ratings_count,
      totalStudents: students_count,
      chapters: chapters.map(
        ({
          translated_name: chapterName,
          translated_description: chapterDescription,
          lessons,
          progress: chapterProgress,
          ...restChapter
        }) => ({
          ...restChapter,
          name: chapterName,
          description: chapterDescription,
          lessons: lessons.map(
            ({
              translated_name: lessonName,
              points: lessonPoints,
              progress: lessonProgress,
              earned_points,
              ...restLesson
            }) => ({
              ...restLesson,
              name: lessonName,
              totalPoints: lessonPoints,
              progress: lessonProgress ?? null,
              earnedPoints: earned_points ?? null,
            })
          ),
          progress: chapterProgress ?? null,
        })
      ),
      prerequisites: prerequisites.map(
        ({ translated_name: prerequisiteName, ...restPrerequisite }) => ({
          ...restPrerequisite,
          name: prerequisiteName,
        })
      ),
      progress: progress ?? null,
      reviewed: reviewed ?? null,
    };
    return { results: modifiedResults };
  };

  return { url, queryFn, queryKey: compact([url, slug]) };
};

export const useCourse = (slug: string, enabled: boolean = true) => {
  const { queryKey, queryFn } = courseQuery(slug);
  const { data, ...rest } = useQuery({ queryKey, queryFn, enabled });
  return { data: data?.results, ...rest };
};
