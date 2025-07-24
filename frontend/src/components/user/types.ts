import type { JoinType, UserType } from "src/types/user";
import type { DatePickerFormat } from "src/utils/format-time";
import type { PlanType, PlanInterval, CurrencyType } from "src/types/plan";

// ----------------------------------------------------------------------

export type UserState = {
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  userType: UserType;
  joinType: JoinType;
  isActive: boolean;
  isLoggedIn: boolean;
  plan: {
    type: PlanType;
    license: string;
    interval: PlanInterval | null;
    valid_to: DatePickerFormat | null;
    price: number | null;
    currency: CurrencyType;
  };
  redirect: string | null;
};

export type UserContextValue = {
  state: UserState;
  setState: (updateValue: Partial<UserState>) => void;
  setField: (name: keyof UserState, updateValue: UserState[keyof UserState]) => void;
  resetState: () => void;
};

export type UserProviderProps = {
  cookieUser?: UserState;
  defaultUser: UserState;
  children: React.ReactNode;
  storageKey?: string;
};
