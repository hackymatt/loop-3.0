import type { LEVEL_TYPE } from "src/consts/level";

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

export type IProjectStepProp = {
  slug: string;
  name: string;
  totalPoints: number;
  progress: number | null;
};

export type IProjectStageProp = {
  slug: string;
  name: string;
  description: string;
  steps: IProjectStepProp[];
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
  stages: IProjectStageProp[];
  prerequisites: IPrerequisite[];
  totalPoints: number;
  chatUrl: string | null;
  videoUrl: string | null;
  reviewed: boolean | null;
};
