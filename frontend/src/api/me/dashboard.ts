import type { PlanType } from "src/types/plan";
import type { Language } from "src/locales/types";
import type { LevelType } from "src/types/project";
import type { GetQueryResponse } from "src/api/types";
import type { IDashboardProps } from "src/types/user";

import { compact } from "lodash-es";
import { cookies } from "next/headers";

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
  technologies: ITechnology[];
  instructors: IInstructor[];
  duration: number;
  stages_count: number;
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

type IPlan = {
  type: "free" | "basic" | "premium";
  license: string;
};

type IUser = {
  email: string;
  first_name: string;
  last_name: string;
  image: string | null;
  user_type: "admin" | "instructor" | "student";
  join_type: "email" | "google" | "facebook" | "github";
  is_active: boolean;
  plan: IPlan;
};

type IDashboard = {
  tokens: number;
  total_points: number;
  daily_streak: number;
  projects: IProject[];
  certificates: ICertificate[];
  user: IUser;
};

export const dashboardQuery = (language: Language) => {
  const url = endpoint;
  const queryUrl = url;

  const queryFn = async (): Promise<GetQueryResponse<IDashboardProps>> => {
    const { data } = await getData<IDashboard>(queryUrl, {
      headers: { "Accept-Language": language, Cookie: cookies().toString() },
    });

    const { total_points, daily_streak, projects, certificates, user, ...rest } = data;

    const modifiedResult: IDashboardProps = {
      ...rest,
      totalPoints: total_points,
      dailyStreak: daily_streak,
      projects: projects.map(
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
          ...restProject
        }: IProject) => ({
          ...restProject,
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
      ),
      certificates: certificates.map(
        ({ student_name, project_name, completed_at, ...restCertificate }: ICertificate) => ({
          ...restCertificate,
          studentName: student_name,
          projectName: project_name,
          completedAt: completed_at,
        })
      ),
      user: {
        ...user,
        avatarUrl: user.image,
        firstName: user.first_name,
        lastName: user.last_name,
        isActive: user.is_active,
        joinType: user.join_type,
        userType: user.user_type,
        plan: { ...user.plan, type: user.plan.type as PlanType },
      },
    };

    return { results: modifiedResult };
  };

  return { url, queryFn, queryKey: compact([url]) };
};
