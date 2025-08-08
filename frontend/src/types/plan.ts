import type { Currency } from "src/locales/types";
import type { PLAN_TYPE, PLAN_INTERVAL } from "src/consts/plan";

// ----------------------------------------------------------------------

export type PlanType = (typeof PLAN_TYPE)[keyof typeof PLAN_TYPE];

export type PlanInterval = (typeof PLAN_INTERVAL)[keyof typeof PLAN_INTERVAL];

export type IPlanPricingProp = {
  currency: Currency;
  monthly: number;
  yearly: number;
};

type IPlanOptionProp = {
  title: string;
  disabled: boolean;
};

export type IPlanProps = {
  slug: PlanType;
  tokensLimit: number;
  license: string;
  popular: boolean;
  premium: boolean;
  pricing: IPlanPricingProp[];
  options: IPlanOptionProp[];
};
