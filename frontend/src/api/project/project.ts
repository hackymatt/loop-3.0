import type { Language } from "src/locales/types";
import type { GetQueryResponse } from "src/api/types";
import type { LevelType, IProjectProps } from "src/types/project";

import { compact } from "lodash-es";
import { cookies } from "next/headers";

import { getData } from "src/api/utils";

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

type ISubstep = {
  slug: string;
  translated_name: string;
  points: number;
  type: "reading" | "video" | "quiz" | "coding";
  progress?: number;
  earned_points?: number | null;
};

type IStep = {
  slug: string;
  translated_name: string;
  translated_description: string;
  substeps: ISubstep[];
  progress?: number;
};

type IPrerequisite = {
  slug: string;
  translated_name: string;
};

type IProject = {
  slug: string;
  translated_name: string;
  translated_description: string;
  translated_overview: string;
  level: ILevel;
  category: ICategory;
  technologies: ITechnology[];
  instructors: IInstructor[];
  substeps_count: number;
  duration: number;
  chat_url: string | null;
  video_url: string | null;
  points: number;
  reading_count: number;
  video_count: number;
  quiz_count: number;
  coding_count: number;
  average_rating: number | null;
  ratings_count: number;
  students_count: number;
  steps: IStep[];
  project_prerequisites: IPrerequisite[];
  blog_prerequisites: IPrerequisite[];
  progress?: number;
  reviewed?: boolean;
};

export const projectQuery = (language: Language, slug: string) => {
  const url = endpoint;
  const queryUrl = `${url}/${slug}`;

  const queryFn = async (): Promise<GetQueryResponse<IProjectProps>> => {
    const { data } = await getData<IProject>(queryUrl, {
      headers: { "Accept-Language": language, Cookie: cookies().toString() },
    });
    const {
      translated_name,
      translated_description,
      translated_overview,
      level,
      category,
      technologies,
      instructors,
      substeps_count,
      duration,
      chat_url,
      video_url,
      points,
      reading_count,
      video_count,
      quiz_count,
      coding_count,
      average_rating,
      ratings_count,
      students_count,
      steps,
      project_prerequisites,
      blog_prerequisites,
      progress,
      reviewed,
      ...rest
    }: IProject = data;

    const modifiedResults: IProjectProps = {
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
      technologies: technologies.map((technology: ITechnology) => ({
        slug: technology.slug,
        name: technology.name,
      })),
      teachers: instructors.map(({ full_name, image, ...restInstructor }) => ({
        ...restInstructor,
        name: full_name,
        avatarUrl: image,
      })),
      totalSubsteps: substeps_count,
      totalReading: reading_count,
      totalVideos: video_count,
      totalQuizzes: quiz_count,
      totalExercises: coding_count,
      totalHours: duration / 60,
      chatUrl: chat_url,
      videoUrl: video_url,
      totalPoints: points,
      ratingNumber: average_rating,
      totalReviews: ratings_count,
      totalStudents: students_count,
      steps: steps.map(
        ({
          translated_name: stepName,
          translated_description: stepDescription,
          substeps,
          progress: stepProgress,
          ...restStep
        }) => ({
          ...restStep,
          name: stepName,
          description: stepDescription,
          substeps: substeps.map(
            ({
              translated_name: substepName,
              points: substepPoints,
              progress: substepProgress,
              earned_points,
              ...restSubstep
            }) => ({
              ...restSubstep,
              name: substepName,
              totalPoints: substepPoints,
              progress: substepProgress ?? null,
              earnedPoints: earned_points ?? null,
            })
          ),
          progress: stepProgress ?? null,
        })
      ),
      prerequisites: [
        ...blog_prerequisites.map(({ translated_name: prerequisiteName, ...restPrerequisite }) => ({
          ...restPrerequisite,
          name: prerequisiteName,
          type: "blog" as const,
        })),
        ...project_prerequisites.map(
          ({ translated_name: prerequisiteName, ...restPrerequisite }) => ({
            ...restPrerequisite,
            name: prerequisiteName,
            type: "project" as const,
          })
        ),
      ],
      progress: progress ?? null,
      reviewed: reviewed ?? null,
    };
    return { results: modifiedResults };
  };

  return { url, queryFn, queryKey: compact([url, slug]) };
};
