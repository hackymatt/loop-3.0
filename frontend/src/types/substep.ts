import type { QUIZ_TYPE } from "src/consts/substep";

import type { IProjectSubstepType } from "./project";

// ----------------------------------------------------------------------

type ISubstepBaseProps = {
  type: IProjectSubstepType;
  name: string;
  totalPoints: number;
};

export type IReadingSubstepProps = ISubstepBaseProps & { text: string; duration: number };

export type IVideoSubstepProps = ISubstepBaseProps & { videoUrl: string };

type IQuizType = (typeof QUIZ_TYPE)[keyof typeof QUIZ_TYPE];
type IQuizQuestionOptionProp = { text: string };
type IQuizQuestionProp = { text: string; options: IQuizQuestionOptionProp[] };
export type IQuizSubstepProps = ISubstepBaseProps & {
  quizType: IQuizType;
  question: IQuizQuestionProp;
  answer: boolean[] | null;
};

export type ICodingFileProp = { name: string; path: string; code: string };

export type ICodingSubstepProps = ISubstepBaseProps & {
  technology: string;
  timeout: number;
  introduction: string;
  instructions: string;
  penaltyPoints: number;
  file: ICodingFileProp;
  files: ICodingFileProp[];
  command: string;
  hint: string | null;
  answer: string | null;
};

export type IConfigProp = Pick<ICodingSubstepProps, "technology" | "files" | "command" | "timeout">;
