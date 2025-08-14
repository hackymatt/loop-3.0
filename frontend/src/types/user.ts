import type { JOIN_TYPE, USER_TYPE } from "src/consts/user";

import type { PlanType } from "./plan";
import type { IProjectListProps } from "./project";
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
  tokens: number;
  totalPoints: number;
  dailyStreak: number;
  projects: IProjectListProps[];
  certificates: ICertificateProps[];
  user: {
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    userType: UserType;
    joinType: JoinType;
    isActive: boolean;
    plan: {
      type: PlanType;
      license: string;
    };
  };
};
