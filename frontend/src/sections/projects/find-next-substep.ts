import type { IProjectStepProp, IProjectSubstepProp } from "src/types/project";

type ReturnType = {
  step: IProjectStepProp | undefined;
  substep: IProjectSubstepProp | null;
};

export function findNextSubstep(steps: IProjectStepProp[]): ReturnType {
  const stepWithNextSubstep = steps.find((step) =>
    step.substeps.some((substep) => substep.progress === 0)
  );

  return {
    step: stepWithNextSubstep,
    substep: stepWithNextSubstep?.substeps.find((substep) => substep.progress === 0) || null,
  };
}
