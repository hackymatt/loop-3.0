import type { JOIN_TYPE, USER_TYPE } from "src/consts/user";
import type { DatePickerFormat } from "src/utils/format-time";
import type { WALLET_TYPES, PAYMENT_METHODS } from "src/consts/payment";
import type { SUBSCRIPTION_RESULT, SUBSCRIPTION_STATUS } from "src/consts/subscription";

import type { IProjectListProps } from "./project";
import type { ICertificateProps } from "./certificate";
import type { Currency, PlanType, PlanInterval } from "./plan";

// ----------------------------------------------------------------------

export type UserType = (typeof USER_TYPE)[keyof typeof USER_TYPE];

export type JoinType = (typeof JOIN_TYPE)[keyof typeof JOIN_TYPE];

export type IPersonalDataProps = {
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  streetAddress: string | null;
  zipCode: string | null;
  city: string | null;
  country: string | null;
};

type IUserProps = {
  name: string;
  avatarUrl: string | null;
};

export type IStudentProps = IUserProps;

export type IInstructorProps = IUserProps & {
  role: string;
};

export type IUserPlan = {
  type: PlanType;
  currency: Currency | null;
  interval: PlanInterval | null;
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
      plan: IUserPlan;
      trialUsed: boolean;
      planLicense: string;
    };
    tokens: number;
    totalPoints: number;
    dailyStreak: number;
  };
};

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

export type SubscriptionResult = (typeof SUBSCRIPTION_RESULT)[keyof typeof SUBSCRIPTION_RESULT];

export type ISubscriptionProps = {
  type: PlanType;
  license: string;
  interval: PlanInterval | null;
  nextBillingDate: string | null;
  price: number | null;
  currency: Currency | null;
  isCancelAtPeriodEnd: boolean | null;
  status: SubscriptionStatus;
};

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];
export type WalletType = (typeof WALLET_TYPES)[keyof typeof WALLET_TYPES];

export type ICardProps = {
  brand: string;
  displayBrand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  holder: string;
  wallet: WalletType | null;
};

export type IPaypalProps = {
  payerEmail: string;
};

export type IPaymentMethodProps = {
  id: string;
  type: PaymentMethod;
  isDefault: boolean;
  details: ICardProps | IPaypalProps;
};

export type IInvoiceProps = {
  invoiceNumber: string;
  invoiceDate: DatePickerFormat;
  currency: Currency;
  amount: number;
  url: string;
};
