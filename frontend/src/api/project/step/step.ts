import type { IStepProps } from "src/types/step";
import type { Language } from "src/locales/types";
import type { GetQueryResponse } from "src/api/types";

import { compact } from "lodash-es";
import { cookies } from "next/headers";

import { URLS } from "src/api/urls";
import { getData } from "src/api/utils";

const endpoint = URLS.STEP;

type IStep = {
  name: string;
  points: number;
  text: string;
  duration: number;
};

export const stepQuery = (
  language: Language,
  projectSlug: string,
  stageSlug: string,
  stepSlug: string
) => {
  const url = endpoint;
  const queryUrl = `${url}/${projectSlug}/${stageSlug}/${stepSlug}`;

  const queryFn = async (): Promise<GetQueryResponse<IStepProps>> => {
    const { data, error } = await getData<IStep>(queryUrl, {
      headers: { "Accept-Language": language, Cookie: cookies().toString() },
    });

    const { points, ...rest } = data;

    return {
      results: { ...rest, totalPoints: points },
      error,
    };
  };

  return { url, queryFn, queryKey: compact([url, projectSlug, stageSlug, stepSlug]) };
};
