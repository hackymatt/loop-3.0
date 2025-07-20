import type { LEVEL_TYPE } from "src/consts/level";
import type { LESSON_TYPE } from "src/consts/substep";

import type { IInstructorProps } from "./user";

// ----------------------------------------------------------------------

export type LevelType = (typeof LEVEL_TYPE)[keyof typeof LEVEL_TYPE];

export type IProjectLevelProp = {
  slug: LevelType;
  name: string;
};

export type IProjectTechnologyProp = {
  slug: string;
  name: string;
};

export type IProjectCategoryProp = {
  slug: string;
  name: string;
};

export type IProjectStatusProp = {
  slug: string;
  name: string;
};

export type IProjectDurationProp = {
  slug: string;
  name: string;
};

export type IProjectTeacherProp = IInstructorProps;

export type IProjectSubstepType = (typeof LESSON_TYPE)[keyof typeof LESSON_TYPE];

export type IProjectSubstepProp = {
  slug: string;
  name: string;
  type: IProjectSubstepType;
  totalPoints: number;
  progress: number | null;
  earnedPoints: number | null;
};

export type IProjectStepProp = {
  slug: string;
  name: string;
  description: string;
  substeps: IProjectSubstepProp[];
  progress: number | null;
};

type IProjectBaseProps = {
  slug: string;
  name: string;
  description: string;
  level: IProjectLevelProp;
  category: IProjectCategoryProp;
  technologies: IProjectTechnologyProp[];
  teachers: IProjectTeacherProp[];
  totalHours: number;
  // calculated
  totalStages: number;
  ratingNumber: number | null;
  totalReviews: number;
  totalStudents: number;
  progress: number | null;
};

export type IPrerequisite = Pick<IProjectBaseProps, "slug" | "name"> & { type: "project" | "blog" };

export type IProjectListProps = IProjectBaseProps;

export type IProjectProps = IProjectBaseProps & {
  overview: string;
  steps: IProjectStepProp[];
  prerequisites: IPrerequisite[];
  totalPoints: number;
  totalReading: number;
  totalVideos: number;
  totalQuizzes: number;
  totalExercises: number;
  chatUrl: string | null;
  videoUrl: string | null;
  reviewed: boolean | null;
};
