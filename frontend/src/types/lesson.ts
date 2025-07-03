import type { QUIZ_TYPE } from "src/consts/lesson";

import type { ICourseLessonType } from "./course";

// ----------------------------------------------------------------------

type ILessonBaseProps = {
  type: ICourseLessonType;
  name: string;
  totalPoints: number;
};

export type IReadingLessonProps = ILessonBaseProps & { text: string; duration: number };

export type IVideoLessonProps = ILessonBaseProps & { videoUrl: string };

type IQuizType = (typeof QUIZ_TYPE)[keyof typeof QUIZ_TYPE];
type IQuizQuestionOptionProp = { text: string };
type IQuizQuestionProp = { text: string; options: IQuizQuestionOptionProp[] };
export type IQuizLessonProps = ILessonBaseProps & {
  quizType: IQuizType;
  question: IQuizQuestionProp;
  answer: boolean[] | null;
};

export type ICodingFileProp = { name: string; path: string; code: string };

export type ICodingLessonProps = ILessonBaseProps & {
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

export type IConfigProp = Pick<ICodingLessonProps, "technology" | "files" | "command" | "timeout">;
