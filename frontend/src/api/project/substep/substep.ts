import type { GetQueryResponse } from "src/api/types";
import type {
  IQuizSubstepProps,
  IVideoSubstepProps,
  ICodingSubstepProps,
  IReadingSubstepProps,
} from "src/types/substep";

import { compact } from "lodash-es";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { URLS } from "src/api/urls";
import { getData } from "src/api/utils";

const endpoint = URLS.LESSON;

type IBaseSubstep = {
  type: "reading" | "video" | "quiz" | "coding";
  name: string;
  points: number;
};

type IReadingSubstep = {
  text: string;
  duration: number;
};

type IVideoSubstep = {
  video_url: string;
};

type IQuizSubstepQuestionOption = {
  text: string;
};

type IQuizSubstepQuestion = {
  text: string;
  options: IQuizSubstepQuestionOption[];
};

type IQuizSubstep = {
  quiz_type: "single" | "multi";
  question: IQuizSubstepQuestion;
  answer?: boolean[];
};

type ICodingSubstepFile = {
  name: string;
  path: string;
  code: string;
};

type ICodingSubstep = {
  technology: string;
  timeout: number;
  command: string;
  file: ICodingSubstepFile;
  files: ICodingSubstepFile[];
  introduction: string;
  instructions: string;
  penalty_points: number;
  hint?: string;
  answer?: string;
};

type ISubstep = IBaseSubstep & (IReadingSubstep | IVideoSubstep | IQuizSubstep | ICodingSubstep);

const substepMapper = {
  reading: (props: ISubstep): IReadingSubstepProps => ({
    type: "reading",
    name: props.name,
    totalPoints: props.points,
    text: (props as IReadingSubstep).text,
    duration: (props as IReadingSubstep).duration,
  }),

  video: (props: ISubstep): IVideoSubstepProps => ({
    type: "video",
    name: props.name,
    totalPoints: props.points,
    videoUrl: (props as IVideoSubstep).video_url,
  }),

  quiz: (props: ISubstep): IQuizSubstepProps => {
    const { quiz_type, answer, ...quizRest } = props as IQuizSubstep;
    return {
      type: "quiz",
      name: props.name,
      totalPoints: props.points,
      quizType: quiz_type,
      question: quizRest.question,
      answer: answer ?? null,
    };
  },

  coding: (props: ISubstep): ICodingSubstepProps => {
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
    } = props as ICodingSubstep;

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

export const substepQuery = (projectSlug: string, stepSlug: string, substepSlug: string) => {
  const url = endpoint;
  const queryUrl = `${url}/${projectSlug}/${stepSlug}/${substepSlug}`;

  const queryFn = async (): Promise<
    GetQueryResponse<
      IReadingSubstepProps | IVideoSubstepProps | IQuizSubstepProps | ICodingSubstepProps
    >
  > => {
    const { data, error } = await getData<ISubstep>(queryUrl);

    const mapped = substepMapper[data.type](data);

    return {
      results: mapped,
      error,
    };
  };

  return { url, queryFn, queryKey: compact([url, projectSlug, substepSlug]) };
};

export const useSubstep = (
  projectSlug: string,
  stepSlug: string,
  substepSlug: string,
  enabled: boolean = true
) => {
  const queryClient = useQueryClient();

  const { queryKey, queryFn } = substepQuery(projectSlug, stepSlug, substepSlug);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data, error, ...rest } = useQuery({
    queryKey,
    queryFn,
    enabled,
    onSuccess: () => {
      queryClient.invalidateQueries([URLS.PROJECTS]);
      queryClient.invalidateQueries([URLS.DASHBOARD]);
    },
  });

  return {
    data: data?.results,
    error: data?.error,
    ...rest,
  };
};
