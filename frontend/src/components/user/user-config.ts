import { CURRENCY, PLAN_TYPE } from "src/consts/plan";
import { JOIN_TYPE, USER_TYPE } from "src/consts/user";

import type { UserState } from "./types";

// ----------------------------------------------------------------------

export const USER_STORAGE_KEY: string = "user";

export const defaultUser: UserState = {
  email: null,
  firstName: null,
  lastName: null,
  avatarUrl: null,
  userType: USER_TYPE.STUDENT,
  joinType: JOIN_TYPE.EMAIL,
  isActive: false,
  isLoggedIn: false,
  plan: {
    type: PLAN_TYPE.FREE,
    license: "",
    interval: null,
    valid_to: null,
    price: null,
    currency: CURRENCY.PLN,
  },
  redirect: null,
};
