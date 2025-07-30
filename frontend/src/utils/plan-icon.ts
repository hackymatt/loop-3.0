import type { PlanType } from "src/types/plan";

import { PLAN_TYPE } from "src/consts/plan";

const FREE_ICON = "ic-plan-box-basic.svg";
const BASIC_ICON = "ic-plan-box-starter.svg";
const PREMIUM_ICON = "ic-plan-box-premium.svg";

const PLAN_ICONS = new Map<PlanType, string>([
  [PLAN_TYPE.FREE, FREE_ICON],
  [PLAN_TYPE.BASIC, BASIC_ICON],
  [PLAN_TYPE.PREMIUM, PREMIUM_ICON],
]);

export function getPlanIcon(plan: PlanType): string {
  return PLAN_ICONS.get(plan) ?? FREE_ICON;
}
