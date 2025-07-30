import type { PlanType } from "src/types/plan";

import { PLAN_TYPE } from "src/consts/plan";

import { getPlanIcon } from "./plan-icon";

describe("getPlanIcon", () => {
  // Returns the correct icon for FREE plan type
  it("should return FREE_ICON when plan is FREE", () => {
    const result = getPlanIcon(PLAN_TYPE.FREE);
    expect(result).toBe("ic-plan-box-basic.svg");
  });

  // Returns the correct icon for BASIC plan type
  it("should return BASIC_ICON when plan is BASIC", () => {
    const result = getPlanIcon(PLAN_TYPE.BASIC);
    expect(result).toBe("ic-plan-box-starter.svg");
  });

  // Returns FREE_ICON when passed an undefined plan
  it("should return FREE_ICON when plan is undefined", () => {
    const result = getPlanIcon(undefined as unknown as PlanType);
    expect(result).toBe("ic-plan-box-basic.svg");
  });

  // Returns FREE_ICON when passed a null plan
  it("should return FREE_ICON when plan is null", () => {
    const result = getPlanIcon(null as unknown as PlanType);
    expect(result).toBe("ic-plan-box-basic.svg");
  });

  // Returns FREE_ICON when passed a plan type not in the PLAN_ICONS map
  it("should return FREE_ICON when plan is not in PLAN_ICONS map", () => {
    const invalidPlan = "ENTERPRISE" as unknown as PlanType;
    const result = getPlanIcon(invalidPlan);
    expect(result).toBe("ic-plan-box-basic.svg");
  });
});
