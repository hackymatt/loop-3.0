import type { JoinType, UserType } from "src/types/user";
import type { Currency, PlanType, PlanInterval } from "src/types/plan";

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
  plan: { type: PlanType; currency: string | null; interval: string | null };
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
