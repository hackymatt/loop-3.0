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

type IStep = {
  slug: string;
  translated_name: string;
  points: number;
  progress?: number;
};

type IStage = {
  slug: string;
  translated_name: string;
  translated_description: string;
  steps: IStep[];
  progress?: number;
};

type IPrerequisite = {
  slug: string;
  translated_name: string;
};

type ITag = {
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
  stages_count: number;
  duration: number;
  video_url: string | null;
  points: number;
  average_rating: number | null;
  ratings_count: number;
  students_count: number;
  stages: IStage[];
  project_prerequisites: IPrerequisite[];
  blog_prerequisites: IPrerequisite[];
  tags: ITag[];
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
      stages_count,
      duration,
      video_url,
      points,
      average_rating,
      ratings_count,
      students_count,
      stages,
      project_prerequisites,
      blog_prerequisites,
      tags,
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
      tags: tags.map((tag) => ({
        slug: tag.slug,
        name: tag.translated_name,
      })),
      teachers: instructors.map(({ full_name, image, ...restInstructor }) => ({
        ...restInstructor,
        name: full_name,
        avatarUrl: image,
      })),
      totalStages: stages_count,
      totalHours: duration / 60,
      videoUrl: video_url,
      totalPoints: points,
      ratingNumber: average_rating,
      totalReviews: ratings_count,
      totalStudents: students_count,
      stages: stages.map(
        ({
          translated_name: stageName,
          translated_description: stageDescription,
          steps,
          progress: stageProgress,
          ...restStage
        }) => ({
          ...restStage,
          name: stageName,
          description: stageDescription,
          steps: steps.map(
            ({
              translated_name: stepName,
              points: stepPoints,
              progress: stepProgress,
              ...restStep
            }) => ({
              ...restStep,
              name: stepName,
              totalPoints: stepPoints,
              progress: stepProgress ?? null,
            })
          ),
          progress: stageProgress ?? null,
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
