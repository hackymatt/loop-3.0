import type { IProjectSubstepType } from "./project";

// ----------------------------------------------------------------------

type ISubstepBaseProps = {
  type: IProjectSubstepType;
  name: string;
  totalPoints: number;
};

export type ISubstepProps = ISubstepBaseProps & { text: string; duration: number };
