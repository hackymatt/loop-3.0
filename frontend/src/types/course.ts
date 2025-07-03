import type { LEVEL_TYPE } from "src/consts/level";
import type { LESSON_TYPE } from "src/consts/lesson";

import type { IInstructorProps } from "./user";

// ----------------------------------------------------------------------

export type LevelType = (typeof LEVEL_TYPE)[keyof typeof LEVEL_TYPE];

export type ICourseLevelProp = {
  slug: LevelType;
  name: string;
};

export type ICourseTechnologyProp = {
  slug: string;
  name: string;
};

export type ICourseCategoryProp = {
  slug: string;
  name: string;
};

export type ICourseStatusProp = {
  slug: string;
  name: string;
};

export type ICourseTeacherProp = IInstructorProps;

export type ICourseLessonType = (typeof LESSON_TYPE)[keyof typeof LESSON_TYPE];

export type ICourseLessonProp = {
  slug: string;
  name: string;
  type: ICourseLessonType;
  totalPoints: number;
  progress: number | null;
  earnedPoints: number | null;
};

export type ICourseChapterProp = {
  slug: string;
  name: string;
  description: string;
  lessons: ICourseLessonProp[];
  progress: number | null;
};

type ICourseBaseProps = {
  slug: string;
  name: string;
  description: string;
  level: ICourseLevelProp;
  category: ICourseCategoryProp;
  technology: ICourseTechnologyProp;
  teachers: ICourseTeacherProp[];
  totalHours: number;
  // calculated
  totalLessons: number;
  ratingNumber: number | null;
  totalReviews: number;
  totalStudents: number;
  progress: number | null;
};

export type ICoursePrerequisite = Pick<ICourseBaseProps, "slug" | "name">;

export type ICourseListProps = ICourseBaseProps;

export type ICourseProps = ICourseBaseProps & {
  overview: string;
  chapters: ICourseChapterProp[];
  prerequisites: ICoursePrerequisite[];
  totalPoints: number;
  totalReading: number;
  totalVideos: number;
  totalQuizzes: number;
  totalExercises: number;
  chatUrl: string | null;
  reviewed: boolean | null;
};
