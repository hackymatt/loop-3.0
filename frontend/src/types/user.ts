import type { JOIN_TYPE, USER_TYPE } from "src/consts/user";

import type { ICourseListProps } from "./course";
import type { ICertificateProps } from "./certificate";

// ----------------------------------------------------------------------

export type UserType = (typeof USER_TYPE)[keyof typeof USER_TYPE];

export type JoinType = (typeof JOIN_TYPE)[keyof typeof JOIN_TYPE];

type IUserProps = {
  name: string;
  avatarUrl: string | null;
};

export type IStudentProps = IUserProps;

export type IInstructorProps = IUserProps & {
  role: string;
};

export type IDashboardProps = {
  totalPoints: number;
  dailyStreak: number;
  courses: ICourseListProps[];
  certificates: ICertificateProps[];
};
