import type { LevelType } from "src/types/project";
import type { GetQueryResponse } from "src/api/types";
import type { IDashboardProps } from "src/types/user";

import { compact } from "lodash-es";
import { useQuery } from "@tanstack/react-query";

import { getData } from "src/api/utils";

import { URLS } from "../urls";

const endpoint = URLS.DASHBOARD;

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
  technology: ITechnology;
  instructors: IInstructor[];
  duration: number;
  substeps_count: number;
  average_rating: number | null;
  ratings_count: number;
  students_count: number;
  progress?: number;
};

type ICertificate = {
  id: string;
  student_name: string;
  project_name: string;
  completed_at: string;
};

type IDashboard = {
  total_points: number;
  daily_streak: number;
  projects: IProject[];
  certificates: ICertificate[];
};

export const dashboardQuery = () => {
  const url = endpoint;
  const queryUrl = url;

  const queryFn = async (): Promise<GetQueryResponse<IDashboardProps>> => {
    const { data } = await getData<IDashboard>(queryUrl);

    const { total_points, daily_streak, projects, certificates } = data;

    const modifiedResult: IDashboardProps = {
      totalPoints: total_points,
      dailyStreak: daily_streak,
      projects: projects.map(
        ({
          translated_name,
          translated_description,
          level,
          category,
          technology,
          instructors,
          duration,
          substeps_count,
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
          totalSubsteps: substeps_count,
          ratingNumber: average_rating,
          totalReviews: ratings_count,
          totalStudents: students_count,
          progress: progress ?? null,
        })
      ),
      certificates: certificates.map(
        ({ student_name, project_name, completed_at, ...rest }: ICertificate) => ({
          ...rest,
          studentName: student_name,
          projectName: project_name,
          completedAt: completed_at,
        })
      ),
    };

    return { results: modifiedResult };
  };

  return { url, queryFn, queryKey: compact([url]) };
};

export const useDashboard = (enabled: boolean = true) => {
  const { queryKey, queryFn } = dashboardQuery();
  const { data, ...rest } = useQuery({ queryKey, queryFn, enabled });
  return {
    data: data?.results,
    ...rest,
  };
};
