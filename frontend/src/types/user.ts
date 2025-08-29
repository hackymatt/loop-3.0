import type { JOIN_TYPE, USER_TYPE } from "src/consts/user";
import type { DatePickerFormat } from "src/utils/format-time";
import type { SUBSCRIPTION_STATUS } from "src/consts/subscription";

import type { IProjectListProps } from "./project";
import type { ICertificateProps } from "./certificate";
import type { Currency, PlanType, PlanInterval } from "./plan";

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
  projects: IProjectListProps[];
  certificates: ICertificateProps[];
  profile: {
    user: {
      email: string;
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
      userType: UserType;
      joinType: JoinType;
      isActive: boolean;
      planType: PlanType;
      planLicense: string;
    };
    tokens: number;
    totalPoints: number;
    dailyStreak: number;
  };
};

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

export type ISubscriptionProps = {
  type: PlanType;
  license: string;
  interval: PlanInterval | null;
  nextBillingDate: string | null;
  price: number | null;
  currency: Currency | null;
  isAutoRenew: boolean | null;
  status: SubscriptionStatus;
};

export type IInvoiceProps = {
  invoiceNumber: string;
  invoiceDate: DatePickerFormat;
  currency: Currency;
  amount: number;
  url: string;
};
