import type { IProjectStepProp, IProjectStageProp } from "src/types/project";

type ReturnType = {
  stage: IProjectStageProp | undefined;
  step: IProjectStepProp | null;
};

export function findNextStep(stages: IProjectStageProp[]): ReturnType {
  const stageWithNextStep = stages.find((stage) => stage.steps.some((step) => step.progress === 0));

  return {
    stage: stageWithNextStep,
    step: stageWithNextStep?.steps.find((step) => step.progress === 0) || null,
  };
}
