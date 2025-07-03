import type { GetQueryResponse } from "src/api/types";
import type {
  IQuizLessonProps,
  IVideoLessonProps,
  ICodingLessonProps,
  IReadingLessonProps,
} from "src/types/lesson";

import { compact } from "lodash-es";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { URLS } from "src/api/urls";
import { getData } from "src/api/utils";

const endpoint = URLS.LESSON;

type IBaseLesson = {
  type: "reading" | "video" | "quiz" | "coding";
  name: string;
  points: number;
};

type IReadingLesson = {
  text: string;
  duration: number;
};

type IVideoLesson = {
  video_url: string;
};

type IQuizLessonQuestionOption = {
  text: string;
};

type IQuizLessonQuestion = {
  text: string;
  options: IQuizLessonQuestionOption[];
};

type IQuizLesson = {
  quiz_type: "single" | "multi";
  question: IQuizLessonQuestion;
  answer?: boolean[];
};

type ICodingLessonFile = {
  name: string;
  path: string;
  code: string;
};

type ICodingLesson = {
  technology: string;
  timeout: number;
  command: string;
  file: ICodingLessonFile;
  files: ICodingLessonFile[];
  introduction: string;
  instructions: string;
  penalty_points: number;
  hint?: string;
  answer?: string;
};

type ILesson = IBaseLesson & (IReadingLesson | IVideoLesson | IQuizLesson | ICodingLesson);

const lessonMapper = {
  reading: (props: ILesson): IReadingLessonProps => ({
    type: "reading",
    name: props.name,
    totalPoints: props.points,
    text: (props as IReadingLesson).text,
    duration: (props as IReadingLesson).duration,
  }),

  video: (props: ILesson): IVideoLessonProps => ({
    type: "video",
    name: props.name,
    totalPoints: props.points,
    videoUrl: (props as IVideoLesson).video_url,
  }),

  quiz: (props: ILesson): IQuizLessonProps => {
    const { quiz_type, answer, ...quizRest } = props as IQuizLesson;
    return {
      type: "quiz",
      name: props.name,
      totalPoints: props.points,
      quizType: quiz_type,
      question: quizRest.question,
      answer: answer ?? null,
    };
  },

  coding: (props: ILesson): ICodingLessonProps => {
    const {
      technology,
      timeout,
      command,
      file,
      files,
      introduction,
      instructions,
      penalty_points,
      hint,
      answer,
    } = props as ICodingLesson;

    return {
      type: "coding",
      name: props.name,
      totalPoints: props.points,
      technology,
      command,
      timeout,
      file,
      files,
      introduction,
      instructions,
      penaltyPoints: penalty_points,
      hint: hint ?? null,
      answer: answer ?? null,
    };
  },
};

export const lessonQuery = (courseSlug: string, chapterSlug: string, lessonSlug: string) => {
  const url = endpoint;
  const queryUrl = `${url}/${courseSlug}/${chapterSlug}/${lessonSlug}`;

  const queryFn = async (): Promise<
    GetQueryResponse<
      IReadingLessonProps | IVideoLessonProps | IQuizLessonProps | ICodingLessonProps
    >
  > => {
    const { data, error } = await getData<ILesson>(queryUrl);

    const mapped = lessonMapper[data.type](data);

    return {
      results: mapped,
      error,
    };
  };

  return { url, queryFn, queryKey: compact([url, courseSlug, lessonSlug]) };
};

export const useLesson = (
  courseSlug: string,
  chapterSlug: string,
  lessonSlug: string,
  enabled: boolean = true
) => {
  const queryClient = useQueryClient();

  const { queryKey, queryFn } = lessonQuery(courseSlug, chapterSlug, lessonSlug);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data, error, ...rest } = useQuery({
    queryKey,
    queryFn,
    enabled,
    onSuccess: () => {
      queryClient.invalidateQueries([URLS.COURSES]);
      queryClient.invalidateQueries([URLS.DASHBOARD]);
    },
  });

  return {
    data: data?.results,
    error: data?.error,
    ...rest,
  };
};
